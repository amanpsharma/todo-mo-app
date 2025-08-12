"use client";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeaderAuth() {
  const { user, loading, loginGoogle, logout, error } = useAuth();
  const [theme, setTheme] = useState("system");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" && localStorage.getItem("theme");
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = () => {
      const prefersDark = mq?.matches;
      const dark = theme === "dark" || (theme === "system" && prefersDark);
      root.classList.toggle("dark", !!dark);
      root.classList.toggle("light", !!!dark);
    };
    apply();
    localStorage.setItem("theme", theme);
    if (theme === "system" && mq?.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    return;
  }, [theme]);

  return (
    <div className="sticky top-0 z-40 mb-6">
      <div
        className={
          scrolled
            ? "bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm text-neutral-900 dark:text-neutral-100"
            : "backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/50 bg-white/90 dark:bg-neutral-900/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
        }
      >
        <div className="mx-auto max-w-2xl px-3">
          <div className="h-12 flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-6 rounded bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                T
              </div>
              <span className="font-semibold text-sm truncate">Todo</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                aria-label="Toggle theme"
                className="text-[11px] px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 hidden sm:inline-flex"
                onClick={() =>
                  setTheme((t) =>
                    t === "light" ? "dark" : t === "dark" ? "system" : "light"
                  )
                }
                title={`Theme: ${theme}`}
              >
                {theme === "light"
                  ? "Light"
                  : theme === "dark"
                  ? "Dark"
                  : "System"}
              </button>

              {loading && (
                <span className="text-xs text-neutral-500">Loading…</span>
              )}

              {!loading && !user && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={loginGoogle}
                  className="px-3 py-1 rounded bg-violet-600 text-white text-xs hover:bg-violet-500"
                >
                  Sign in with Google
                </motion.button>
              )}

              {!loading && user && (
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt="avatar"
                      width={26}
                      height={26}
                      className="rounded-full"
                    />
                  )}
                  <span
                    className="text-xs max-w-[120px] truncate hidden sm:inline"
                    title={user.email || user.displayName}
                  >
                    {user.displayName || user.email}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Logout
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-2xl px-3 mt-2">
          <div className="px-3 py-2 text-[11px] bg-red-600/90 text-white rounded shadow">
            Auth error: {error.message || String(error)}
          </div>
        </div>
      )}
    </div>
  );
}
