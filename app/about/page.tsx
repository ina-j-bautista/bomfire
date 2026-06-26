'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

const TEAM = [
  { name: 'Sabrina "Ina" Bautista',    label: 'Ina',  role: 'Project Lead, Lead Developer & Product DesignerProject Lead • Lead Developer • Product Designer', initials: 'IB', file: 'ina',   cv: '#', portfolio: '#' },
  { name: 'Genro Gabriel D. Baldemor', label: 'Gen',  role: 'Learning Experience Designer • Content Researcher', initials: 'GB', file: 'gen',   cv: '#', portfolio: null },
  { name: 'Christian Jude J. Bermejo', label: 'Jude', role: 'Learning Experience Designer • Content Researcher', initials: 'JB', file: 'jude',  cv: '#', portfolio: null },
  { name: 'Jacqueline E. Imperial',    label: 'Jacky',role: 'UI/UX Designer • UX Researcher', initials: 'JI', file: 'jacky', cv: '#', portfolio: null },
]

// Shows the photo PNG; falls back to initials circle if image is missing
function TeamPhoto({ file, name, initials }: { file: string; name: string; initials: string }) {
  const [err, setErr] = useState(false)
  return (
    <div style={{
      width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
      background: '#C45032', margin: '0 auto 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {!err ? (
        <img
          src={`/images/team-${file}.png`}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setErr(true)}
        />
      ) : (
        <span style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>{initials}</span>
      )}
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#B54030' }}>
      <NavBar />

      <div className="flex-1 px-6 pb-12" style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {/* ── Hero — centered ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40, paddingBottom: 32 }}>
          <img
            src="/images/bomfire-logo.png"
            alt="BOMFIRE"
            style={{
              height: 110,
              objectFit: 'contain',
              display: 'block',
              marginBottom: 14,
              filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.25))',
            }}
          />
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, margin: 0 }}>
            Your tutorial. Your components. Your build.
          </p>
        </div>

        {/* ── About the project ──────────────────────────────── */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#F8EDE8' }}>
          <h2 className="font-black text-gray-900 text-xl mb-3">About the Project</h2>
          <p className="text-gray-700 leading-relaxed text-sm mb-3">
            BOMFIRE is a multi-input Bill of Materials resolver that accepts any maker inspiration — a YouTube tutorial,
            blog post, or schematic image — and outputs a fully resolved, in-stock, ready-to-checkout parts list matched
            against a seller's own warehouse inventory.
          </p>
          <p className="text-gray-700 leading-relaxed text-sm">
            Built for electronics sellers who want to bridge the gap between maker inspiration and actual purchase,
            BOMFIRE eliminates the manual translation step that causes most makers to abandon their projects before placing
            a single order. The Engineer Lens feature additionally turns every resolved part into a learning moment,
            building component intuition alongside the build.
          </p>
        </div>

        {/* ── Meet the Team ──────────────────────────────────── */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#F8EDE8' }}>
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(0,0,0,0.08)', flexShrink: 0 }}>
              <img src="/images/logo.png" alt="3CS"
                   style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-xl leading-none">Meet the Team</h2>
              <p className="text-xs text-gray-500 mt-0.5">Group 3CS — FEU Institute of Technology</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {TEAM.map(m => (
              <div key={m.label} className="rounded-xl p-4 text-center"
                   style={{ background: '#EDD8CC', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TeamPhoto file={m.file} name={m.name} initials={m.initials} />
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 1.3 }}>{m.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#C45032', marginTop: 4, marginBottom: 12 }}>{m.role}</div>

                {/* Buttons — pushed to bottom so all cards align */}
                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a href={m.cv} target="_blank" rel="noopener noreferrer"
                     style={{
                       display: 'block', width: '100%', padding: '6px 0',
                       borderRadius: 8, background: '#7C3B2B', color: 'white',
                       fontSize: 12, fontWeight: 700, textAlign: 'center',
                       textDecoration: 'none',
                     }}>
                    📄 View CV
                  </a>
                  {m.portfolio && (
                    <a href={m.portfolio} target="_blank" rel="noopener noreferrer"
                       style={{
                         display: 'block', width: '100%', padding: '6px 0',
                         borderRadius: 8, background: '#C45032', color: 'white',
                         fontSize: 12, fontWeight: 700, textAlign: 'center',
                         textDecoration: 'none',
                       }}>
                      🎨 Portfolio
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Competition ────────────────────────────────────── */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#F8EDE8' }}>
          <h2 className="font-black text-gray-900 text-xl mb-1">Competition</h2>
          <p className="text-xs text-gray-500 mb-4">What this prototype was built for</p>
          <div className="flex items-start gap-4 p-4 rounded-xl mb-4" style={{ background: '#EDD8CC' }}>
            <div style={{ fontSize: 36 }}>⚡</div>
            <div>
              <div className="font-black text-gray-900 text-base">3CS</div>
              <div className="text-sm text-gray-600 mt-1">Create and Conquer 2026</div>
              <div className="text-xs text-gray-500 mt-2">
                Theme 1: Eliminating Friction in the Maker's Bill of Materials Journey<br />
                <em>"How might we seamlessly and automatically translate maker inspiration, such as tutorials, parts lists, or schematic photos, into a fully resolved, ready-to-checkout cart of in-stock components to eliminate the friction that causes project abandonment?"</em>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="/PARTPILOT_ICGC_Submission.docx" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
               style={{ background: '#7C3B2B' }}>
              📄 View Full Project Proposal
            </a>
            <Link href="/catalog"
               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 no-underline"
               style={{ background: '#EDD8CC', color: '#7C3B2B' }}>
              🗂 Browse Catalog
            </Link>
          </div>
        </div>

        {/* ── Tech stack ─────────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={{ background: '#F8EDE8' }}>
          <h2 className="font-black text-gray-900 text-xl mb-4">Tech Stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon:'⚡', name:'Next.js 14',        desc:'App Router + API routes' },
              { icon:'🎨', name:'Tailwind CSS',       desc:'Utility-first styling' },
              { icon:'🤖', name:'Gemini 2.5 Flash',   desc:'Component extraction AI' },
              { icon:'📼', name:'youtube-transcript', desc:'Transcript fetching (no key)' },
              { icon:'📦', name:'catalog.json',       desc:'Seller inventory database' },
              { icon:'🚀', name:'Vercel',             desc:'One-command deployment' },
            ].map(t => (
              <div key={t.name} className="rounded-xl p-3 flex items-start gap-3" style={{ background:'#EDD8CC' }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
