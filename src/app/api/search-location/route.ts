import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildLocationSearchPrompt } from '@/lib/prompts'
import { Case } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { activeCase, locationId, previousClues }: {
      activeCase: Case
      locationId: string
      previousClues: string[]
    } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildLocationSearchPrompt(activeCase, locationId, previousClues) }],
    })

    const raw = message.content.map(b => b.type === 'text' ? b.text : '').join('')
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Location search error:', err)
    return NextResponse.json({ error: 'Failed to search location' }, { status: 500 })
  }
}