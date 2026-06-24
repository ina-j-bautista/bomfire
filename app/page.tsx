'use client'

import { useState } from 'react'
import LandingScreen from '@/components/LandingScreen'
import LoadingScreen from '@/components/LoadingScreen'
import ResultsScreen from '@/components/ResultsScreen'
import type { AppState, ExtractionResult } from '@/types'

export default function Home() {
  const [state, setState] = useState<AppState>('landing')
  const [pendingUrl, setPendingUrl] = useState('')
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(url: string) {
    setPendingUrl(url)
    setError(null)
    setResult(null)
    setState('loading')
  }

  function handleComplete(data: ExtractionResult) {
    setResult(data)
    setState('results')
  }

  function handleError(msg: string) {
    setError(msg)
    setState('landing')
  }

  function handleReset() {
    setState('landing')
    setResult(null)
    setError(null)
  }

  if (state === 'landing') {
    return <LandingScreen onSubmit={handleSubmit} error={error} />
  }

  if (state === 'loading') {
    return (
      <LoadingScreen
        url={pendingUrl}
        onComplete={handleComplete}
        onError={handleError}
      />
    )
  }

  if (state === 'results' && result) {
    return <ResultsScreen result={result} onReset={handleReset} />
  }

  return null
}
