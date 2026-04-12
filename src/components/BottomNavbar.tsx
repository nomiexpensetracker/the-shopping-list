"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AddIcon, CartIcon, HomeIcon, LogOutIcon, PacksIcon, SettingsIcon, ShareIcon } from "./icons";

// ── Prop types ────────────────────────────────────────────────────────────

type HomeNavbarProps = {
  variant: "home";
  onAdd: () => void;
};

type ListNavbarProps = {
  variant: "list";
  onCart: () => void;
  onSettings: () => void;
};

type SessionNavbarProps = {
  variant: "session";
  onShare: () => void;
  onAdd: () => void;
  onEnd: () => void;
};

type BottomNavbarProps = HomeNavbarProps | ListNavbarProps | SessionNavbarProps;

// ── Sub-components ────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
      style={{ color: active ? "var(--brand)" : "var(--muted)" }}
      aria-label={label}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function NavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
      style={{ color: active ? "var(--brand)" : "var(--muted)" }}
      aria-label={label}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </Link>
  );
}

function CenterButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <button
        onClick={onClick}
        aria-label={label}
        className="flex items-center justify-center rounded-full shadow-lg -mt-6"
        style={{
          background: "var(--brand)",
          width: 56,
          height: 56,
        }}
      >
        {icon}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function BottomNavbar(props: BottomNavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
        minHeight: 64,
      }}
      aria-label="Bottom navigation"
    >
      {props.variant === "home" && (
        <>
          <NavLink
            href="/app"
            icon={<HomeIcon fill={pathname === "/app" ? "var(--brand)" : "var(--muted)"} />}
            label="Home"
            active={pathname === "/app"}
          />
          <CenterButton
            icon={<AddIcon fill="#ffffff" />}
            label="Add New List"
            onClick={props.onAdd}
          />
          <NavLink
            href="/app/starter-packs"
            icon={<PacksIcon fill={pathname.startsWith("/app/starter-packs") ? "var(--brand)" : "var(--muted)"} />}
            label="Starter Packs"
            active={pathname.startsWith("/app/starter-packs")}
          />
        </>
      )}

      {props.variant === "list" && (
        <>
          <NavLink
            href="/app"
            icon={<HomeIcon fill="var(--muted)" />}
            label="Home"
          />
          <CenterButton
            icon={<CartIcon fill="#ffffff" />}
            label="Start Shopping"
            onClick={props.onCart}
          />
          <NavItem
            icon={<SettingsIcon fill="var(--muted)" />}
            label="Settings"
            onClick={props.onSettings}
          />
        </>
      )}

      {props.variant === "session" && (
        <>
          <NavItem
            icon={<ShareIcon fill="var(--muted)" />}
            label="Share Session"
            onClick={props.onShare}
          />
          <CenterButton
            icon={<AddIcon fill="#ffffff" />}
            label="Add Item"
            onClick={props.onAdd}
          />
          <NavItem
            icon={<LogOutIcon fill="var(--muted)" />}
            label="End Session"
            onClick={props.onEnd}
          />
        </>
      )}
    </nav>
  );
}
