"use client";

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import { SyncDataType } from '@/types/dao';
import { GetSessionDetailResponse } from '@/types/dto';

import ParticipantAvatars from './ParticipantAvatars';
import { ShareIcon, LogOutIcon, MoonIcon, SunIcon, RefreshIcon } from './icons';

interface HeaderProps {
  isHost: boolean;
  session: GetSessionDetailResponse;
  syncStatus: SyncDataType;
  onShare: () => void;
  onEnd: () => void;
  onRefresh?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isHost, session, syncStatus, onShare, onEnd, onRefresh }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("the_shopping_list_app_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return stored === "dark" || (!stored && prefersDark);
  });

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("the_shopping_list_app_theme", next ? "dark" : "light");
    setMenuOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-10 h-20 flex items-center justify-between px-4 py-3"
      style={{
        background: "var(--main-bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-[60%] flex flex-col">
        <h1
          className="text-xl font-extrabold truncate"
          style={{ color: "var(--brand)" }}
        >
          {session.title || "Shopping List"}
        </h1>
        {session.list_id && (
          <Link
            href={`/app/list/${session.list_id}`}
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--muted)" }}
          >
            ← back to list
          </Link>
        )}
        {syncStatus !== 'idle' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
              {syncStatus === 'syncing' ? 'Syncing' : 'Sync Error'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Participant avatars */}
        <ParticipantAvatars participants={session.participants ?? []} />

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More options"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="w-10 h-10 rounded-full flex items-center justify-center transition"
            style={{ border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 w-52 rounded-2xl shadow-xl overflow-hidden z-50"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                role="menuitem"
                onClick={onRefresh}
                disabled={syncStatus === 'syncing'}
                aria-label="Refresh session data"
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-left transition active:opacity-70"
                style={{ color: "var(--foreground)" }}
              >
                <RefreshIcon fill="var(--foreground)" />
                Refresh Session
              </button>
              <button
                role="menuitem"
                onClick={() => { onShare(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-left transition active:opacity-70"
                style={{ color: "var(--foreground)" }}
              >
                <ShareIcon fill="var(--foreground)" />
                Share Session
              </button>
              <div style={{ borderTop: "1px solid var(--border)" }} />
              {isHost && (
                <button
                  role="menuitem"
                  onClick={() => { onEnd(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-left transition active:opacity-70"
                  style={{ color: "var(--foreground)" }}
                >
                  <LogOutIcon fill="var(--foreground)" />
                  End Session
                </button>
              )}
              <div style={{ borderTop: "1px solid var(--border)" }} />
              <button
                role="menuitem"
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-left transition active:opacity-70"
                style={{ color: "var(--foreground)" }}
              >
                {dark ? <MoonIcon fill="var(--foreground)" /> : <SunIcon fill="var(--foreground)" />}
                {dark ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header