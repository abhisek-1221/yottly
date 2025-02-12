import { groq } from '@ai-sdk/groq';
import {  streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('llama-3.1-8b-instant'),
    system: 'You are a Youtube Transcript Summarize with detailed key insights',
    messages,
  });
  console.log(result);
  
  
  
  return result.toDataStreamResponse();
}
