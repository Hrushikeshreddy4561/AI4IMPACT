import requests   # library to send HTTP requests
import os
from dotenv import load_dotenv

# Load variables from .env if present
load_dotenv()

# Your Hugging Face API key
API_KEY = os.getenv("HF_API_KEY")

# The modern URL of the Google ViT model
API_URL = "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224"

# Set up the headers
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/octet-stream"
}

# Open the image file in binary mode (rb = read bytes)
with open("image.png", "rb") as f:
    image_data = f.read()

# Send the image to the API and store the reply
print("Sending image to Hugging Face API...")
response = requests.post(API_URL, headers=headers, data=image_data)
results = response.json()

# Format and print the result with scores rounded to 2 decimal places
print("\n[Output Results]:")
formatted_results = []
for item in results:
    formatted_results.append({
        "label": item["label"],
        "score": round(item["score"], 2)
    })

print(formatted_results)
