"use client";

import { useState } from "react";

import type { Item, Participant } from "@/types/dao";
import { formatRupiah, getUserColor } from "@/lib/utils";

import { AddIcon, ChevronIcon, RemoveIcon, TrashIcon, UploadIcon } from "./icons";

interface Props {
  title: string;
  items: Item[];
  participants: Participant[];
  defaultExpanded?: boolean;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  onCollect?: (item: Item) => void;
  onRestore?: (item: Item) => void;
}

const ItemCard = ({
  title,
  items,
  onCollect,
  onDelete,
  onEdit,
  onRestore,
  participants,
  defaultExpanded = true,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Collapsible header */}
      <button
        className="w-full flex items-center justify-between px-4 py-4"
        style={{ background: "var(--main-bg)" }}
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={`item-group-${title}`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-lg font-bold" style={{ color: "var(--brand)" }}>
            {title}
          </span>
          <span
            className="text-base font-bold w-6 text-center shrink-0"
            style={{ color: "var(--brand)" }}
          >
            ({items.length})
          </span>
        </div>
        <div
          style={{
            color: "var(--muted)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <ChevronIcon fill="#636262" />
        </div>
      </button>

      {/* Items */}
      {isExpanded && (
        <div id={`item-group-${title}`}>
          {items.sort((a, b) => a.name.localeCompare(b.name)).map((item, idx) => {
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4"
                style={{
                  borderBottom:
                    idx < items.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Color User Indicator */}
                <div className="h-10 w-2 rounded-sm" style={{ background: getUserColor(item.created_by, participants) }}></div>
                {/* Checkbox */}
                {item.state === 'active' && onCollect && (
                  <button
                    onClick={() => onCollect(item)}
                    aria-label="Mark as collected"
                    className="shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition"
                    style={{
                      borderColor: "var(--brand)",
                      background: "transparent",
                      opacity: 0.55,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                  </button>
                )}

                {/* Name + description + price */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold truncate">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-sm truncate" style={{ color: "var(--muted)" }}>
                      {item.description}
                    </p>
                  )}
                  {item.state === 'collected' && item.price != null && item.price > 0 && (
                    <p className="text-sm font-medium" style={{ color: "var(--brand)" }}>
                      {formatRupiah(item.price)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {item.state === 'deleted' && onRestore && (
                  <div className='size-6'>
                    <button
                      id="restore-item"
                      aria-label="Restore item"
                      onClick={() => onRestore(item)}
                      className="size-6 text-2xl font-bold flex items-center justify-center"
                    >
                      <UploadIcon fill="#636262" />
                    </button>
                  </div>
                )}
                
                {item.state === 'active' && onEdit && onDelete && (
                  <div className="w-24 h-10 py-1 px-2 rounded-lg flex items-center justify-between" style={{ background: "var(--background)" }}>
                    <div className='size-6'>
                      <button
                        id="decrease-quantity"
                        aria-label="Decrease quantity"
                        onClick={() => item.quantity === 1 ? onDelete(item) : onEdit({...item, quantity: item.quantity - 1})}
                        className="size-6 text-2xl font-bold flex items-center justify-center"
                      >
                        {item.quantity === 1 ? <TrashIcon fill="#636262" /> : <RemoveIcon fill="#636262" />}
                      </button>
                    </div>
                    <span
                      className="text-base font-bold w-6 text-center shrink-0" style={{ color: "var(--brand)" }}
                    >
                      {item.quantity}
                    </span>
                    <div className='size-6'>
                      <button
                        id="increase-quantity"
                        aria-label="Increase quantity"
                        onClick={() => onEdit({...item, quantity: item.quantity + 1})}
                        className="size-6 text-2xl font-bold flex items-center justify-center"
                      >
                        <AddIcon fill="#065f46" />
                      </button>
                    </div>
                  </div>
                )}

                {item.state === 'collected' && (
                  <span
                    className="text-base font-bold w-6 text-center shrink-0" style={{ color: "var(--brand)" }}
                  >
                    {item.quantity}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ItemCard;