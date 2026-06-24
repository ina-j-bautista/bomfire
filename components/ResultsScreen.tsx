'use client'

import { useState } from 'react'
import type { ExtractionResult, BOMItem, Substitute } from '@/types'

interface Props {
  result: ExtractionResult
  onReset: () => void
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

function AvailBadge({ stock }: { stock: boolean }) {
  return stock
    ? <span style={{ background: '#15803D', color: 'white' }} className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">✓ In stock</span>
    : <span style={{ background: '#BE123C', color: 'white' }} className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">✗ Out of stock</span>
}

function MatchBadge({ type }: { type: BOMItem['matchType'] }) {
  const map: Record<string, { bg: string; fg: string }> = {
    'Exact':     { bg: '#15803D', fg: 'white' },
    'Fuzzy':     { bg: '#78716C', fg: 'white' },
    'AI':        { bg: '#1D4ED8', fg: 'white' },
    'Not Found': { bg: '#9F1239', fg: 'white' },
  }
  const s = map[type] ?? { bg: '#78716C', fg: 'white' }
  return <span style={{ background: s.bg, color: s.fg }} className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{type}</span>
}

function CompatBadge({ compat }: { compat: 'Drop-in' | 'Minor Change' }) {
  return compat === 'Drop-in'
    ? <span style={{ background: '#15803D', color: 'white' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">Drop-in</span>
    : <span style={{ background: '#B45309', color: 'white' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">Minor change</span>
}

// ── Substitute row ────────────────────────────────────────────────────────────

function SubstitutePanel({
  substitutes,
  selected,
  onSelect,
}: {
  substitutes: Substitute[]
  selected: string | null
  onSelect: (sku: string) => void
}) {
  if (!substitutes || substitutes.length === 0) {
    return (
      <tr>
        <td colSpan={6} style={{ background: '#F0E0D8', padding: '10px 32px' }}>
          <p className="text-xs text-orange-900 italic">No in-stock substitutes found in this catalog.</p>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={6} style={{ background: '#F0E0D8', padding: '10px 32px 16px' }}>
        <div className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-3">
          In-stock substitutes — ordered by compatibility
        </div>
        <div className="flex flex-col gap-2">
          {substitutes.map((sub) => {
            const isSel = selected === sub.sku
            return (
              <div
                key={sub.sku}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                style={{
                  background: isSel ? '#FDE68A' : 'white',
                  border: isSel ? '1.5px solid #F59E0B' : '1.5px solid rgba(150,80,60,0.15)',
                }}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="text-sm font-bold text-gray-800">{sub.catalogName}</div>
                  <div className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: 'monospace' }}>
                    {sub.sku} · {sub.qtyAvailable} in stock
                  </div>
                  {sub.note && (
                    <div className="text-xs text-gray-600 mt-1">{sub.note}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <CompatBadge compat={sub.compatibility} />
                  <span className="text-sm font-bold text-gray-800 w-14 text-right">
                    ₱{sub.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onSelect(sub.sku)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: isSel ? '#D97706' : '#7C3B2B',
                      color: 'white',
                    }}
                  >
                    {isSel ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </td>
    </tr>
  )
}

// ── Engineer Lens row ─────────────────────────────────────────────────────────

function LensPanel({ item }: { item: BOMItem }) {
  const lens = item.engineerLens
  if (!lens) return null

  const sections = [
    { label: 'What it does',          text: lens.whatItDoes },
    { label: 'Why this spec',         text: lens.whyThisSpec },
    { label: 'What changes if swapped', text: lens.whatChanges },
  ]

  return (
    <tr>
      <td colSpan={6} style={{ background: '#F5F0FF', padding: '10px 32px 16px' }}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6D28D9' }}>
          Engineer lens — {item.catalogName || item.name}
        </div>
        <div className="flex flex-col gap-3">
          {sections.map(s => (
            <div
              key={s.label}
              className="pl-3 py-1"
              style={{ borderLeft: '2px solid #A78BFA', borderRadius: 0 }}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7C3AED' }}>
                {s.label}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">{s.text}</div>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ResultsScreen({ result, onReset }: Props) {
  const { meta, bom } = result

  const [lensOn, setLensOn] = useState(false)
  const [expandedOOS, setExpandedOOS] = useState<Set<number>>(new Set())
  const [selectedSubs, setSelectedSubs] = useState<Record<number, string>>({})
  const [activeLens, setActiveLens] = useState<number | null>(null)

  const inStockCount = bom.filter(i => i.stock).length
  const oosCount     = bom.filter(i => !i.stock).length
  const totalPrice   = bom.reduce((sum, item) => {
    if (!item.stock) {
      const subSku = selectedSubs[bom.indexOf(item)]
      if (subSku && item.substitutes) {
        const sub = item.substitutes.find(s => s.sku === subSku)
        return sum + (sub?.price ?? 0)
      }
      return sum
    }
    return sum + (item.price ?? 0)
  }, 0)

  function toggleOOS(idx: number) {
    setExpandedOOS(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function selectSub(rowIdx: number, sku: string) {
    setSelectedSubs(prev => ({
      ...prev,
      [rowIdx]: prev[rowIdx] === sku ? '' : sku,
    }))
  }

  function toggleLens(idx: number) {
    setActiveLens(prev => prev === idx ? null : idx)
  }

  function copyCartText() {
    const lines = bom.map((item, idx) => {
      if (!item.stock) {
        const subSku = selectedSubs[idx]
        if (subSku && item.substitutes) {
          const sub = item.substitutes.find(s => s.sku === subSku)
          if (sub) return `${item.quantity}x ${sub.catalogName} (${sub.sku}) — ₱${sub.price} [SUBSTITUTE for ${item.name}]`
        }
        return `${item.quantity}x ${item.name} — OUT OF STOCK (no substitute selected)`
      }
      return `${item.quantity}x ${item.catalogName || item.name} (${item.sku || 'N/A'}) — ₱${item.price}`
    }).join('\n')
    navigator.clipboard.writeText(`BOMFIRE Cart — ${meta.title}\n\n${lines}\n\nEstimated total: ₱${totalPrice.toLocaleString()}`)
    alert('Cart copied to clipboard!')
  }

  const videoId = meta.thumbnailUrl.match(/vi\/([a-zA-Z0-9_-]{11})\//)?.[1]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#B54030' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm cursor-pointer hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.25)' }}
          onClick={onReset}
          title="Back to home"
        >3CS</div>
        <div
          className="flex items-center gap-6 px-8 py-2 rounded-full text-sm font-medium"
          style={{ background: 'rgba(220,240,255,0.55)', backdropFilter: 'blur(12px)' }}
        >
          {['Home','About','Catalog','Contact'].map(l => (
            <span key={l} className="cursor-pointer text-white hover:opacity-70">{l}</span>
          ))}
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 flex gap-6 px-6 pb-6" style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>

        {/* Sidebar */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-4">

          {/* Video card */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div className="rounded-xl mb-3 overflow-hidden flex items-center justify-center" style={{ height: '110px', background: '#1a1a1a' }}>
              {videoId
                ? <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                : <span className="text-white text-4xl">▶</span>}
            </div>
            <div className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">{meta.title}</div>
            <div className="text-xs text-gray-500">{meta.channel} · {bom.length} components</div>
          </div>

          {/* Sources */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Detected Sources</div>
            {['Transcript', 'Description'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <span className="text-gray-400">🎙</span><span>{s}</span>
              </div>
            ))}
          </div>

          {/* Match legend */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Match Type</div>
            {[
              { label: 'Exact',     bg: '#15803D' },
              { label: 'Fuzzy',     bg: '#78716C' },
              { label: 'AI',        bg: '#1D4ED8' },
              { label: 'Not Found', bg: '#9F1239' },
            ].map(b => (
              <div key={b.label} className="mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: b.bg }}>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Summary</div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>In stock</span>
              <span className="font-bold text-green-700">{inStockCount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700 mb-3">
              <span>Out of stock</span>
              <span className="font-bold text-red-700">{oosCount}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 mb-4" style={{ borderTop: '1px solid rgba(150,80,60,0.2)' }}>
              <span>Est. total</span>
              <span className="text-orange-900">₱{totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={copyCartText}
              className="w-full py-2 rounded-xl text-sm font-bold text-white mb-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#7C3B2B' }}
            >📋 Copy Cart</button>
            <button
              onClick={onReset}
              className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80 active:scale-95"
              style={{ background: 'rgba(0,0,0,0.1)', color: '#7C3B2B' }}
            >↩ New Search</button>
          </div>
        </div>

        {/* Main table area */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Table controls */}
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium opacity-80">
              {bom.length} components · {oosCount > 0 ? `${oosCount} need substitutes` : 'all available'}
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setLensOn(v => !v)}
                className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                style={{ background: lensOn ? '#7C3AED' : 'rgba(255,255,255,0.3)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: lensOn ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: lensOn ? '#DDD6FE' : 'rgba(255,255,255,0.7)' }}
              >
                🔬 Engineer Lens
              </span>
            </label>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#F8EDE8' }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#E8D8D0' }}>
                    <th className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider" style={{ width: '24%' }}>Item</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider" style={{ width: '14%' }}>SKU</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider" style={{ width: '15%' }}>Availability</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider" style={{ width: '10%' }}>Price</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider" style={{ width: '14%' }}>Match Type</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider" style={{ width: '12%' }}>Source</th>
                  </tr>
                </thead>

                <tbody>
                  {bom.map((item, idx) => {
                    const isOOS     = !item.stock
                    const isExpanded = expandedOOS.has(idx)
                    const lensOpen   = lensOn && activeLens === idx
                    const hasSubs    = isOOS && item.substitutes && item.substitutes.length > 0
                    const selSub     = selectedSubs[idx]
                    const rowBg      = isOOS ? '#E8C4B4' : idx % 2 === 0 ? '#F8EDE8' : '#F0E2D8'

                    // Effective price: use selected sub price for OOS rows
                    let effectivePrice = item.price
                    let effectiveName  = item.catalogName || item.name
                    if (isOOS && selSub && item.substitutes) {
                      const sub = item.substitutes.find(s => s.sku === selSub)
                      if (sub) { effectivePrice = sub.price; effectiveName = sub.catalogName }
                    }

                    return (
                      <>
                        {/* Main row */}
                        <tr
                          key={`row-${idx}`}
                          style={{ background: rowBg, borderBottom: '1px solid rgba(150,80,60,0.1)' }}
                        >
                          {/* Item */}
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-800 flex items-center gap-1 flex-wrap">
                                  {effectiveName}
                                  {item.quantity > 1 && (
                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ background: '#FED7AA', color: '#9A3412' }}>×{item.quantity}</span>
                                  )}
                                  {selSub && (
                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ background: '#DDD6FE', color: '#6D28D9' }}>sub</span>
                                  )}
                                </div>
                                {item.spec && (
                                  <div className="text-xs mt-0.5" style={{ color: '#78716C', fontFamily: 'monospace' }}>{item.spec}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3">
                            <span className="text-xs" style={{ fontFamily: 'monospace', color: '#78716C' }}>
                              {selSub || item.sku || '—'}
                            </span>
                          </td>

                          {/* Availability */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <AvailBadge stock={selSub ? true : item.stock} />
                              {isOOS && (
                                <button
                                  onClick={() => toggleOOS(idx)}
                                  className="text-xs font-semibold underline text-left transition-opacity hover:opacity-70"
                                  style={{ color: '#7C3B2B' }}
                                >
                                  {isExpanded ? '▲ hide subs' : `▼ ${hasSubs ? `${item.substitutes!.length} substitutes` : 'no subs'}`}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-gray-800">
                              {effectivePrice != null ? `₱${effectivePrice.toLocaleString()}` : '—'}
                            </span>
                          </td>

                          {/* Match type */}
                          <td className="px-4 py-3">
                            <MatchBadge type={item.matchType} />
                          </td>

                          {/* Source + lens button */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-block"
                                style={{ background: '#44211A', color: 'white' }}
                              >
                                {item.source}
                              </span>
                              {lensOn && item.engineerLens && (
                                <button
                                  onClick={() => toggleLens(idx)}
                                  className="text-xs font-semibold text-left transition-opacity hover:opacity-70"
                                  style={{ color: lensOpen ? '#7C3AED' : '#78716C' }}
                                >
                                  {lensOpen ? '▲ close' : '🔬 explain'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Engineer Lens expansion */}
                        {lensOn && lensOpen && <LensPanel key={`lens-${idx}`} item={item} />}

                        {/* Substitute expansion */}
                        {isOOS && isExpanded && (
                          <SubstitutePanel
                            key={`sub-${idx}`}
                            substitutes={item.substitutes ?? []}
                            selected={selectedSubs[idx] ?? null}
                            onSelect={(sku) => selectSub(idx, sku)}
                          />
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ background: '#E8D8D0', borderTop: '1px solid rgba(150,80,60,0.15)' }}
            >
              <span className="text-xs text-orange-900">
                {bom.length} components · {inStockCount} in stock · {oosCount} out of stock
              </span>
              <span className="text-sm font-bold text-orange-900">
                Estimated total: ₱{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* OOS notice */}
          {oosCount > 0 && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(0,0,0,0.2)', color: '#FFD0CC' }}
            >
              ⚠ {oosCount} item{oosCount > 1 ? 's are' : ' is'} out of stock — click <strong>"▼ substitutes"</strong> on any red row to see compatible alternatives from your catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
