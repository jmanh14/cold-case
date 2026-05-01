import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json()

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error('ElevenLabs error:', err)
      return NextResponse.json({ error: 'Audio generation failed' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({
      audioBase64: data.audio_base64,
      alignment: data.alignment,
    })

  } catch (err) {
    console.error('Audio route error:', err)
    return NextResponse.json({ error: 'Audio generation failed' }, { status: 500 })
  }
}