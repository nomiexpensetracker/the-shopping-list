import React, { useState } from 'react'
import Image from 'next/image'

interface QuantityEditorProps {
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
}

const QuantityEditor: React.FC<QuantityEditorProps> = ({ qty, setQty }) => {
  const [focus, setFocus] = useState(false);

  return (
    <div>
      <label
        className="text-xs font-semibold uppercase tracking-widest mb-3 block"
        style={{ color: "var(--muted)" }}
      >
        Collected Qty
      </label>
      <div className="flex items-center gap-4 p-2 rounded-xl" style={{ background: "var(--quantity-bg)" }}>
        <div className='size-14'>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="size-full rounded-2xl text-2xl font-bold flex items-center justify-center"
            style={{ background: "var(--brand-light)", color: "var(--brand)" }}
          >
            <Image src="/icons/remove-minus.svg" alt="Decrease quantity" width={24} height={24} />
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
            <Image src="/icons/add-plus.svg" alt="Increase quantity" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuantityEditor