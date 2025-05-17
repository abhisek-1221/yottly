import { NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

// Initialize the client with credentials
const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
})

export async function POST(req: Request) {
  try {
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

    return NextResponse.json({ audioContent: audioBase64 })
  } catch (error: any) {
    console.error('Text-to-Speech Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to convert text to speech' },
      { status: 500 }
    )
  }
}
