"""
AI Image Classifier — Backend Server
=====================================
A Flask web server that receives image uploads from the frontend,
sends them to the Hugging Face Inference API (google/vit-base-patch16-224),
and returns classification results with confidence scores.

Model: Google Vision Transformer (ViT)
API:   Hugging Face Inference API (free tier)
"""

import os
import requests
import sys
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

# ─── Path Resolution for Bundling (PyInstaller) ────────────────
def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

# Load environment variables from .env file
# Try both current directory and bundled directory
load_dotenv(resource_path(".env"))
load_dotenv() # Fallback to current working directory

app = Flask(__name__, static_folder=resource_path("static"))

# ─── Configuration ───────────────────────────────────────────────
HF_API_KEY = os.getenv("HF_API_KEY")
MODEL_URL = "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "bmp", "gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def allowed_file(filename):
    """Check if the uploaded file has an allowed image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ─── Routes ──────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main frontend page."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/classify", methods=["POST"])
def classify():
    """
    Receive an image and classify it using the Hugging Face API.

    Accepts:
        - Form file upload (multipart/form-data) with key 'image'
        - Raw binary image data in the request body

    Returns:
        JSON array of predictions: [{"label": "...", "score": 0.95}, ...]
    """
    # 1. Check API key
    if not HF_API_KEY:
        return jsonify({
            "error": "Hugging Face API key not configured. "
                     "Please set HF_API_KEY in the .env file."
        }), 500

    # 2. Get image data from the request
    image_data = None

    if "image" in request.files:
        # ── Multipart form upload ──
        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400
        if not allowed_file(file.filename):
            return jsonify({
                "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        image_data = file.read()
    else:
        # ── Raw binary body ──
        image_data = request.get_data()

    if not image_data:
        return jsonify({"error": "No image data received."}), 400

    if len(image_data) > MAX_FILE_SIZE:
        return jsonify({"error": "File too large. Maximum size is 10 MB."}), 400

    # 3. Send image to Hugging Face Inference API
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/octet-stream"
    }

    try:
        response = requests.post(MODEL_URL, headers=headers, data=image_data, timeout=30)
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request to AI model timed out. Please try again."}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to the AI service. Check your internet."}), 503
    except requests.exceptions.RequestException as e:
        # Catch other requests errors like ChunkedEncodingError
        print(f"Request Error: {e}")
        return jsonify({"error": "An error occurred while talking to the AI service. Please try again."}), 502

    # 4. Handle API response
    if response.status_code == 200:
        try:
            results = response.json()
            return jsonify(results)
        except ValueError:
            return jsonify({"error": "Received invalid format from AI service."}), 502
    elif response.status_code == 503:
        # Model is loading (cold start)
        return jsonify({
            "error": "The AI model is loading. Please wait a few seconds and try again.",
            "loading": True
        }), 503
    elif response.status_code == 401:
        return jsonify({"error": "Invalid API key. Please check your HF_API_KEY."}), 401
    else:
        return jsonify({
            "error": f"API error (status {response.status_code}). Please try again."
        }), response.status_code


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "model": "google/vit-base-patch16-224",
        "api_key_set": bool(HF_API_KEY)
    })


# ─── Main ────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🧠 AI Image Classifier — Server Starting")
    print(f"   Model : google/vit-base-patch16-224")
    print(f"   API Key: {'✅ Configured' if HF_API_KEY else '❌ Missing — set HF_API_KEY in .env'}")
    print(f"   Open  : http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
