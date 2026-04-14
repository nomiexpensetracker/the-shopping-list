import React from 'react'

const Divider = () => {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span
        className="text-xs uppercase font-semibold tracking-widest"
        style={{ color: "var(--muted)" }}
      >
        or
      </span>
      <span className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  )
}

export default Divider