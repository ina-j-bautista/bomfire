'use client'
import { useState } from 'react'
import NavBar from '@/components/NavBar'

interface Props {
  onSubmit: (url: string) => void
  error: string | null
}

export default function LandingScreen({ onSubmit, error }: Props) {
  const [url, setUrl] = useState('')

  function handleSubmit() {
    const v = url.trim()
    if (!v) { alert('Please paste a YouTube URL'); return }
    const isYT = /youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts/.test(v)
    if (!isYT) { alert('Only YouTube URLs are supported right now'); return }
    onSubmit(v)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(120deg, #FF9A3C 0%, #FF6B35 35%, #E8405A 70%, #C8186A 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background blobs — match the organic shapes in the mockup */}
      <div style={{
        position: 'absolute', top: '-10%', left: '5%',
        width: 500, height: 500, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
        background: 'rgba(255,180,60,0.35)', filter: 'blur(8px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '15%',
        width: 600, height: 400, borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
        background: 'rgba(255,140,40,0.3)', filter: 'blur(12px)',
        pointerEvents: 'none',
      }} />

      <NavBar />

      <div className="flex-1 flex items-center" style={{ padding: '0 48px 32px', gap: 40 }}>

        {/* ── LEFT — logo + form ──────────────────────────────────── */}
        <div style={{ flex: 1, maxWidth: 520, position: 'relative', zIndex: 2 }}>

          {/* BOMFIRE logo image */}
          <div style={{ marginBottom: 24 }}>
            <img
              src="/images/bomfire-logo.png"
              alt="BOMFIRE"
              style={{
                maxHeight: 300,
                maxWidth: 500,
                objectFit: 'contain',
                objectPosition: 'left center',
                display: 'block',
                filter: 'drop-shadow(2px 6px 18px rgba(0,0,0,0.25))',
              }}
            />
          </div>

          {/* Subtitle */}
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 15,
            marginBottom: 28,
            lineHeight: 1.5,
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}>
            Paste a maker tutorial URL. Get an instant, in-stock parts list matched against your store inventory.
          </p>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 16px', borderRadius: 10,
              background: 'rgba(0,0,0,0.35)', color: '#FFD0CC', fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* URL input + button */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="https://youtube.com/watch?v=..."
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12,
                fontSize: 13, fontFamily: 'monospace', outline: 'none', border: 'none',
                background: 'rgba(255,255,255,0.92)', color: '#1a1a1a',
              }}
            />
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 22px', borderRadius: 12, border: 'none',
                fontWeight: 800, fontSize: 13, color: 'white', cursor: 'pointer',
                background: '#8B2500',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                letterSpacing: 0.5,
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              RESOLVE BOM
            </button>
          </div>

          {/* Source chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['▶ YouTube', '🔧 Instructables', '⚡ Hackaday', '📝 Blog posts'].map(s => (
              <span key={s} style={{
                padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                background: 'rgba(255,255,255,0.2)', color: 'white',
              }}>{s}</span>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 10 }}>
            YouTube only for now. Video must have auto-generated or manual captions.
          </p>
        </div>

        {/* ── RIGHT — fire decal + white oval glow ───────────────── */}
        <div
          className="hidden lg:flex"
          style={{
            flex: 1, justifyContent: 'center', alignItems: 'center',
            position: 'relative', minHeight: 460,
          }}
        >
          {/* White oval glow — large soft radial bloom */}
          <div style={{
            position: 'absolute',
            width: 680, height: 780,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.65) 28%, rgba(255,255,255,0.2) 55%, transparent 72%)',
            filter: 'blur(36px)',
            transform: 'scaleX(0.82)',
            pointerEvents: 'none',
          }} />

          {/* Subtle secondary warm glow ring */}
          <div style={{
            position: 'absolute',
            width: 580, height: 660,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,220,120,0.45) 0%, transparent 65%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }} />

          {/* Fire decal image */}
          <img
            src="/images/fire-decal.png"
            alt=""
            aria-hidden="true"
            style={{
              maxHeight: 620,
              maxWidth: 680,
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 8px 24px rgba(180,80,0,0.3))',
            }}
          />
        </div>

      </div>
    </div>
  )
}
