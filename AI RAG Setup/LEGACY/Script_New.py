import google.generativeai as genai
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

# Define API keys here
GEMINI_API_KEY = "API_KEY_HERE"
PINECONE_API_KEY = "API_KEY_HERE"

# Configure Google Generative AI
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Pinecone for RAG-based retrieval
Pinecone(api_key=PINECONE_API_KEY, environment="us-west1-gcp")
index = Pinecone.Index("agrivanna-knowledge")

# Load embedding model for similarity search
embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def retrieve_context(query):
    """
    Retrieves fact-checked veterinary information from the knowledge base.
    """
    query_embedding = embedder.encode(query).tolist()
    results = index.query(query_embedding, top_k=5, include_metadata=True)

    context = "\n".join([res['metadata']['text'] for res in results['matches']])
    return context


def generate_analysis(symptoms, photo_path):
    """
    Generates AI-powered livestock disease analysis.
    Uses RAG for fact-checked contextual augmentation.
    """
    # Retrieve fact-checked veterinary information
    context = retrieve_context(", ".join(symptoms))

    # Refined AI Prompt
    MESSAGE_TEMPLATE = """
    Act as a professional livestock consultant specializing in diagnosing and treating livestock diseases.
    Analyze the provided symptoms and image data to identify possible diagnoses. Focus on:
    - Confirming the problem or disease with confidence percentages.
    - Providing clear, actionable recommendations.
    - Using only vetted veterinary knowledge.

    Symptoms: {symptoms}

    If image data is provided, use the following input:
    Image Path: {photo_path}

    Relevant Vet Knowledge:
    {context}

    Provide the analysis as:
    - Possible Diagnoses: [List with disease names and confidence percentages]
    - Recommended Actions: [Specific steps the user should take]

    Avoid irrelevant or unrelated information.
    """
    MESSAGE = MESSAGE_TEMPLATE.format(symptoms=", ".join(symptoms), photo_path=photo_path, context=context)

    # Generate AI response
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")  # Specify the model
        response = model.generate_content(MESSAGE)
        return response.text
    except Exception as e:
        print(f"Error during AI invocation: {e}")
        return "Error in generating analysis."

def ask_cowbot(follow_up_question, previous_analysis):
    """
    Handles follow-up questions from the user with RAG-supported contextual responses.
    """
    # Retrieve relevant vet knowledge
    context = retrieve_context(follow_up_question)

    FOLLOW_UP_TEMPLATE = """
    Act as CowBot, an AI assistant specializing in livestock disease consultation.
    Assist the user with follow-up questions related to the previous analysis.

    Previous Analysis:
    {previous_analysis}

    Relevant Veterinary Knowledge:
    {context}

    Question:
    {follow_up_question}

    Provide detailed and actionable insights, staying within the livestock health domain.
    """
    MESSAGE = FOLLOW_UP_TEMPLATE.format(previous_analysis=previous_analysis, follow_up_question=follow_up_question, context=context)

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")  # Specify the model
        response = model.generate_content(MESSAGE)
        return response.text
    except Exception as e:
        print(f"Error during CowBot invocation: {e}")
        return "Error in generating response."

# Sample testing workflow here
if __name__ == "__main__":
    # Received from front-end
    selected_animal = "Cow #2466"
    symptoms = ["Fever", "Loss of Appetite"]
    photo_path = "./cow_image.jpg"

    # Step 1: Analyzing symptoms and photos with RAG
    print("Analyzing symptoms and photo with AI & RAG...")
    analysis = generate_analysis(symptoms, photo_path)
    print("Analysis Result:")
    print(analysis)

    # Saving analysis for future use of CowBot follow-up
    previous_analysis = analysis

    # Step 2: Handling follow-up questions using RAG
    follow_up_question = "Can you confirm if the treatment for Foot and Mouth Disease involves isolation?"
    print("\nAsking CowBot with context-based responses...")
    cowbot_response = ask_cowbot(follow_up_question, previous_analysis)
    print("CowBot Response:")
    print(cowbot_response)
