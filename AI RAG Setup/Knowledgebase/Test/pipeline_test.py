import os
import sys
import logging
from dotenv import load_dotenv
from tqdm import tqdm

# Add parent directory to path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pinecone_setup import create_pinecone_index, verify_index
from pdf_loader import DocumentProcessor
from query_knowledge import KnowledgeBase
from ai_response import AgrivannaAI

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PipelineTester:
    def __init__(self):
        """Initialize the pipeline tester."""
        load_dotenv()
        self.pdf_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), "PDFs")
        self.test_pdfs = [
            "DairyCattle_23_FINAL.pdf",
            "2023-Producer-Policy-Handbook.pdf"
        ]

    def test_pinecone_setup(self):
        """Test Pinecone index creation and verification."""
        logger.info("\n📌 Testing Pinecone Setup...")
        
        # Create index
        if not create_pinecone_index():
            logger.error("❌ Failed to create Pinecone index")
            return False
        
        # Verify index
        if not verify_index():
            logger.error("❌ Failed to verify Pinecone index")
            return False
            
        logger.info("✅ Pinecone setup successful")
        return True

    def test_pdf_loading(self):
        """Test PDF loading and processing."""
        logger.info("\n📌 Testing PDF Loading...")
        
        # Initialize processor with specific configuration
        processor = DocumentProcessor(
            chunk_size=500,    # 500 characters per chunk
            overlap=50,        # 50 character overlap
            batch_size=32      # Process 32 chunks at a time
        )
        success = True
        
        for pdf_name in self.test_pdfs:
            pdf_path = os.path.join(self.pdf_folder, pdf_name)
            
            if not os.path.exists(pdf_path):
                logger.error(f"❌ PDF not found: {pdf_name}")
                success = False
                continue
                
            try:
                logger.info(f"Processing {pdf_name}")
                processor.process_pdf(pdf_path)  # Now uses the configured chunk_size
                logger.info(f"✅ Successfully processed {pdf_name}")
            except Exception as e:
                logger.error(f"❌ Failed to process {pdf_name}: {e}")
                success = False
        
        return success

    def test_knowledge_base(self):
        """Test knowledge base queries."""
        logger.info("\n📌 Testing Knowledge Base...")
        
        kb = KnowledgeBase()
        test_queries = [
            "What are common dairy cattle diseases?",
            "How to prevent mastitis in cows?",
            "What is the best feed for dairy cattle?"
        ]
        
        success = True
        for query in test_queries:
            try:
                logger.info(f"\nTesting query: {query}")
                results = kb.query(query, top_k=2)
                
                if results:
                    logger.info("✅ Query returned results")
                    logger.info(f"Sample result: {results[0].metadata['text'][:100]}...")
                else:
                    logger.warning(f"⚠️ No results for query: {query}")
                    success = False
                    
            except Exception as e:
                logger.error(f"❌ Query failed: {e}")
                success = False
        
        return success

    def test_ai_response(self):
        """Test AI response generation."""
        logger.info("\n📌 Testing AI Response...")
        
        ai = AgrivannaAI()
        
        # Test symptom analysis
        try:
            symptoms = ["reduced milk production", "warm udder", "abnormal milk"]
            logger.info(f"Testing symptom analysis: {', '.join(symptoms)}")
            
            analysis = ai.analyze_livestock(symptoms, "First lactation cow")
            if analysis and "Error" not in analysis:
                logger.info("✅ Symptom analysis successful")
                logger.info("Sample analysis:")
                logger.info(f"{analysis[:200]}...")
            else:
                logger.error("❌ Symptom analysis failed")
                return False
                
            # Test follow-up question
            followup = "What preventive measures should I take?"
            logger.info(f"\nTesting follow-up question: {followup}")
            
            response = ai.ask_followup(followup)
            if response and "Error" not in response:
                logger.info("✅ Follow-up response successful")
                logger.info("Sample response:")
                logger.info(f"{response[:200]}...")
            else:
                logger.error("❌ Follow-up response failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ AI response test failed: {e}")
            return False
            
        return True

def main():
    """Run the complete pipeline test."""
    logger.info("🚀 Starting Complete Pipeline Test\n")
    
    tester = PipelineTester()
    tests = [
        # ("Pinecone Setup", tester.test_pinecone_setup),
        # ("PDF Loading", tester.test_pdf_loading),
        ("Knowledge Base", tester.test_knowledge_base),
        ("AI Response", tester.test_ai_response)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            logger.error(f"Test '{test_name}' failed with error: {e}")
            results.append((test_name, False))
    
    # Print summary
    logger.info("\n📊 Test Summary:")
    all_passed = True
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        logger.info(f"{status} - {test_name}")
        if not success:
            all_passed = False
    
    if all_passed:
        logger.info("\n🎉 All tests passed! The pipeline is working correctly.")
    else:
        logger.error("\n⚠️ Some tests failed. Please check the logs above for details.")

if __name__ == "__main__":
    main() 