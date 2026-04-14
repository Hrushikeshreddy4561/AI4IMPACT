# 🧠 AI Image Classifier

> **Mini Project — The Open-Source AI Ecosystem (Hugging Face)**

A web application that classifies images using Google's **Vision Transformer (ViT)** model through the **Hugging Face Inference API**. Upload any image and the AI tells you what's in it!

---

## 📸 How It Works

```
User uploads image
       ↓
Frontend (JavaScript) sends image to backend
       ↓
Backend (Python/Flask) forwards to Hugging Face API
       ↓
Google ViT model analyses the image
       ↓
Returns predictions with confidence scores
       ↓
Frontend displays results with animated bars
```

## 🛠 Tech Stack

| Component   | Technology                          |
|-------------|-------------------------------------|
| **Backend** | Python 3, Flask                     |
| **Frontend**| HTML5, CSS3, JavaScript             |
| **AI Model**| google/vit-base-patch16-224 (ViT)   |
| **API**     | Hugging Face Inference API (free)   |

---

## 🚀 Setup Instructions

### Step 1 — Get a Hugging Face API Key (Free)

1. Go to [huggingface.co](https://huggingface.co) and create a free account.
2. Click your profile → **Settings** → **Access Tokens**.
3. Click **New Token**, give it a name, and copy the token.

### Step 2 — Install Python Dependencies

Open a terminal in the project folder and run:

```bash
pip install -r requirements.txt
```

### Step 3 — Configure Your API Key

Open the `.env` file and paste your token:

```
HF_API_KEY=hf_your_token_here
```

### Step 4 — Run the Server

```bash
python app.py
```

### Step 5 — Open in Browser

Go to: **http://localhost:5000**

Upload an image and click **Classify Image**!

---

## 🤖 About the Model

### Google ViT (Vision Transformer)

| Property    | Value                                |
|-------------|--------------------------------------|
| Full Name   | `google/vit-base-patch16-224`        |
| Task        | Image Classification                |
| Categories  | 1000 (animals, vehicles, food, etc.) |
| Input       | Image (JPG / PNG / WEBP)            |
| Output      | Labels with confidence scores       |
| License     | Apache 2.0 (free to use)            |

**How ViT works (simplified):**
1. Splits the image into small **16×16 pixel patches** (like puzzle pieces).
2. Uses a **Transformer** architecture (same idea behind GPT) to understand the patches.
3. Predicts: *"This is 95% a dog, 3% a cat, 2% something else."*

---

## 📁 Project Structure

```
ai-image-classifier/
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── .env                # Your API key (keep secret!)
├── .env.example        # Template for API key
├── README.md           # This file
└── static/
    ├── index.html      # Main HTML page
    ├── styles.css      # CSS styling (dark theme)
    └── script.js       # Frontend JavaScript logic
```

---

## 🔑 Key Concepts for Juniors

### What is an API?
An **API (Application Programming Interface)** is a way for programs to talk to each other. We send an HTTP request with our image to Hugging Face, and they send back the AI's prediction.

### What is Hugging Face?
Hugging Face is like the **"GitHub for AI models"**. It hosts 500,000+ free, ready-to-use AI models. Instead of training a model from scratch (which takes weeks and expensive GPUs), we just use one that's already trained.

### What is Image Classification?
Image classification means the AI looks at a picture and tells you **what object or category** it sees. Our model can recognize 1000 different categories including animals, vehicles, food, household objects, and more.

---

## 🌍 Real-Life Uses of Image Classification

| Field              | Example                                                    |
|--------------------|------------------------------------------------------------|
| **Healthcare**     | Detecting diseases in X-rays and medical scans             |
| **Agriculture**    | Identifying plant diseases from leaf photos                |
| **E-commerce**     | Auto-tagging product photos on shopping websites           |
| **Social Media**   | Filtering inappropriate images automatically               |
| **Self-Driving**   | Recognising road signs, pedestrians, and obstacles         |
| **Security**       | Face recognition at airports and offices                   |

---

## 📚 References

- [Hugging Face](https://huggingface.co) — The open-source AI platform
- [ViT Model Card](https://huggingface.co/google/vit-base-patch16-224) — Model details
- [Inference API Docs](https://huggingface.co/docs/api-inference) — API documentation
- [Python Requests](https://docs.python-requests.org) — HTTP library
- [Hugging Face Spaces](https://huggingface.co/spaces) — Free deployment

---

*Built with ❤️ — The Open-Source AI Ecosystem Mini Project*
