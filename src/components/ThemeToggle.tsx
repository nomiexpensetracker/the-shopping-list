"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("the_shopping_list_app_theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-10 h-10 rounded-full flex items-center justify-center transition"
      style={{
        border: "1px solid var(--border)",
        color: "var(--foreground)",
      }}
    >
      {dark ? (
        <MoonIcon fill="var(--foreground)" />
      ) : (
        <SunIcon fill="var(--foreground)" />
      )}
    </button>
  );
}
