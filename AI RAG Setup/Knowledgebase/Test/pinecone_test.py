import os
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'agrivanna-knowledge-pipeline')

def test_pinecone_connection():
    """Test basic Pinecone connectivity and index stats."""
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Get index statistics
        stats = index.describe_index_stats()
        logger.info("Index Statistics:")
        logger.info(f"Total vectors: {stats.total_vector_count}")
        logger.info(f"Dimension: {stats.dimension}")
        logger.info(f"Namespaces: {stats.namespaces}")
        
        return True
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return False

def test_simple_query():
    """Test a simple query to verify search functionality."""
    try:
        # Initialize models
        embedder = SentenceTransformer('intfloat/multilingual-e5-large')
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Test query
        test_query = "What is dairy cattle feed?"
        query_vector = embedder.encode(test_query).tolist()
        
        results = index.query(
            vector=query_vector,
            top_k=1,
            include_metadata=True
        )
        
        if results.matches:
            logger.info("Query test successful!")
            logger.info(f"Sample result: {results.matches[0].metadata['text'][:100]}...")
            return True
        else:
            logger.warning("Query returned no results")
            return False
            
    except Exception as e:
        logger.error(f"Query test failed: {str(e)}")
        return False

def main():
    """Run all tests."""
    logger.info("Starting Pinecone tests...")
    
    # Test 1: Connection
    logger.info("\n1. Testing Pinecone connection...")
    if test_pinecone_connection():

        logger.info("✅ Connection test passed")
    else:
        logger.error("❌ Connection test failed")
    
    # Test 2: Query
    logger.info("\n2. Testing simple query...")
    if test_simple_query():
        logger.info("✅ Query test passed")
    else:
        logger.error("❌ Query test failed")

if __name__ == "__main__":
    main()