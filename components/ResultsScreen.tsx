'use client'

import { useState, useCallback } from 'react'
import type { ExtractionResult, BOMItem, Substitute, EngineerLens } from '@/types'
import NavBar from '@/components/NavBar'

async function fetchLens(name: string, spec: string, title: string): Promise<EngineerLens> {
  const p = new URLSearchParams({ name, spec, context: title })
  const res = await fetch(`/api/lens?${p}`)
  if (!res.ok) throw new Error('Lens fetch failed')
  return res.json()
}

// ── Badges ────────────────────────────────────────────────────────────────────
function AvailBadge({ stock }: { stock: boolean }) {
  return stock
    ? <span style={{ background:'#15803D', color:'white' }} className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">✓ In stock</span>
    : <span style={{ background:'#BE123C', color:'white' }} className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">✗ Out of stock</span>
}
function MatchBadge({ type }: { type: BOMItem['matchType'] }) {
  const m: Record<string, { bg: string }> = {
    'Exact':     { bg:'#15803D' },
    'Fuzzy':     { bg:'#78716C' },
    'AI':        { bg:'#1D4ED8' },
    'Not Found': { bg:'#9F1239' },
  }
  const s = m[type] ?? { bg:'#78716C' }
  return <span style={{ background:s.bg, color:'white' }} className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{type}</span>
}
function CompatBadge({ compat }: { compat:'Drop-in'|'Minor Change' }) {
  return compat === 'Drop-in'
    ? <span style={{ background:'#15803D', color:'white' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">Drop-in</span>
    : <span style={{ background:'#B45309', color:'white' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">Minor change</span>
}

// ── Sub panel ─────────────────────────────────────────────────────────────────
function SubstitutePanel({ substitutes, selected, onSelect }: {
  substitutes: Substitute[]; selected: string|null; onSelect: (sku:string)=>void
}) {
  if (!substitutes?.length) return (
    <tr><td colSpan={7} style={{ background:'#F0E0D8', padding:'10px 32px' }}>
      <p className="text-xs text-orange-900 italic">No in-stock substitutes found in this catalog.</p>
    </td></tr>
  )
  return (
    <tr><td colSpan={7} style={{ background:'#F0E0D8', padding:'10px 32px 16px' }}>
      <div className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-3">In-stock substitutes</div>
      <div className="flex flex-col gap-2">
        {substitutes.map(sub => {
          const sel = selected === sub.sku
          return (
            <div key={sub.sku} className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                 style={{ background: sel ? '#FDE68A' : 'white', border: sel ? '1.5px solid #F59E0B' : '1.5px solid rgba(150,80,60,0.15)' }}>
              <div className="flex-1 min-w-0 mr-4">
                <div className="text-sm font-bold text-gray-800">{sub.catalogName}</div>
                <div className="text-xs text-gray-500 mt-0.5" style={{ fontFamily:'monospace' }}>{sub.sku} · {sub.qtyAvailable} in stock</div>
                {sub.note && <div className="text-xs text-gray-600 mt-1">{sub.note}</div>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <CompatBadge compat={sub.compatibility} />
                <span className="text-sm font-bold w-14 text-right">₱{sub.price.toLocaleString()}</span>
                <button onClick={() => onSelect(sub.sku)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                        style={{ background: sel ? '#D97706' : '#7C3B2B', color:'white' }}>
                  {sel ? '✓ Selected' : 'Select'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </td></tr>
  )
}

// ── Engineer Lens panel ───────────────────────────────────────────────────────
function LensPanel({ lens, name }: { lens: EngineerLens|'loading'|'error'; name: string }) {
  if (!lens) return null
  if (lens === 'loading') return (
    <tr><td colSpan={7} style={{ background:'#F5F0FF', padding:'10px 32px' }}>
      <span style={{ fontSize:12, color:'#7C3AED' }}>Loading explanation…</span>
    </td></tr>
  )
  if (lens === 'error') return (
    <tr><td colSpan={7} style={{ background:'#F5F0FF', padding:'10px 32px' }}>
      <span style={{ fontSize:12, color:'#9F1239' }}>Could not load explanation. Try again.</span>
    </td></tr>
  )
  const sections = [
    { label:'What it does',            text:(lens as EngineerLens).whatItDoes },
    { label:'Why this spec',           text:(lens as EngineerLens).whyThisSpec },
    { label:'What changes if swapped', text:(lens as EngineerLens).whatChanges },
  ]
  return (
    <tr><td colSpan={7} style={{ background:'#F5F0FF', padding:'10px 32px 16px' }}>
      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:'#6D28D9' }}>
        Engineer lens — {name}
      </div>
      <div className="flex flex-col gap-3">
        {sections.map(s => (
          <div key={s.label} className="pl-3 py-1" style={{ borderLeft:'2px solid #A78BFA' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color:'#7C3AED' }}>{s.label}</div>
            <div className="text-sm text-gray-700 leading-relaxed">{s.text}</div>
          </div>
        ))}
      </div>
    </td></tr>
  )
}

// ── Cart modal ────────────────────────────────────────────────────────────────
function CartModal({ count, onClose }: { count: number; onClose: ()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" style={{ background:'#FBE9E0' }}>
        <div className="text-3xl mb-3">🛒</div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Cart Ready <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-2" style={{ background:'#FED7AA', color:'#9A3412' }}>Prototype</span></h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          This would add <strong>{count} in-stock item{count !== 1 ? 's' : ''}</strong> to your store cart.
        </p>
        <div className="rounded-xl p-4 mb-5 text-sm" style={{ background:'rgba(0,0,0,0.06)' }}>
          <div className="font-bold text-gray-800 mb-2">In a fully deployed system, this button would:</div>
          <ul className="text-gray-600 space-y-1">
            <li>• Create a new order in your store management system</li>
            <li>• Reserve stock from your warehouse inventory</li>
            <li>• Generate a printable pick list for fulfilment</li>
            <li>• Email a cart summary to the customer</li>
          </ul>
        </div>
        <p className="text-xs text-gray-400 mb-5">Since this is a prototype, no items have been added and no inventory has been changed.</p>
        <button onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background:'#7C3B2B' }}>
          Got it, close
        </button>
      </div>
    </div>
  )
}

// ── Notify modal ──────────────────────────────────────────────────────────────
function NotifyModal({ itemName, onClose }: { itemName: string; onClose: ()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" style={{ background:'#FBE9E0' }}>
        <div className="text-3xl mb-3">🔔</div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Stock Notification <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-2" style={{ background:'#FED7AA', color:'#9A3412' }}>Prototype</span></h2>
        <p className="text-sm text-gray-500 mb-4"><strong className="text-gray-800">{itemName}</strong> is currently out of stock.</p>

        <div className="rounded-xl p-4 mb-4 text-sm" style={{ background:'rgba(0,0,0,0.06)' }}>
          <div className="font-bold text-gray-800 mb-2">In a fully deployed system, entering your email would:</div>
          <ul className="text-gray-600 space-y-1">
            <li>• Register you for automatic restock notification</li>
            <li>• Save your preference in the customer database</li>
            <li>• Include a direct purchase link in the email</li>
          </ul>
        </div>

        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">📧 Your email address</label>
        <input
          type="email"
          disabled
          placeholder="your@email.com  —  not functional in prototype"
          className="w-full px-4 py-3 rounded-xl text-sm mb-2 cursor-not-allowed"
          style={{ background:'rgba(0,0,0,0.08)', color:'#9CA3AF', border:'1.5px dashed rgba(0,0,0,0.2)' }}
        />
        <p className="text-xs text-gray-400 mb-5">No email will be sent or stored — this input is disabled in the prototype.</p>

        <button onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background:'#7C3B2B' }}>
          Got it, close
        </button>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ResultsScreen({ result, onReset }: { result: ExtractionResult; onReset: ()=>void }) {
  const { meta, bom } = result

  const [lensOn,      setLensOn]      = useState(false)
  const [expandedOOS, setExpandedOOS] = useState<Set<number>>(new Set())
  const [selectedSubs,setSelectedSubs]= useState<Record<number, string>>({})
  const [activeLens,  setActiveLens]  = useState<number|null>(null)
  const [lensCache,   setLensCache]   = useState<Record<number, EngineerLens|'loading'|'error'>>({})
  const [showCart,    setShowCart]    = useState(false)
  const [notifyItem,  setNotifyItem]  = useState<string|null>(null)

  const openLens = useCallback(async (idx: number, item: BOMItem) => {
    if (activeLens === idx) { setActiveLens(null); return }
    setActiveLens(idx)
    if (lensCache[idx]) return
    setLensCache(prev => ({ ...prev, [idx]:'loading' }))
    try {
      const data = await fetchLens(item.catalogName || item.name, item.spec, meta.title)
      setLensCache(prev => ({ ...prev, [idx]:data }))
    } catch {
      setLensCache(prev => ({ ...prev, [idx]:'error' }))
    }
  }, [activeLens, lensCache, meta.title])

  // Match type counts
  const matchCounts = {
    Exact:      bom.filter(i => i.matchType === 'Exact').length,
    Fuzzy:      bom.filter(i => i.matchType === 'Fuzzy').length,
    AI:         bom.filter(i => i.matchType === 'AI').length,
    'Not Found':bom.filter(i => i.matchType === 'Not Found').length,
  }
  const inStockCount = bom.filter(i => i.stock).length
  const oosCount     = bom.filter(i => !i.stock).length

  const totalPrice = bom.reduce((sum, item, idx) => {
    if (!item.stock) {
      const sub = item.substitutes?.find(s => s.sku === selectedSubs[idx])
      return sum + (sub?.price ?? 0)
    }
    return sum + (item.price ?? 0)
  }, 0)

  function copyCartText() {
    const lines = bom.map((item, idx) => {
      if (!item.stock) {
        const sub = item.substitutes?.find(s => s.sku === selectedSubs[idx])
        if (sub) return `${item.quantity}x ${sub.catalogName} (${sub.sku}) — ₱${sub.price} [sub for ${item.name}]`
        return `${item.quantity}x ${item.name} — OUT OF STOCK`
      }
      return `${item.quantity}x ${item.catalogName || item.name} (${item.sku || 'N/A'}) — ₱${item.price}`
    }).join('\n')
    navigator.clipboard.writeText(`BOMFIRE Cart — ${meta.title}\n\n${lines}\n\nTotal: ₱${totalPrice.toLocaleString()}`)
    alert('Cart copied to clipboard!')
  }

  const videoId = meta.thumbnailUrl.match(/vi\/([a-zA-Z0-9_-]{11})\//)?.[1]
  const matchColors: Record<string, string> = { Exact:'#15803D', Fuzzy:'#78716C', AI:'#1D4ED8', 'Not Found':'#9F1239' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background:'#B54030' }}>
      <NavBar />

      {/* Modals */}
      {showCart   && <CartModal   count={inStockCount} onClose={() => setShowCart(false)} />}
      {notifyItem && <NotifyModal itemName={notifyItem} onClose={() => setNotifyItem(null)} />}

      <div className="flex-1 flex gap-6 px-6 pb-6" style={{ maxWidth:1240, margin:'0 auto', width:'100%' }}>

        {/* Sidebar */}
        <div style={{ width:220, flexShrink:0 }} className="flex flex-col gap-4">

          {/* Video card */}
          <div className="rounded-2xl p-4" style={{ background:'#F8EDE8' }}>
            <div className="rounded-xl mb-3 overflow-hidden flex items-center justify-center" style={{ height:110, background:'#1a1a1a' }}>
              {videoId
                ? <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                : <span className="text-white text-4xl">▶</span>}
            </div>
            <div className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">{meta.title}</div>
            <div className="text-xs text-gray-500">{meta.channel} · {bom.length} components</div>
          </div>

          {/* Sources */}
          <div className="rounded-2xl p-4" style={{ background:'#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Detected Sources</div>
            {['Transcript','Description'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <span className="text-gray-400">🎙</span><span>{s}</span>
              </div>
            ))}
          </div>

          {/* Match type legend WITH counts */}
          <div className="rounded-2xl p-4" style={{ background:'#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Match Type</div>
            {(Object.keys(matchCounts) as Array<keyof typeof matchCounts>).map(type => (
              <div key={type} className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ background: matchColors[type] }}>{type}</span>
                <span className="text-sm font-bold text-gray-700">{matchCounts[type]}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-2xl p-4" style={{ background:'#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">Summary</div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>In stock</span><span className="font-bold text-green-700">{inStockCount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700 mb-3">
              <span>Out of stock</span><span className="font-bold text-red-700">{oosCount}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 mb-4"
                 style={{ borderTop:'1px solid rgba(150,80,60,0.2)' }}>
              <span>Est. total</span>
              <span className="text-orange-900">₱{totalPrice.toLocaleString()}</span>
            </div>
            <button onClick={copyCartText}
                    className="w-full py-2 rounded-xl text-sm font-bold text-white mb-2 transition-all hover:opacity-90 active:scale-95"
                    style={{ background:'#7C3B2B' }}>📋 Copy Cart</button>
            <button onClick={onReset}
                    className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80 active:scale-95"
                    style={{ background:'rgba(0,0,0,0.1)', color:'#7C3B2B' }}>↩ New Search</button>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Controls bar */}
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium opacity-80">
              {bom.length} components · {oosCount > 0 ? `${oosCount} out of stock` : 'all available'}
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => setLensOn(v => !v)}
                   className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                   style={{ background: lensOn ? '#7C3AED' : 'rgba(255,255,255,0.3)' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                     style={{ left: lensOn ? 22 : 2, boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: lensOn ? '#DDD6FE' : 'rgba(255,255,255,0.7)' }}>
                🔬 Engineer Lens
              </span>
            </label>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background:'#F8EDE8' }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#E8D8D0' }}>
                    {['Item','SKU','Availability','Price','Match Type','Source',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-orange-900 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bom.map((item, idx) => {
                    const isOOS      = !item.stock
                    const isExpanded = expandedOOS.has(idx)
                    const lensOpen   = lensOn && activeLens === idx
                    const lensData   = lensCache[idx]
                    const selSub     = selectedSubs[idx]
                    const rowBg      = isOOS ? '#E8C4B4' : idx % 2 === 0 ? '#F8EDE8' : '#F0E2D8'

                    let effectivePrice = item.price
                    let effectiveName  = item.catalogName || item.name
                    if (isOOS && selSub && item.substitutes) {
                      const sub = item.substitutes.find(s => s.sku === selSub)
                      if (sub) { effectivePrice = sub.price; effectiveName = sub.catalogName }
                    }

                    return (
                      <>
                        <tr key={`row-${idx}`} style={{ background:rowBg, borderBottom:'1px solid rgba(150,80,60,0.1)' }}>
                          {/* Item */}
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-gray-800 flex items-center gap-1 flex-wrap">
                              {effectiveName}
                              {item.quantity > 1 && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                                      style={{ background:'#FED7AA', color:'#9A3412' }}>×{item.quantity}</span>
                              )}
                              {selSub && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                                      style={{ background:'#DDD6FE', color:'#6D28D9' }}>sub</span>
                              )}
                            </div>
                            {item.spec && (
                              <div className="text-xs mt-0.5" style={{ color:'#78716C', fontFamily:'monospace' }}>{item.spec}</div>
                            )}
                          </td>
                          {/* SKU */}
                          <td className="px-4 py-3">
                            <span className="text-xs" style={{ fontFamily:'monospace', color:'#78716C' }}>
                              {selSub || item.sku || '—'}
                            </span>
                          </td>
                          {/* Availability */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <AvailBadge stock={selSub ? true : item.stock} />
                              {isOOS && (
                                <>
                                  <button onClick={() => {
                                    setExpandedOOS(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n })
                                  }} className="text-xs font-semibold underline text-left hover:opacity-70"
                                          style={{ color:'#7C3B2B' }}>
                                    {isExpanded ? '▲ hide subs' : `▼ ${item.substitutes?.length ?? 0} substitutes`}
                                  </button>
                                  <button onClick={() => setNotifyItem(item.catalogName || item.name)}
                                          className="text-xs font-semibold text-left hover:opacity-70 transition-opacity"
                                          style={{ color:'#9F1239' }}>
                                    🔔 Notify me
                                  </button>
                                </>
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
                          <td className="px-4 py-3"><MatchBadge type={item.matchType} /></td>
                          {/* Source */}
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-block"
                                  style={{ background:'#44211A', color:'white' }}>{item.source}</span>
                          </td>
                          {/* Explain */}
                          <td className="px-4 py-3">
                            {lensOn && (
                              <button onClick={() => openLens(idx, item)}
                                      className="text-xs font-semibold hover:opacity-70"
                                      style={{ color: lensOpen ? '#7C3AED' : '#78716C' }}>
                                {lensOpen ? '▲ close' : lensData === 'loading' ? '⟳ …' : '🔬 explain'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {lensOn && lensOpen && lensData && <LensPanel key={`lens-${idx}`} lens={lensData} name={item.catalogName || item.name} />}
                        {isOOS && isExpanded && (
                          <SubstitutePanel key={`sub-${idx}`} substitutes={item.substitutes ?? []}
                                           selected={selectedSubs[idx] ?? null}
                                           onSelect={sku => setSelectedSubs(prev => ({ ...prev, [idx]: prev[idx] === sku ? '' : sku }))} />
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-5 py-3"
                 style={{ background:'#E8D8D0', borderTop:'1px solid rgba(150,80,60,0.15)' }}>
              <span className="text-xs text-orange-900">
                {bom.length} components · {inStockCount} in stock · {oosCount} out of stock
              </span>
              <span className="text-sm font-bold text-orange-900">
                Estimated total: ₱{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ── ADD ALL TO CART ────────────────────────────────────────── */}
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8B2500 0%, #C45032 100%)', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}
          >
            🛒 Add All to Cart ({inStockCount} in-stock item{inStockCount !== 1 ? 's' : ''})
          </button>

          {oosCount > 0 && (
            <div className="px-4 py-3 rounded-xl text-sm"
                 style={{ background:'rgba(0,0,0,0.2)', color:'#FFD0CC' }}>
              ⚠ {oosCount} item{oosCount > 1 ? 's are' : ' is'} out of stock — click <strong>▼ substitutes</strong> on any red row to pick an alternative, or <strong>🔔 Notify me</strong> to register for restock alerts.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
