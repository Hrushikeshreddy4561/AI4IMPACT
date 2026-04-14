import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client with our API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt requirement to act as a college assistant with anti-hallucination guardrails
const SYSTEM_PROMPT = "You are a helpful AI assistant for college student. Answer questions clearly and concisely. You must prioritize accuracy. If a user asks about a person, event, or concept that does not exist or that you are not 100% certain about, you MUST explicitly state that you do not have that information. Do not invent facts, names, or dates. Keep answers under 10 lines.";

export async function POST(req) {
  try {
    // Parse the incoming JSON body containing the chat history
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
    }

    // Get the Gemini 1.5 Flash model and configure system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT
    });

    // Format the previous messages into the format Gemini expects for history
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // The most recent message is what we'll send to start the chat completion
    const latestMessage = messages[messages.length - 1].content;

    // Start a chat session with history so it remembers previous context
    const chat = model.startChat({
      history,
    });

    // Call the streaming API to get the response chunk by chunk
    const result = await chat.sendMessageStream(latestMessage);

    // Create a ReadableStream to send data back chunk by chunk to the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Iterate over the stream chunks from Gemini and encode to bytes
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error("DEBUG: Streaming loop error:", streamError);
          controller.error(streamError);
        }
      }
    });

    // Return the stream with plain text headers
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('DEBUG: Chat API Route Exception:', error);
    // Log the error details for inspection
    if (error.status) console.error('Status:', error.status);
    if (error.message) console.error('Message:', error.message);

    return new Response(JSON.stringify({ error: 'Failed to process chat request', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
