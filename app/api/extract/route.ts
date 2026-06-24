import { NextRequest } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import { GoogleGenerativeAI } from '@google/generative-ai'
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
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return {
      title: data.title || 'Tutorial Video',
      channel: data.author_name || 'Unknown Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    }
  } catch {
    return {
      title: 'Tutorial Video',
      channel: 'Unknown Channel',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    }
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'No URL provided' }, { status: 400 })
  }

  const videoId = extractVideoId(url)
  if (!videoId) {
    return Response.json({ error: 'Invalid YouTube URL. Make sure it is a valid youtube.com or youtu.be link.' }, { status: 400 })
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: 'GEMINI_API_KEY not configured. Copy .env.example to .env.local and add your key.' }, { status: 500 })
  }

  // Fetch video metadata
  const meta = await fetchVideoMeta(videoId)

  // Fetch transcript
  let transcript = ''
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId)
    transcript = segments.map((s: { text: string }) => s.text).join(' ')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('disabled') || message.includes('subtitles')) {
      return Response.json(
        { error: 'This video has captions disabled. Try a different tutorial — most Arduino, ESP32, and maker tutorials have auto-generated captions.' },
        { status: 422 }
      )
    }
    return Response.json(
      { error: `Could not fetch transcript: ${message}` },
      { status: 422 }
    )
  }

  if (!transcript || transcript.length < 100) {
    return Response.json(
      { error: 'Transcript was too short to extract components. Try a longer tutorial video.' },
      { status: 422 }
    )
  }

  // Truncate transcript — keep first 10000 chars to stay within token limits
  const truncatedTranscript = transcript.slice(0, 10000)

  // Build a lean catalog summary for the AI prompt
  const catalogSummary = catalogData.map((item) => ({
    sku: item.sku,
    name: item.name,
    aliases: item.aliases,
    price: item.price,
    stock: item.stock,
    qty: item.qty_available,
    specs: item.specs,
  }))

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const prompt = `You are a maker/electronics component extraction AI for an electronics store's inventory management system.

TASK: Extract all electronic components from this tutorial transcript, match each to our inventory catalog, generate engineer explanations, and suggest substitutes for out-of-stock items.

VIDEO TRANSCRIPT:
${truncatedTranscript}

OUR INVENTORY CATALOG (JSON):
${JSON.stringify(catalogSummary)}

EXTRACTION RULES:
- Extract every distinct electronic component, module, sensor, display, cable, or hardware part mentioned
- Include common consumables (resistors, capacitors, LEDs, etc.) if mentioned
- DO NOT include software libraries, tools, soldering irons, or non-purchasable items
- Deduplicate: if the same component appears multiple times, include it once with correct quantity
- If a quantity is not specified, use 1

MATCHING RULES:
- Check catalog item name AND aliases array for matches
- "Exact" = name or alias matches very closely
- "Fuzzy" = similar component, compatible specs, close match
- "AI" = you inferred the best catalog match from electronics knowledge
- "Not Found" = no suitable item in catalog (set sku/catalogName/price to null, stock to false, qtyAvailable to 0)

ENGINEER LENS: For every component, write 1-sentence plain-language explanations:
- whatItDoes: what role this part plays in this specific circuit
- whyThisSpec: why this particular value/model was chosen over alternatives
- whatChanges: what concretely happens if you swap to a different spec/model

SUBSTITUTES: For every item where stock is false, find 2-3 in-stock catalog items that could replace it. Only suggest items where stock is true in the catalog. For each substitute include:
- sku, catalogName, price, qtyAvailable from the catalog
- compatibility: "Drop-in" if it works with the same code/wiring, "Minor Change" if small adjustments needed
- note: one sentence explaining the key difference and what to watch out for

RESPONSE FORMAT:
Return ONLY a raw JSON array. No markdown, no backticks, no explanation. Start with [ and end with ]:
[
  {
    "name": "component name from transcript",
    "spec": "key specs (voltage, value, type, size)",
    "quantity": 1,
    "source": "Transcript",
    "sku": "SKU or null",
    "catalogName": "catalog item name or null",
    "price": 185,
    "stock": true,
    "qtyAvailable": 25,
    "matchType": "Exact",
    "engineerLens": {
      "whatItDoes": "One sentence about its role in this circuit.",
      "whyThisSpec": "One sentence on why this value/model.",
      "whatChanges": "One sentence on what changes if you swap it."
    },
    "substitutes": []
  }
]

For out-of-stock items, substitutes looks like:
"substitutes": [
  {
    "sku": "OLED-091-I2C",
    "catalogName": "0.91\\" OLED Display I2C",
    "price": 65,
    "qtyAvailable": 15,
    "compatibility": "Drop-in",
    "note": "Same SSD1306 driver and I2C pins — identical code. Screen is 128x32 instead of 128x64."
  }
]`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Strip any markdown code fences if present
    const clean = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const bom = JSON.parse(clean)

    if (!Array.isArray(bom)) {
      throw new Error('Response was not a JSON array')
    }

    return Response.json({ meta, bom })
  } catch (err: unknown) {
    console.error('Gemini extraction error:', err)
    return Response.json(
      { error: 'AI extraction failed. The model may be busy — please try again in a moment.' },
      { status: 500 }
    )
  }
}
