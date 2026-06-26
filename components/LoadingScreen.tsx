'use client'

import { useEffect, useState, useRef } from 'react'
import type { ExtractionResult } from '@/types'
import NavBar from '@/components/NavBar'

type StepStatus = 'pending' | 'running' | 'done'

interface Step {
  id: string
  label: string
  sub: string
  status: StepStatus
}

interface Props {
  url: string
  onComplete: (result: ExtractionResult) => void
  onError: (msg: string) => void
}

const INITIAL_STEPS: Step[] = [
  { id: 'fetch',   label: 'Fetching content',       sub: 'Transcript + description',        status: 'running' },
  { id: 'scan',    label: 'Scanning images',         sub: 'Checking video description',      status: 'pending' },
  { id: 'extract', label: 'Extracting components…',  sub: 'Reading tutorial with Gemini AI', status: 'pending' },
  { id: 'resolve', label: 'Resolving SKUs',          sub: 'Matching to store catalog',       status: 'pending' },
  { id: 'build',   label: 'Building cart',           sub: 'Checking stock + substitutes',    status: 'pending' },
]

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export default function LoadingScreen({ url, onComplete, onError }: Props) {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [foundComponents, setFoundComponents] = useState<string[]>([])
  const [videoMeta, setVideoMeta] = useState<{ title: string; channel: string } | null>(null)
  const called = useRef(false)

  function setStepStatus(index: number, status: StepStatus) {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s))
  }

  useEffect(() => {
    if (called.current) return
    called.current = true

    async function run() {
      // Step 1: fetch — starts immediately (shown as running)
      await sleep(900)
      setStepStatus(0, 'done')
      setStepStatus(1, 'running')

      // Step 2: scan
      await sleep(700)
      setStepStatus(1, 'done')
      setStepStatus(2, 'running')

      // Trickle in some placeholder component names while waiting
      const placeholders = ['Arduino…', 'Sensor…', 'Display…', 'Resistors…', 'Capacitors…']
      let i = 0
      const tickle = setInterval(() => {
        if (i < placeholders.length) {
          setFoundComponents(prev => [...prev, placeholders[i]])
          i++
        } else {
          clearInterval(tickle)
        }
      }, 600)

      // Make the actual API call
      try {
        const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        clearInterval(tickle)

        if (!res.ok) {
          onError(data.error || 'Extraction failed')
          return
        }

        // Update video meta for display
        setVideoMeta({ title: data.meta.title, channel: data.meta.channel })

        // Replace placeholder chips with real component names
        const names: string[] = data.bom
          .slice(0, 8)
          .map((item: { name: string }) => item.name)
        setFoundComponents(names)

        // Advance remaining steps
        setStepStatus(2, 'done')
        setStepStatus(3, 'running')
        await sleep(500)
        setStepStatus(3, 'done')
        setStepStatus(4, 'running')
        await sleep(500)
        setStepStatus(4, 'done')

        await sleep(300)
        onComplete(data)
      } catch (err) {
        clearInterval(tickle)
        onError('Network error — make sure the dev server is running and try again.')
      }
    }

    run()
  }, [url, onComplete, onError])

  function stepIcon(status: StepStatus) {
    if (status === 'done')    return <span className="text-green-600 text-base">✓</span>
    if (status === 'running') return <span className="spin inline-block text-orange-500 text-base">⟳</span>
    return <span className="text-gray-400 text-base">○</span>
  }

  function stepBadge(status: StepStatus) {
    if (status === 'done')    return { bg: '#D1FAE5', color: '#065F46', label: 'done' }
    if (status === 'running') return { bg: '#FEF3C7', color: '#92400E', label: 'running' }
    return { bg: '#F3F4F6', color: '#9CA3AF', label: 'pending' }
  }

  // Extract video ID for thumbnail
  const videoId = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#B54030' }}>
      <NavBar />

      {/* Body */}
      <div className="flex-1 flex gap-6 px-6 pb-6" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

        {/* Left sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">
          {/* Video card */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div
              className="rounded-xl mb-3 flex items-center justify-center overflow-hidden"
              style={{ height: '120px', background: '#1a1a1a' }}
            >
              {videoId ? (
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt="video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl">▶</span>
              )}
            </div>
            <div className="text-sm font-semibold text-gray-800 leading-snug mb-1">
              {videoMeta?.title || 'Loading video info…'}
            </div>
            <div className="text-xs text-gray-500">
              {videoMeta?.channel || '—'}
            </div>
          </div>

          {/* Detected sources */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">
              Detected Sources
            </div>
            {['Transcript', 'Description'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <span className="text-gray-400">🎙</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          {/* Match type legend */}
          <div className="rounded-2xl p-4" style={{ background: '#F8EDE8' }}>
            <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">
              Match Type
            </div>
            {[
              { label: 'Exact',     bg: '#15803D', color: 'white' },
              { label: 'Fuzzy',     bg: '#78716C', color: 'white' },
              { label: 'AI',        bg: '#1D4ED8', color: 'white' },
              { label: 'Not Found', bg: '#9F1239', color: 'white' },
            ].map(b => (
              <div key={b.label} className="mb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: b.bg, color: b.color }}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right main */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Pipeline steps */}
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => {
              const badge = stepBadge(step.status)
              return (
                <div
                  key={step.id}
                  className="rounded-2xl flex items-center gap-4 px-5 py-4 transition-all"
                  style={{
                    background: step.status === 'pending' ? 'rgba(248,237,232,0.4)' : '#F8EDE8',
                    opacity: step.status === 'pending' ? 0.55 : 1,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: step.status === 'done' ? '#D1FAE5' : step.status === 'running' ? '#FEF3C7' : '#E5E7EB',
                    }}
                  >
                    {stepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800">{step.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{step.sub}</div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Components found chips */}
          {foundComponents.length > 0 && (
            <div className="rounded-2xl px-5 py-4" style={{ background: '#F8EDE8' }}>
              <div className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-3">
                Components Found
              </div>
              <div className="flex flex-wrap gap-2">
                {foundComponents.map((name, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: '#7C3B2B' }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
