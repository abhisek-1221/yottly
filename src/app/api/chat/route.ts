import { groq } from '@ai-sdk/groq';
import {  streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are a Youtube Transcript Summarize with detailed key insights',
    messages,
  });
  console.log(result);
  
  
  return result.toDataStreamResponse();
}
