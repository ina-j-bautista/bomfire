'use client'

import { useState, useMemo } from 'react'
import NavBar from '@/components/NavBar'
import catalogData from '@/data/catalog.json'

type CatalogItem = typeof catalogData[0]

const CATEGORIES = ['All', 'Microcontroller', 'Sensor', 'Display', 'Passive', 'Driver',
                    'Power', 'Input', 'Actuator', 'Communication', 'Module', 'Storage',
                    'LED', 'Transistor', 'Connector', 'Prototyping', 'Cable', 'IC', 'Control']

const CATEGORY_ICONS: Record<string, string> = {
  Microcontroller:'🧠', Sensor:'📡', Display:'🖥', Passive:'⚡', Driver:'⚙️',
  Power:'🔋', Input:'🎮', Actuator:'🔧', Communication:'📶', Module:'📦',
  Storage:'💾', LED:'💡', Transistor:'🔌', Connector:'🔗', Prototyping:'🧪',
  Cable:'🔌', IC:'🔲', Control:'🎛',
}

function StockBadge({ stock, qty }: { stock: boolean; qty: number }) {
  if (!stock || qty === 0) {
    return <span style={{ background:'#FEE2E2', color:'#DC2626' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">Out of stock</span>
  }
  if (qty <= 5) {
    return <span style={{ background:'#FEF3C7', color:'#B45309' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">Low — {qty} left</span>
  }
  return <span style={{ background:'#DCFCE7', color:'#15803D' }} className="px-2 py-0.5 rounded-full text-xs font-semibold">{qty} in stock</span>
}

function ProductCard({ item, onNotify }: { item: CatalogItem; onNotify: (name:string)=>void }) {
  const inStock = item.stock && item.qty_available > 0
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-lg"
         style={{ background:'#F8EDE8', border:'1.5px solid rgba(150,80,60,0.15)' }}>

      {/* Image placeholder */}
      <div style={{ height: 130, background: inStock ? '#E8D8D0' : '#F0C8C0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, position:'relative' }}>
        <span style={{ fontSize: 36 }}>{CATEGORY_ICONS[item.category] ?? '📦'}</span>
        <span style={{ fontSize: 10, color: '#A07060', fontFamily:'monospace' }}>{item.sku}</span>
        {!inStock && (
          <div style={{ position:'absolute', top:8, right:8 }}>
            <span style={{ background:'#DC2626', color:'white', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 }}>OUT OF STOCK</span>
          </div>
        )}
        <div style={{ position:'absolute', top:8, left:8 }}>
          <span style={{ background:'rgba(0,0,0,0.15)', color:'white', fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:99 }}>{item.category}</span>
        </div>
        {/*
          Product image: place at /public/images/products/{item.sku.toLowerCase()}.jpg
          and replace the content above with: <img src={`/images/products/${item.sku.toLowerCase()}.jpg`} ... />
        */}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-sm font-bold text-gray-900 leading-snug mb-1">{item.name}</div>
        <div className="text-xs mb-2 flex-1" style={{ color:'#78716C', fontFamily:'monospace', lineHeight:1.5 }}>{item.specs}</div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <div className="text-xl font-black text-gray-900">₱{item.price.toLocaleString()}</div>
            <div className="mt-1"><StockBadge stock={item.stock} qty={item.qty_available} /></div>
          </div>

          {inStock ? (
            <button
              onClick={() => alert('🛒 Prototype — In a fully deployed system this would add the item to your store cart.')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background:'#7C3B2B' }}
            >
              Add to Cart
            </button>
          ) : (
            <button
              onClick={() => onNotify(item.name)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background:'#FEE2E2', color:'#DC2626', border:'1.5px solid #FECACA' }}
            >
              🔔 Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function NotifyModal({ itemName, onClose }: { itemName:string; onClose:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.5)' }}>
      <div className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" style={{ background:'#FBE9E0' }}>
        <div className="text-3xl mb-3">🔔</div>
        <h2 className="text-xl font-black text-gray-900 mb-1">
          Stock Notification
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-2"
                style={{ background:'#FED7AA', color:'#9A3412' }}>Prototype</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          <strong className="text-gray-800">{itemName}</strong> is currently out of stock.
        </p>
        <div className="rounded-xl p-4 mb-4 text-sm" style={{ background:'rgba(0,0,0,0.06)' }}>
          <div className="font-bold text-gray-800 mb-2">In a fully deployed system, this would:</div>
          <ul className="text-gray-600 space-y-1">
            <li>• Register you for an automatic restock email</li>
            <li>• Save your preference in the customer database</li>
            <li>• Include a direct purchase link in the notification</li>
          </ul>
        </div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">📧 Your email</label>
        <input type="email" disabled placeholder="your@email.com  —  not functional in prototype"
               className="w-full px-4 py-3 rounded-xl text-sm mb-2 cursor-not-allowed"
               style={{ background:'rgba(0,0,0,0.08)', color:'#9CA3AF', border:'1.5px dashed rgba(0,0,0,0.2)' }} />
        <p className="text-xs text-gray-400 mb-5">No email will be sent or stored.</p>
        <button onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background:'#7C3B2B' }}>
          Got it, close
        </button>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  const [search,    setSearch]    = useState('')
  const [category,  setCategory]  = useState('All')
  const [sortBy,    setSortBy]    = useState<'name'|'price-asc'|'price-desc'|'stock'>('name')
  const [notifyItem,setNotifyItem]= useState<string|null>(null)

  const filtered = useMemo(() => {
    let items = [...catalogData]
    if (category !== 'All') items = items.filter(i => i.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.aliases.some(a => a.includes(q)) ||
        i.specs.toLowerCase().includes(q)
      )
    }
    if (sortBy === 'name')        items.sort((a,b) => a.name.localeCompare(b.name))
    if (sortBy === 'price-asc')   items.sort((a,b) => a.price - b.price)
    if (sortBy === 'price-desc')  items.sort((a,b) => b.price - a.price)
    if (sortBy === 'stock')       items.sort((a,b) => (b.stock ? 1 : 0) - (a.stock ? 1 : 0))
    return items
  }, [search, category, sortBy])

  const totalInStock = catalogData.filter(i => i.stock && i.qty_available > 0).length
  const totalOOS     = catalogData.length - totalInStock

  return (
    <div className="min-h-screen flex flex-col" style={{ background:'#B54030' }}>
      <NavBar />
      {notifyItem && <NotifyModal itemName={notifyItem} onClose={() => setNotifyItem(null)} />}

      <div className="flex-1 px-6 pb-12" style={{ maxWidth:1200, margin:'0 auto', width:'100%' }}>

        {/* Header */}
        <div className="py-6">
          <div className="flex items-end justify-between mb-1">
            <div>
              <h1 className="text-white font-black text-2xl leading-none">🗂 Parts Catalog</h1>
              <p className="text-white opacity-70 text-sm mt-1">
                {catalogData.length} products · {totalInStock} in stock · {totalOOS} out of stock
              </p>
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-xl text-sm font-medium outline-none"
              style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1.5px solid rgba(255,255,255,0.3)' }}
            >
              <option value="name"       style={{ color:'black' }}>Sort: A–Z</option>
              <option value="price-asc"  style={{ color:'black' }}>Sort: Price ↑</option>
              <option value="price-desc" style={{ color:'black' }}>Sort: Price ↓</option>
              <option value="stock"      style={{ color:'black' }}>Sort: In stock first</option>
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, SKU, or specs…"
            className="w-full px-5 py-3 rounded-2xl text-sm outline-none mt-4"
            style={{ background:'rgba(255,255,255,0.92)', color:'#1a1a1a' }}
          />
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.filter(c => c === 'All' || catalogData.some(i => i.category === c)).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: category === c ? '#F8EDE8' : 'rgba(255,255,255,0.18)',
                color:       category === c ? '#7C3B2B' : 'white',
              }}
            >
              {CATEGORY_ICONS[c] ?? ''} {c}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-white opacity-70 text-sm mb-4">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          {category !== 'All' && ` in ${category}`}
          {search && ` matching "${search}"`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background:'#F8EDE8' }}>
            <div style={{ fontSize:48 }}>🔍</div>
            <div className="text-gray-600 mt-3">No products match your search.</div>
            <button onClick={() => { setSearch(''); setCategory('All') }}
                    className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background:'#7C3B2B' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 }}>
            {filtered.map(item => (
              <ProductCard key={item.sku} item={item} onNotify={setNotifyItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
