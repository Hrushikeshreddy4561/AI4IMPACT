# LLM Chatbot with Streaming

A Next.js 14 web application integrating the Google Gemini API with streaming responses.

## Setup Instructions

1. Clone or download this repository.
2. Run `npm install` to install dependencies.
3. Create a `.env.local` file based on `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Add your Google Gemini API key to the `.env.local` file:
   ```env
   GEMINI_API_KEY=your-api-key-here
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) with your browser to use the chatbot.
