'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (url: string) => void
  error: string | null
}

export default function LandingScreen({ onSubmit, error }: Props) {
  const [url, setUrl] = useState('')
  const [validating, setValidating] = useState(false)

  function validate(input: string): string | null {
    if (!input.trim()) return 'Please paste a YouTube URL'
    const isYT = /youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts/.test(input)
    if (!isYT) return 'Only YouTube URLs are supported right now'
    return null
  }

  function handleSubmit() {
    const err = validate(url)
    if (err) { alert(err); return }
    setValidating(true)
    onSubmit(url.trim())
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #FF9A3C 0%, #FF6B35 30%, #E03060 70%, #C0156A 100%)' }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            3CS
          </div>
        </div>
        <div
          className="flex items-center gap-6 px-8 py-2 rounded-full text-sm font-medium"
          style={{ background: 'rgba(220,240,255,0.65)', backdropFilter: 'blur(12px)' }}
        >
          <span className="cursor-pointer hover:opacity-70 transition-opacity">Home</span>
          <span className="cursor-pointer hover:opacity-70 transition-opacity">About</span>
          <span className="cursor-pointer hover:opacity-70 transition-opacity">Catalog</span>
          <span className="cursor-pointer hover:opacity-70 transition-opacity">Contact</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center px-8 md:px-16 lg:px-24 relative overflow-hidden">

        {/* Background blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: '#FFD700' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: '#FF4500' }}
        />

        {/* Left content */}
        <div className="flex-1 max-w-lg z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-white text-6xl">🔥</div>
            <div>
              <h1
                className="text-white font-black leading-none"
                style={{ fontSize: '64px', letterSpacing: '-2px', textShadow: '2px 4px 16px rgba(0,0,0,0.3)' }}
              >
                BOM
                <br />
                FIRE
              </h1>
            </div>
          </div>

          <p className="text-white text-lg mb-8 opacity-90" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            Paste a maker tutorial URL. Get an instant, in-stock parts list from our inventory.
          </p>

          {/* Error message */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(0,0,0,0.35)', color: '#FFD0CC' }}
            >
              ⚠ {error}
            </div>
          )}

          {/* URL Input */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.92)',
                color: '#1a1a1a',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={validating}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{ background: '#8B2500', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              {validating ? 'Loading...' : 'RESOLVE BOM'}
            </button>
          </div>

          {/* Supported sources */}
          <div className="flex gap-2 flex-wrap">
            {['▶ YouTube', '🔧 Instructables', '⚡ Hackaday', '📝 Blog posts'].map((s) => (
              <span
                key={s}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-white text-xs mt-3 opacity-60">
            YouTube only for now. Video must have auto-generated or manual captions.
          </p>
        </div>

        {/* Right illustration */}
        <div className="hidden lg:flex flex-1 justify-center items-end relative" style={{ height: '420px' }}>
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-2xl"
            style={{ background: '#FFD700', transform: 'scale(0.7)' }}
          />
          <div className="text-center relative z-10" style={{ fontSize: '180px', lineHeight: 1 }}>
            📦
          </div>
          <div
            className="absolute"
            style={{ fontSize: '80px', bottom: '80px', right: '20px', opacity: 0.8 }}
          >
            📦
          </div>
          <div
            className="absolute"
            style={{ fontSize: '60px', bottom: '40px', left: '30px', opacity: 0.7 }}
          >
            📦
          </div>
          <div
            className="absolute top-8 right-8"
            style={{ fontSize: '48px', opacity: 0.6 }}
          >
            🔥
          </div>
        </div>
      </div>
    </div>
  )
}
