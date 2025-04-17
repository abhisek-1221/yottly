import { NextResponse } from 'next/server'

const LIBRETRANSLATE_URL = 'https://libretranslate.com/translate'

export async function POST(req: Request) {
  try {
    const { text, targetLang, sourceLang = 'auto' } = await req.json()

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Translation failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ translatedText: data.translatedText })
  } catch (error) {
    console.error('Translation API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
