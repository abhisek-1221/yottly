import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { NextResponse } from 'next/server'
import { chatRateLimiter } from '@/lib/ratelimit'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'

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

    const { transcript, numQuestions, model } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    if (!model) {
      return NextResponse.json({ error: 'Model selection is required' }, { status: 400 })
    }

    if (!numQuestions || numQuestions < 2 || numQuestions > 10) {
      return NextResponse.json(
        { error: 'Number of questions must be between 2 and 10' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert quiz generator. Your task is to create high-quality multiple choice questions based on the provided video transcript.

Guidelines:
1. Create exactly ${numQuestions} questions
2. Each question should have 4 answer options (A, B, C, D)
3. Questions should test understanding of key concepts, facts, and insights from the video
4. Avoid questions that are too easy or too difficult
5. Include explanations for correct answers when possible
6. Focus on the most important and memorable content
7. Make wrong answers plausible but clearly incorrect

Response format must be valid JSON:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

The correctAnswer field should be the index (0-3) of the correct option in the options array.`

    const userPrompt = `Based on this video transcript, generate ${numQuestions} multiple choice questions:

${transcript}

Remember to respond only with valid JSON in the exact format specified.`

    const result = await streamText({
      model: groq(model),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
