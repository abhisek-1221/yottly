import { groq } from '@ai-sdk/groq'
import { streamText, smoothStream } from 'ai'

export const maxDuration = 120

export async function POST(req: Request) {
  const { messages, model, system } = await req.json()

  const result = streamText({
    model: groq(model || 'llama-3.1-8b-instant'),
    system:
      system || 'You are an AI assistant that provides clear, concise summaries with key insights.',
    messages,
    experimental_transform: smoothStream(),
  })

  return result.toDataStreamResponse()
}
