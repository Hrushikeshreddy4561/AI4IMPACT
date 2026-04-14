import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = "You are a helpful AI assistant for college students. Answer questions clearly and concisely. If you are not sure about something, say so. Keep answers under 10 lines unless the user asks for more detail.";

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: SYSTEM_PROMPT
});

const chat = model.startChat({
  history: []
});

async function main() {
  try {
    const result = await chat.sendMessageStream("hello");
    for await (const chunk of result.stream) {
      console.log(chunk.text());
    }
  } catch (err) {
    console.error("SDK ERROR:", err);
  }
}

main();
