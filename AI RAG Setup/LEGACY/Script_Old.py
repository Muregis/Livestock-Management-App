import google.generativeai as genai

# Define your API key for authentication
API_KEY = "ENTER_API_KEY_HERE"

# Configure Google Generative AI
genai.configure(api_key=API_KEY)

# Read the Transcript
file_path = r"C:\Users\munee\Desktop\StartUpProject\Agrevanna\prompt.txt"
try:
    with open(file_path, 'r') as file:
        content = file.read()
except FileNotFoundError:
    print(f"File '{file_path}' not found.")
    content = ""
except Exception as e:
    print(f"An error occurred while reading the file: {e}")
    content = ""

# Check if content was successfully read before proceeding
if not content:
    print("No content to process. Exiting.")
    exit()
else:
    print("File content loaded successfully.")

# Refined AI Summary Prompt
MESSAGE_TEMPLATE = """
Take on a persona of a professional livestock consultant who knows everything about livestock and its diseases.
Use the provided content into concise key takeaways, presented in bullet points. Focus on:
- Outputting related to livestock problem only
- Confirming the problem or disease
- Addressing how to solve the issue
- Providing any other relevant information

+ Focus on all problems that are mentioned in the content
+ Never talk about any other topic other than any livestock problem
+ Strictly avoid any irrelevant information
+ Output should be to try again if the content is not related to livestock problem 

Content:
{content}

Provide the information in 100 words max in bullet points with good intended formatting in Markup Text:
"""

MESSAGE = MESSAGE_TEMPLATE.format(content=content)

# Generate response using Google Generative AI
try:
    model = genai.GenerativeModel("gemini-1.5-flash")  # Specify the model
    response = model.generate_content(MESSAGE)
    print("Generated Summary:")
    print(response.text)

    # Save the summary to a Markdown file
    summary_file_path = "summary.md"
    with open(summary_file_path, 'w') as summary_file:
        summary_file.write("# Summary\n\n")
        summary_file.write(response.text)

    print(f"Summary saved to '{summary_file_path}'")
except Exception as e:
    print(f"Error during AI invocation: {e}")
