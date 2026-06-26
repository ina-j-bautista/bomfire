import { NextRequest } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function GET(request: NextRequest) {
  const name    = request.nextUrl.searchParams.get('name')    || ''
  const spec    = request.nextUrl.searchParams.get('spec')    || ''
  const context = request.nextUrl.searchParams.get('context') || 'a maker tutorial'

  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 })
  }

  const prompt = `A maker is building a project from "${context}".
Component: ${name}${spec ? ` (${spec})` : ''}.

Write exactly 3 plain-language sentences for a beginner maker:
- whatItDoes: role this part plays in a typical circuit like this
- whyThisSpec: why this particular value or model makes sense
- whatChanges: what concretely happens if they swap to a different spec or model

Return ONLY raw JSON, no markdown:
{"whatItDoes":"...","whyThisSpec":"...","whatChanges":"..."}`

  try {
    const ai       = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const response = await ai.models.generateContent({
      model:    'gemini-2.5-flash',
      contents: prompt,
    })

    const raw   = (response.text ?? '').trim()
    const clean = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim()
    return Response.json(JSON.parse(clean))

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500 })
  }
}
