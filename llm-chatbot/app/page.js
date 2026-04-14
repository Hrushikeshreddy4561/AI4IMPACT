'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function ChatPage() {
  // Store chat messages. Format is simple: { role: 'user' | 'ai', content: string }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reference for auto-scrolling to the latest message
  const messagesEndRef = useRef(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission and streaming request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Build the user message and update state
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Create an empty AI message that we will stream text into
      setMessages((prev) => [...prev, { role: 'ai', content: '' }]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to fetch response');
      }

      // Read the stream chunk by chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk of bytes into text
        const chunkText = decoder.decode(value, { stream: true });
        aiResponseText += chunkText;

        // Update the last message (AI's message) with the accumulated full text
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'ai', content: aiResponseText };
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Append an error message to the chat so the user handles it gracefully
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.role === 'ai' && lastMsg.content === '') {
          updated[updated.length - 1] = { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
        } else {
          updated.push({ role: 'ai', content: 'Sorry, I encountered an error. Please try again.' });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler to quickly erase all conversation history
  const handleClearChat = () => setMessages([]);

  // Render a simple loading indicator while waiting for the first chunk to arrive
  const showThinking = isLoading && messages.length > 0 && messages[messages.length - 1].content === '';

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-gray-100 font-sans">
      {/* Header section showing the model name and Clear button */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#161616]">
        <div className="flex items-center">
          {messages.length > 0 && (
            <h1 className="text-xl font-semibold transition-opacity duration-300">AI4IMPACT</h1>
          )}
        </div>
        <button
          onClick={handleClearChat}
          className={`text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-all duration-300 ${messages.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
          Clear Chat
        </button>
      </header>

      {/* Main chat area where messages are displayed */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-4xl mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI4IMPACT
            </h1>
            <p className="text-gray-400 text-lg md:text-xl font-medium">
              Send a message to start chatting!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm overflow-x-auto ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap'
                    : 'bg-gray-800 text-gray-100 rounded-bl-none prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900'
                  }`}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {showThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        {/* Invisible div utilized to auto-scroll into view when new content arrives */}
        <div ref={messagesEndRef} />
      </main>

      {/* Footer area with the input field and send button */}
      <footer className="p-4 bg-[#161616] border-t border-gray-800 w-full">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message here..."
            className="w-full bg-gray-800 border border-gray-700 rounded-full px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-full font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
