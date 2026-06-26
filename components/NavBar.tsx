'use client'
import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4">
      <Link href="/">
        <div
          className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.15)' }}
          title="Home"
        >
          <img
            src="/images/3cs-logo.png"
            alt="3CS"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </Link>

      <div
        className="flex items-center gap-6 px-8 py-2 rounded-full text-sm font-medium"
        style={{ background: 'rgba(220,240,255,0.55)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/"        className="text-white hover:opacity-70 transition-opacity no-underline">Home</Link>
        <Link href="/about"   className="text-white hover:opacity-70 transition-opacity no-underline">About</Link>
        <Link href="/catalog" className="text-white hover:opacity-70 transition-opacity no-underline">Catalog</Link>
      </div>
    </nav>
  )
}
