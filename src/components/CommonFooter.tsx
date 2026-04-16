import React from 'react'
import Link from 'next/link'

const CommonFooter = () => {
  return (

    <footer className="py-6 flex justify-center gap-6">
      {(
        [
          { label: "Privacy", href: "/app/privacy-policy" },
          { label: "Security", href: "/app/security" },
          { label: "Cookies", href: "/app/cookies" },
          { label: "Terms", href: "/app/terms" },
        ] as const
      ).map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          className="text-xs hover:underline underline-offset-2 transition-opacity hover:opacity-80"
          style={{ color: "var(--muted)" }}
        >
          {label}
        </Link>
      ))}
    </footer>
  )
}

export default CommonFooter