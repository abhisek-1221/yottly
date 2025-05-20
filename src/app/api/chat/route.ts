import { groq } from '@ai-sdk/groq'
import { streamText, smoothStream } from 'ai'
import { NextResponse } from 'next/server'
import { chatRateLimiter } from '@/lib/ratelimit'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'

    let rateLimitResult
    try {
      rateLimitResult = await chatRateLimiter.limit(ip)
    } catch (error) {
      console.error('Rate limiter error:', error)
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    const { success, limit, remaining, reset } = rateLimitResult

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          limit,
          remaining: 0,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    const { messages, model, system } = await req.json()

    const result = streamText({
      model: groq(model || 'llama-3.1-8b-instant'),
      system:
        system ||
        'You are an AI assistant that provides clear, concise summaries with key insights.',
      messages,
      experimental_transform: smoothStream(),
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 })
  }
}
