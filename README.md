# BOMFIRE 🔥

Paste a YouTube tutorial URL → get an instant BOM matched against your store's inventory.

---

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Get a free Gemini API key
Go to https://aistudio.google.com/app/apikey → click "Create API Key" → copy it.
No credit card needed.

### 3. Add your API key
```bash
cp .env.example .env.local
# Open .env.local and paste your key:
# GEMINI_API_KEY=your_key_here
```

### 4. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## Managing Your Inventory

Edit `data/catalog.json` to add, remove, or update products.

Each entry has:
```json
{
  "sku": "YOUR-SKU-001",
  "name": "Product Display Name",
  "aliases": ["alternative name", "common nickname"],
  "category": "Category",
  "price": 150,
  "stock": true,
  "qty_available": 25,
  "unit": "pcs",
  "specs": "Key specs here"
}
```

**Tips:**
- Add plenty of `aliases` — the AI uses them for fuzzy matching
- Set `"stock": false` when out of stock
- Keep `qty_available` updated
- The `specs` field is sent to the AI to help with matching

---

## How It Works

1. User pastes a YouTube URL
2. App fetches the video transcript (requires captions to be enabled on the video)
3. Transcript is sent to Gemini AI which extracts all mentioned components
4. AI matches each component against your `catalog.json`
5. Results are shown in the BOM table with match type, stock status, and price

### Match Types
| Type | Meaning |
|------|---------|
| **Exact** | Component name closely matches a catalog entry |
| **Fuzzy** | Similar component, matched via aliases or specs |
| **AI** | AI inferred the best catalog match from context |
| **Not Found** | No suitable item in your catalog |

---

## API Rate Limits (Free Gemini Tier)

Using `gemini-2.0-flash-lite`:
- 15 requests/minute
- 1,000 requests/day

Each BOM resolution = 1 API call. You get ~1,000 demo runs per day per API key.
For 3 team members with separate keys: ~3,000 runs/day.

Switch to `gemini-2.0-flash` in `app/api/extract/route.ts` for better accuracy (250/day).

---

## Known Limitations

- Only works with YouTube videos that have captions (auto-generated or manual)
- Transcript only — does not scrape article body for non-YouTube URLs yet
- Catalog matching quality depends on how many aliases you define

---

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **youtube-transcript** — transcript fetching, no API key needed
- **@google/generative-ai** — Gemini Flash for extraction + matching
- **catalog.json** — your store's inventory (edit freely)
