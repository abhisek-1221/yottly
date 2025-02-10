'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-2xl py-8 px-4">
        <div className="space-y-4 mb-4">
          {messages.map(m => (
            <div 
              key={m.id} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] rounded-lg px-4 py-2
                  ${m.role === 'user' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-600 text-white'}
                `}
              >
                <div className="text-xs text-white mb-1">
                  {m.role === 'user' ? 'You' : 'Llama 3.3 70B powered by Groq'}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#f55036]"
          />
          <button 
            type="submit"
            className="rounded-lg bg-[#f55036] px-4 py-2 text-white hover:bg-[#d94530] focus:outline-none focus:ring-2 focus:ring-[#f55036]"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
