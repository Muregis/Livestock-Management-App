import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
import logging
import torch
from torch import autocast
from contextlib import nullcontext

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'agrivanna-knowledge')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'intfloat/multilingual-e5-large')

class KnowledgeBase:
    def __init__(self):
        """Initialize the knowledge base query system."""
        self.embedder = SentenceTransformer(EMBEDDING_MODEL)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.embedder.to(self.device)
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pc.Index(PINECONE_INDEX_NAME)

    def query(self, question: str, top_k: int = 3) -> list:
        """Query the knowledge base.
        
        Args:
            question (str): The question to ask
            top_k (int): Number of results to return
            
        Returns:
            list: List of relevant answers with scores
        """
        try:
            # Generate embedding with GPU if available
            with torch.cuda.amp.autocast() if torch.cuda.is_available() else nullcontext():
                query_vector = self.embedder.encode(
                    question,
                    convert_to_tensor=True,
                    device=self.device
                ).cpu().tolist()
            
            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True
            )
            
            return results.matches
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return []

def main():
    """Interactive query interface."""
    kb = KnowledgeBase()
    
    print("\n🔍 Agrivanna Knowledge Base Query System")
    print("Type 'exit' to quit\n")
    
    while True:
        question = input("\nEnter your question: ")
        if question.lower() == 'exit':
            break
            
        results = kb.query(question)
        
        print("\nResults:")
        for i, match in enumerate(results, 1):
            print(f"\n--- Result {i} (Score: {match.score:.3f}) ---")
            print(match.metadata['text'])
            print("-" * 80)

if __name__ == "__main__":
    main()