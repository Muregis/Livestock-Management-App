import os
from dotenv import load_dotenv
import google.generativeai as genai
from query_knowledge import KnowledgeBase
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

class AgrivannaAI:
    def __init__(self):
        """Initialize the AI assistant with RAG capabilities."""
        self.knowledge_base = KnowledgeBase()
        self.model = genai.GenerativeModel("gemini-1.5-pro")
        self.previous_analysis = None
        self.context_window = 5  # Store last 5 interactions

    def get_context(self, query: str, top_k: int = 3) -> str:
        """Retrieve relevant context from the knowledge base.
        
        Args:
            query (str): The query to search for
            top_k (int): Number of results to retrieve
            
        Returns:
            str: Combined context from relevant documents
        """
        try:
            results = self.knowledge_base.query(query, top_k=top_k)
            if not results:
                logger.warning("No relevant context found")
                return "No relevant information found in knowledge base."
            
            context = "\n\n".join([
                f"Source {i+1}:\n{match.metadata['text']}"
                for i, match in enumerate(results)
            ])
            return context
        except Exception as e:
            logger.error(f"Error getting context: {e}")
            return "Error retrieving context from knowledge base."

    def analyze_livestock(self, symptoms: list) -> str:
        """Generate livestock analysis using RAG and Gemini.
        
        Args:
            symptoms (list): List of observed symptoms
            
        Returns:
            str: AI-generated analysis
        """
        # Get relevant context from knowledge base
        query = f"livestock symptoms: {', '.join(symptoms)}"
        context = self.get_context(query)

        prompt = f"""You are an expert livestock consultant specializing in dairy cattle health. 
        Analyze the following symptoms and provide a detailed assessment based on verified information.

        Symptoms Observed:
        {', '.join(symptoms)}

        Relevant Knowledge Base Context:
        {context}

        Please provide:
        1. Possible Diagnoses (with confidence levels)
        2. Recommended Actions
        3. Prevention Measures
        4. When to Contact a Veterinarian

        Base your analysis strictly on the provided context and verified veterinary knowledge.
        """

        try:
            response = self.model.generate_content(prompt)
            self.previous_analysis = response.text
            return response.text
        except Exception as e:
            logger.error(f"Error generating analysis: {e}")
            return "Error in generating analysis. Please try again."

    def ask_followup(self, question: str) -> str:
        """Handle follow-up questions about previous analysis.
        
        Args:
            question (str): Follow-up question
            
        Returns:
            str: AI-generated response
        """
        # Get relevant context
        context = self.get_context(question)

        prompt = f"""You are an expert livestock consultant. Answer the follow-up question based on 
        the previous analysis and verified information.

        Previous Analysis:
        {self.previous_analysis if self.previous_analysis else 'No previous analysis available.'}

        Follow-up Question:
        {question}

        Relevant Knowledge Base Context:
        {context}

        + Focus on all problems that are mentioned in the content
        + Never talk about any other topic other than any livestock problem
        + Strictly avoid any irrelevant information
        + Don't give any information back if its not domain specific
        + Output should be to try again if the content is not related to livestock problem

        Provide a clear, detailed answer based on the context and veterinary knowledge.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "Error in generating response. Please try again."

def main():
    """Interactive demo of the AI system."""
    ai = AgrivannaAI()
    
    print("\n🐄 Agrivanna AI Livestock Consultant")
    print("Type 'exit' to quit or 'new' for a new analysis\n")
    
    while True:
        # Get symptoms
        print("\nEnter symptoms (separated by commas) or command:")
        user_input = input("> ").strip()
        
        if user_input.lower() == 'exit':
            break
        elif user_input.lower() == 'new':
            continue
            
        if not ai.previous_analysis:
            # New analysis
            symptoms = [s.strip() for s in user_input.split(',')]
            print("\nAnalyzing...")
            analysis = ai.analyze_livestock(symptoms)
            print("\nAnalysis Results:")
            print(analysis)
        else:
            # Follow-up question
            print("\nGenerating response...")
            response = ai.ask_followup(user_input)
            print("\nResponse:")
            print(response)
            
        print("\nAsk a follow-up question, type 'new' for a new analysis, or 'exit' to quit")

if __name__ == "__main__":
    main() 