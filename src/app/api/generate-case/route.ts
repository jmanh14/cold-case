import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildCaseGenerationPrompt } from '@/lib/prompts'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { genre } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildCaseGenerationPrompt(genre) }],
    })

    const raw = message.content.map(b => b.type === 'text' ? b.text : '').join('')
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const caseData = JSON.parse(cleaned)

    return NextResponse.json(caseData)
  } catch (err) {
    console.error('Case generation error:', err)
    return NextResponse.json({ error: 'Failed to generate case' }, { status: 500 })
  }
}