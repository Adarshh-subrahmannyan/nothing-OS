import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 503 })
    }

    const body = await req.json()
    const { type } = body

    const EXCUSE_PROMPTS: Record<string, string> = {
      professional: 'Generate a single, professionally-worded excuse for not completing work. Sound like a senior professional. Keep it to 1-2 sentences. Return only the excuse text.',
      corporate: 'Generate a single corporate buzzword-heavy excuse for not completing deliverables. Sound like a management consultant. Keep it to 1-2 sentences. Return only the excuse text.',
      ridiculous: 'Generate a single completely ridiculous, absurd excuse for not doing work. Be funny and creative. Keep it to 1-2 sentences. Return only the excuse text.',
    }

    let prompt = ''

    if (type === 'excuse') {
      const { reason = '', style = 'professional' } = body
      const base = EXCUSE_PROMPTS[style] ?? EXCUSE_PROMPTS.professional
      prompt = `${base}${reason ? ` The situation: ${reason}.` : ''}`
    } else if (type === 'distraction') {
      const { task = '' } = body
      prompt = `Generate exactly 5 creative, amusing things someone could do instead of "${task || 'working'}". Return them as a JSON array of strings, no markdown code blocks, no explanation. Example: ["thing 1", "thing 2"]`
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!geminiRes.ok) {
      return NextResponse.json({ error: 'Gemini API error' }, { status: 503 })
    }

    const data = await geminiRes.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (type === 'distraction') {
      try {
        const clean = text.replace(/```json\n?|\n?```/g, '').trim()
        return NextResponse.json({ results: JSON.parse(clean) })
      } catch {
        // Parse failure — just return empty
        return NextResponse.json({ results: [] }, { status: 500 })
      }
    }

    return NextResponse.json({ result: text.trim() })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
