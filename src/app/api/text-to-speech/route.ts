import { NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { ttsRateLimiter } from '@/lib/ratelimit'

const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'

    let rateLimitResult
    try {
      rateLimitResult = await ttsRateLimiter.limit(ip)
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

    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-A',
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 1.0,
        pitch: 0,
        sampleRateHertz: 16000,
      },
    }

    const [response] = await client.synthesizeSpeech(request)

    if (!response.audioContent) {
      throw new Error('Failed to generate audio')
    }

    const audioBase64 = Buffer.from(response.audioContent as Uint8Array).toString('base64')

    return NextResponse.json({
      audioContent: audioBase64,
      rateLimit: {
        limit,
        remaining,
        reset,
      },
    })
  } catch (error: any) {
    console.error('Text-to-Speech Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to convert text to speech' },
      { status: 500 }
    )
  }
}
