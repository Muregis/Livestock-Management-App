# --------------------------------------STEP 1: Extract Text from PDF------------------------------------------------------

import os
import fitz  # PyMuPDF
import logging
from typing import List, Dict
from dotenv import load_dotenv
from tqdm import tqdm
import time
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
import torch

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'agrivanna-knowledge')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'intfloat/multilingual-e5-large')

class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, overlap: int = 50, batch_size: int = 32):
        """Initialize with configurable parameters.
        
        Args:
            chunk_size (int): Size of text chunks (default: 500)
            overlap (int): Overlap between chunks (default: 50)
            batch_size (int): Batch size for processing (default: 32)
        """
        self.embedder = SentenceTransformer(EMBEDDING_MODEL)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.embedder.to(self.device)
        
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pc.Index(PINECONE_INDEX_NAME)
        
        # Store configuration
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.batch_size = batch_size
        logger.info(f"Initialized processor with chunk_size={chunk_size}, overlap={overlap}, batch_size={batch_size}")

    def process_pdf(self, pdf_path: str, namespace: str = "") -> None:
        """Process PDF in smaller batches to avoid memory issues."""
        start_time = time.time()
        doc_id = os.path.splitext(os.path.basename(pdf_path))[0]
        
        try:
            doc = fitz.open(pdf_path)
            total_pages = len(doc)
            logger.info(f"\n📚 Processing: {doc_id} ({total_pages} pages)")
            
            # Process text in smaller chunks (10KB each)
            current_text = ""
            total_chunks_processed = 0
            chunk_batch = []
            
            for page_num in tqdm(range(total_pages), desc="📄 Extracting text", unit="page"):
                page = doc[page_num]
                page_text = page.get_text("text") + "\n"
                current_text += page_text
                
                # Process when text reaches 10KB or on last page
                if len(current_text) >= 10000 or page_num == total_pages - 1:
                    logger.info(f"Processing batch of text: {len(current_text)} characters")
                    
                    # Create chunks from current text
                    new_chunks = self.create_chunks(current_text)
                    chunk_batch.extend(new_chunks)
                    logger.info(f"Created {len(new_chunks)} chunks from current batch")
                    
                    # Process chunks when batch is large enough
                    if len(chunk_batch) >= 100 or page_num == total_pages - 1:
                        logger.info(f"Processing batch of {len(chunk_batch)} chunks")
                        self.process_chunks(chunk_batch, doc_id, namespace)
                        total_chunks_processed += len(chunk_batch)
                        chunk_batch = []  # Reset batch
                        
                        # Clear GPU cache if available
                        if torch.cuda.is_available():
                            torch.cuda.empty_cache()
                    
                    current_text = ""  # Reset current text
                    
                # Log progress every 10 pages
                if (page_num + 1) % 10 == 0:
                    elapsed = time.time() - start_time
                    pages_per_sec = (page_num + 1) / elapsed
                    logger.info(f"Progress: {page_num + 1}/{total_pages} pages "
                              f"({pages_per_sec:.2f} pages/sec)")
            
            doc.close()
            elapsed = time.time() - start_time
            logger.info(f"✅ Processed {doc_id} ({total_chunks_processed} total chunks) "
                       f"in {elapsed:.2f} seconds")
            
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {str(e)}", exc_info=True)
            raise

    def create_chunks(self, text: str) -> List[str]:
        """Create chunks with progress tracking."""
        chunks = []
        start = 0
        text_length = len(text)
        
        with tqdm(total=text_length, desc="Creating chunks", unit="chars") as pbar:
            while start < text_length:
                end = min(start + self.chunk_size, text_length)
                chunk = text[start:end].strip()
                
                if chunk:  # Only add non-empty chunks
                    chunks.append(chunk)
                
                # Update progress
                pbar.update(end - start)
                start = end - self.overlap
        
        return chunks

    def process_chunks(self, chunks: List[str], doc_id: str, namespace: str):
        """Process chunks with detailed progress."""
        if not chunks:
            return
        
        total_chunks = len(chunks)
        logger.info(f"Processing {total_chunks} chunks in batches of {self.batch_size}")
        
        for i in tqdm(range(0, total_chunks, self.batch_size), desc="💾 Processing chunks"):
            batch = chunks[i:i + self.batch_size]
            
            # Generate embeddings
            embeddings = self.embedder.encode(
                batch,
                batch_size=self.batch_size,
                show_progress_bar=False,
                convert_to_tensor=True,
                device=self.device
            )
            
            # Prepare vectors
            vectors = [
                (f"{doc_id}_chunk_{i+j}", 
                 embedding.cpu().tolist(), 
                 {"text": chunk, "doc_id": doc_id, "chunk_index": i+j})
                for j, (chunk, embedding) in enumerate(zip(batch, embeddings))
            ]
            
            # Upload batch
            self.index.upsert(vectors=vectors, namespace=namespace)
            
            # Log progress
            logger.info(f"Processed batch {i//self.batch_size + 1}/{(total_chunks+self.batch_size-1)//self.batch_size}")

def main():
    """Process PDFs with progress tracking."""
    processor = DocumentProcessor()
    pdf_folder = os.path.join(os.path.dirname(__file__), "PDFs")
    pdfs = [
        os.path.join(pdf_folder, "DairyCattle_23_FINAL.pdf"),
        os.path.join(pdf_folder, "2023-Producer-Policy-Handbook.pdf")
    ]
    
    total_start = time.time()
    logger.info(f"🚀 Starting to process {len(pdfs)} PDFs")
    
    for pdf_path in pdfs:
        if not os.path.exists(pdf_path):
            logger.error(f"PDF not found: {pdf_path}")
            continue
            
        try:
            processor.process_pdf(pdf_path)
        except Exception as e:
            logger.error(f"Failed to process {pdf_path}: {e}")
    
    total_time = time.time() - total_start
    logger.info(f"✨ Completed all PDFs in {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
