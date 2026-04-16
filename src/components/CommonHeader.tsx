import React from 'react'
import Link from 'next/link'

import ThemeToggle from './ThemeToggle'

const CommonHeader = () => {
  return (
    
      <header
        className="sticky top-0 z-10 h-20 flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--main-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/app" className="max-w-[60%] flex gap-1">
          <h1
            className="text-xl font-extrabold truncate"
            style={{ color: "var(--foreground)" }}
          >
            The Shopping
          </h1>
          <h1
            className="text-xl font-extrabold truncate"
            style={{ color: "var(--brand)" }}
          >
            List.
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>
  )
}

export default CommonHeader