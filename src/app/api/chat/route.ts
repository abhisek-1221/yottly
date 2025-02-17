import { groq } from '@ai-sdk/groq';
import { streamText, smoothStream } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq('gemma2-9b-it'),
    system: 'You are an AI assistant that provides clear, concise summaries with key insights. Present information in a natural, conversational way while maintaining professionalism. Focus on extracting and organizing main points, themes, and notable moments.',
    messages,
    experimental_transform: smoothStream(),      
  });  
  
  return result.toDataStreamResponse();
}
