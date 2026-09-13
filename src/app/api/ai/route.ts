import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return NextResponse.json({ error: 'No API key configured' }, { status: 503 })
    }

    const body = await req.json()
    const { type } = body

    let prompt = ''

    if (type === 'excuse') {
      const { reason = '', style = 'professional' } = body
      const EXCUSE_PROMPTS: Record<string, string> = {
        professional: 'Generate a single, professionally-worded excuse for not completing work. Sound like a senior professional. Keep it to 1-2 sentences. Return only the excuse text.',
        corporate: 'Generate a single corporate buzzword-heavy excuse for not completing deliverables. Sound like a management consultant. Keep it to 1-2 sentences. Return only the excuse text.',
        ridiculous: 'Generate a single completely ridiculous, absurd excuse for not doing work. Be funny and creative. Keep it to 1-2 sentences. Return only the excuse text.',
      }
      const base = EXCUSE_PROMPTS[style] ?? EXCUSE_PROMPTS.professional
      prompt = `${base}${reason ? ` The situation: ${reason}.` : ''}`
    } else if (type === 'distraction') {
      const { task = '' } = body
      prompt = `Generate exactly 5 creative, amusing things someone could do instead of "${task || 'working'}". Return them as a JSON array of strings, no markdown code blocks, no explanation. Example: ["thing 1", "thing 2"]`
    } else if (type === 'roast_repo') {
      const { repoName = '', description = '', language = '' } = body
      prompt = `Write a savage, sarcastic, and funny 1-2 sentence eulogy/roast for a dead, abandoned GitHub project. The project name is "${repoName}". Its description was "${description}". The primary language was ${language}. Roast the developer for abandoning it. Return ONLY the roast text.`
    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    )

    if (!groqRes.ok) {
      console.error('Groq API Error:', await groqRes.text())
      return NextResponse.json({ error: 'Groq API error' }, { status: 503 })
    }

    const data = await groqRes.json()
    const text = data?.choices?.[0]?.message?.content ?? ''

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
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
