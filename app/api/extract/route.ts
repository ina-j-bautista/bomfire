import { NextRequest } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import { GoogleGenAI } from '@google/genai'
import catalogData from '@/data/catalog.json'

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

async function fetchVideoMeta(videoId: string) {
  try {
    const res  = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    const data = await res.json()
    return {
      title:        data.title        || 'Tutorial Video',
      channel:      data.author_name  || 'Unknown Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    }
  } catch {
    return {
      title:        'Tutorial Video',
      channel:      'Unknown Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    }
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) return Response.json({ error: 'No URL provided' }, { status: 400 })

  const videoId = extractVideoId(url)
  if (!videoId) return Response.json({ error: 'Invalid YouTube URL.' }, { status: 400 })

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: 'GEMINI_API_KEY not configured. Copy .env.example to .env.local and add your key.' },
      { status: 500 }
    )
  }

  const meta = await fetchVideoMeta(videoId)

  // Fetch transcript
  let transcript = ''
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId)
    transcript = segments.map((s: { text: string }) => s.text).join(' ')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json(
      { error: `Could not fetch transcript — the video may not have captions enabled. (${msg})` },
      { status: 422 }
    )
  }

  if (!transcript || transcript.length < 100) {
    return Response.json({ error: 'Transcript too short. Try a longer tutorial video.' }, { status: 422 })
  }

  // Lean catalog — only fields needed for matching
  const catalog = catalogData.map((item) => ({
    sku:   item.sku,
    name:  item.name,
    tags:  item.aliases,
    price: item.price,
    stock: item.stock,
    qty:   item.qty_available,
  }))

  const prompt = `You are an electronics store inventory assistant.

Extract every electronic component or part mentioned in this tutorial transcript.
Then match each to the best item in the store catalog.

TRANSCRIPT (first 6000 chars):
${transcript.slice(0, 6000)}

CATALOG (JSON):
${JSON.stringify(catalog)}

RULES:
- Only extract real purchasable hardware (no software, no tools, no services)
- One entry per unique component; use the stated quantity or 1 if not mentioned
- Match using the name AND tags fields
- matchType: "Exact" close match | "Fuzzy" similar specs | "AI" inferred | "Not Found" nothing suitable
- For "Not Found": sku/catalogName/price = null, stock = false, qtyAvailable = 0, substitutes = []
- For out-of-stock items include up to 3 in-stock substitutes from the catalog

Return ONLY a raw JSON array — no markdown, no explanation, start with [ end with ]:
[
  {
    "name": "component name from transcript",
    "spec": "key specs mentioned",
    "quantity": 1,
    "source": "Transcript",
    "sku": "SKU or null",
    "catalogName": "catalog name or null",
    "price": 0,
    "stock": true,
    "qtyAvailable": 0,
    "matchType": "Exact",
    "substitutes": []
  }
]

substitutes format (only for stock:false items):
{ "sku":"X", "catalogName":"Y", "price":0, "qtyAvailable":0, "compatibility":"Drop-in", "note":"one sentence" }`

  try {
    const ai       = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const response = await ai.models.generateContent({
      model:    'gemini-2.5-flash',
      contents: prompt,
    })

    const raw   = (response.text ?? '').trim()
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let bom
    try {
      bom = JSON.parse(clean)
    } catch {
      console.error('JSON parse failed. Raw Gemini output:\n', raw)
      return Response.json(
        { error: 'Gemini returned invalid JSON. Check server console for raw output.' },
        { status: 500 }
      )
    }

    if (!Array.isArray(bom)) {
      return Response.json({ error: 'Gemini response was not a JSON array.' }, { status: 500 })
    }

    return Response.json({ meta, bom })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Gemini API error:', message)
    return Response.json({ error: `Gemini error: ${message}` }, { status: 500 })
  }
}
