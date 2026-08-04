# --------------------------------------STEP 1: Extract Text from PDF------------------------------------------------------

import os
import fitz  # PyMuPDF
import logging
from typing import List, Dict
from dotenv import load_dotenv
from tqdm import tqdm
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

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
    def __init__(self):
        """Initialize the document processor with Pinecone and embedding model."""
        self.embedder = SentenceTransformer(EMBEDDING_MODEL)
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pc.Index(PINECONE_INDEX_NAME)

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file.
        
        Args:
            pdf_path (str): Path to the PDF file
            
        Returns:
            str: Extracted text from the PDF
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in tqdm(doc, desc="Extracting PDF text"):
                text += page.get_text("text") + "\n"
            doc.close()
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into smaller chunks with overlap using a generator to save memory.
        
        Args:
            text (str): Text to split
            chunk_size (int): Size of each chunk
            overlap (int): Number of characters to overlap between chunks
            
        Returns:
            List[str]: List of text chunks
        """
        chunks = []
        start = 0
        text_length = len(text)
        
        # Process chunks in smaller batches
        max_chunks_in_memory = 1000
        
        while start < text_length:
            end = start + chunk_size
            if end > text_length:
                end = text_length
            chunks.append(text[start:end])
            start = end - overlap
            
            # If we have accumulated enough chunks, yield them to Pinecone
            if len(chunks) >= max_chunks_in_memory:
                self.store_chunks_in_pinecone(chunks, f"batch_{start}", namespace="")
                chunks = []  # Clear the chunks list to free memory
        
        # Store any remaining chunks
        if chunks:
            self.store_chunks_in_pinecone(chunks, f"batch_final", namespace="")
        
        return chunks

    def store_chunks_in_pinecone(self, chunks: List[str], doc_id: str, namespace: str = "") -> None:
        """Store text chunks in Pinecone with batching and error handling.
        
        Args:
            chunks (List[str]): List of text chunks
            doc_id (str): Unique identifier for the document
            namespace (str): Pinecone namespace
        """
        try:
            batch_size = 100
            for i in tqdm(range(0, len(chunks), batch_size), desc="Storing chunks"):
                batch = chunks[i:i + batch_size]
                vectors = []
                
                for j, chunk in enumerate(batch):
                    vector = self.embedder.encode(chunk).tolist()
                    chunk_id = f"{doc_id}_chunk{i+j}"
                    vectors.append((chunk_id, vector, {"text": chunk, "doc_id": doc_id}))
                
                self.index.upsert(vectors=vectors, namespace=namespace)
                
        except Exception as e:
            logger.error(f"Error storing chunks in Pinecone: {str(e)}")
            raise

    def query_pinecone(self, query_text: str, top_k: int = 3, 
                      score_threshold: float = 0.5, namespace: str = "") -> List[Dict]:
        """Search Pinecone for relevant text chunks.
        
        Args:
            query_text (str): Text to search for
            top_k (int): Number of results to return
            score_threshold (float): Minimum similarity score to include
            namespace (str): Pinecone namespace
            
        Returns:
            List[Dict]: Matching results above threshold
        """
        try:
            query_vector = self.embedder.encode(query_text).tolist()
            
            response = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                namespace=namespace
            )
            
            # Filter results by score threshold
            filtered_matches = [
                match for match in response["matches"] 
                if match["score"] >= score_threshold
            ]
            
            return filtered_matches
            
        except Exception as e:
            logger.error(f"Error querying Pinecone: {str(e)}")
            return []

    def process_pdf(self, pdf_path: str, namespace: str = "", chunk_size: int = 500, overlap: int = 50) -> None:
        """Process a PDF file end-to-end: extract, chunk, and store.
        
        Args:
            pdf_path (str): Path to the PDF file
            namespace (str): Pinecone namespace
            chunk_size (int): Size of each chunk
            overlap (int): Number of characters to overlap between chunks
        """
        try:
            # Generate a unique document ID from the filename
            doc_id = os.path.splitext(os.path.basename(pdf_path))[0]
            
            logger.info(f"Processing document: {doc_id}")
            
            # Extract text in chunks to save memory
            doc = fitz.open(pdf_path)
            total_pages = len(doc)
            
            accumulated_text = ""
            chunk_counter = 0
            
            for page_num in tqdm(range(total_pages), desc="Processing PDF pages"):
                page = doc[page_num]
                page_text = page.get_text("text") + "\n"
                accumulated_text += page_text
                
                # Process text when we have enough for a reasonable chunk
                if len(accumulated_text) >= 10000:  # Process every 10KB of text
                    chunks = self.chunk_text(accumulated_text, chunk_size, overlap)
                    self.store_chunks_in_pinecone(chunks, f"{doc_id}_batch_{chunk_counter}", namespace)
                    chunk_counter += 1
                    accumulated_text = ""  # Reset accumulated text
            
            # Process any remaining text
            if accumulated_text:
                chunks = self.chunk_text(accumulated_text, chunk_size, overlap)
                self.store_chunks_in_pinecone(chunks, f"{doc_id}_batch_final", namespace)
            
            doc.close()
            logger.info(f"Successfully processed document with {chunk_counter + 1} batches")
            
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {str(e)}")
            raise

def main():
    """Main function to demonstrate usage."""
    processor = DocumentProcessor()
    
    # Example: Process a PDF
    pdf_path = "./DairyCattle_23_FINAL.pdf"
    # Use smaller chunk sizes for large documents
    processor.process_pdf(pdf_path, chunk_size=300, overlap=30)
    
    # Example: Query the knowledge base
    query = "What is the best feed for dairy cattle?"
    results = processor.query_pinecone(query)
    
    print("\n🔍 Query Results:")
    for i, match in enumerate(results):
        text_snippet = match["metadata"]["text"]
        formatted_text = text_snippet[:300] + "..." if len(text_snippet) > 300 else text_snippet
        print(f"\n🔹 Match {i+1}: Score {match['score']:.3f}")
        print(formatted_text)

if __name__ == "__main__":
    main()
