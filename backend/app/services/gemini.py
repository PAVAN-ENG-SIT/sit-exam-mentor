import os
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_gemini_response(messages: list, model_name: str) -> str:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in the environment.")
    
    model = genai.GenerativeModel(model_name)
    
    # Convert conversation list to a single prompt string optimized for Gemini native
    # This correctly processes system and user role chains safely
    prompt_parts = []
    for m in messages:
        role = m.get("role", "user").capitalize()
        content = m.get("content", "")
        prompt_parts.append(f"{role}:\n{content}")
        
    full_prompt = "\n\n".join(prompt_parts)
    
    response = model.generate_content(full_prompt)
    return response.text
