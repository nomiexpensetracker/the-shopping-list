import React from 'react'
import Link from 'next/link'

import { SyncDataType } from '@/types/dao';
import { GetSessionDetailResponse } from '@/types/dto';
import ParticipantAvatars from './ParticipantAvatars';
import { ShareIcon } from './icons';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  session: GetSessionDetailResponse;
  syncStatus: SyncDataType;
}

const Header: React.FC<HeaderProps> = ({ session, syncStatus }) => {
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

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}

export default Header