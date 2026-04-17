import React, { useState } from 'react'

import { AddIcon, RemoveIcon } from './icons';

interface QuantityEditorProps {
  qty: number;
  label?: string;
  setQty: React.Dispatch<React.SetStateAction<number>>;
}

const QuantityEditor: React.FC<QuantityEditorProps> = ({ qty, setQty, label = "Qty" }) => {
  const [focus, setFocus] = useState(false);

  return (
    <div>
      <label
        className="text-xs font-semibold uppercase tracking-widest mb-3 block"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-4 p-2 rounded-xl" style={{ background: "var(--background)" }}>
        <div className='size-14'>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="size-full rounded-2xl text-2xl font-bold flex items-center justify-center"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            <RemoveIcon fill="#ffffff" />
          </button>
        </div>
        {focus ? (
          <div className="flex-1">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(999, Number(e.target.value))))}
              onBlur={() => setFocus(false)}
              className="w-full text-center text-2xl font-bold bg-transparent focus:outline-none"
              style={{ color: "var(--foreground)" }}
            />
          </div>
        ) : (
          <span
            className="flex-1 text-center text-2xl font-bold" style={{ color: "var(--foreground)" }}
            onClick={() => setFocus(true)}
          >
            {qty}
          </span>
        )}
        <div className="size-14">
          <button
            onClick={() => setQty((q) => Math.min(999, q + 1))}
            aria-label="Increase quantity"
            className="size-full rounded-2xl text-2xl font-bold flex items-center justify-center"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            <AddIcon fill="#ffffff" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuantityEditor