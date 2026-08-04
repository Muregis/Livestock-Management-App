import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
import logging
from sentence_transformers import SentenceTransformer

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'agrivanna-knowledge-test')
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'intfloat/multilingual-e5-large')

def verify_embedding_model():
    """Verify the embedding model loads correctly."""
    try:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        embedder = SentenceTransformer(EMBEDDING_MODEL)
        # Test encode a simple string
        test_embedding = embedder.encode("Test string")
        logger.info(f"✅ Embedding model loaded successfully (dimension: {len(test_embedding)})")
        return True
    except Exception as e:
        logger.error(f"❌ Error loading embedding model: {e}")
        return False

def create_pinecone_index():
    """Create Pinecone index if it doesn't exist."""
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Check if index already exists
        existing_indexes = [index.name for index in pc.list_indexes()]
        
        if PINECONE_INDEX_NAME in existing_indexes:
            logger.info(f"Index '{PINECONE_INDEX_NAME}' already exists")
            return True
            
        # Create new index
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=1024,  # Dimension for multilingual-e5-large
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        
        logger.info(f"Successfully created index '{PINECONE_INDEX_NAME}' for model {EMBEDDING_MODEL}")
        return True
        
    except Exception as e:
        logger.error(f"Error creating Pinecone index: {e}")
        return False

def verify_index():
    """Verify index is ready and show statistics."""
    try:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        index = pc.Index(PINECONE_INDEX_NAME)
        
        # Get index statistics
        stats = index.describe_index_stats()
        
        logger.info("\nIndex Statistics:")
        logger.info(f"Total vectors: {stats.total_vector_count}")
        logger.info(f"Dimension: {stats.dimension}")
        logger.info(f"Namespaces: {stats.namespaces}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error verifying index: {e}")
        return False

def main():
    """Setup and verify Pinecone index and embedding model."""
    logger.info("🚀 Starting Setup...\n")
    
    # Step 1: Verify embedding model
    logger.info("1. Verifying embedding model...")
    if not verify_embedding_model():
        logger.error("❌ Embedding model verification failed")
        return
    
    # Step 2: Create index
    logger.info("\n2. Creating Pinecone index...")
    if not create_pinecone_index():
        logger.error("❌ Index creation failed")
        return
    
    # Step 3: Verify index
    logger.info("\n3. Verifying index...")
    if not verify_index():
        logger.error("❌ Index verification failed")
        return
    
    logger.info("\n✨ Setup completed successfully!")

if __name__ == "__main__":
    main() 