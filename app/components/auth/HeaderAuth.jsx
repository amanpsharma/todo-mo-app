"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import ProfileModal from "./ProfileModal";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeaderAuth() {
  const { user, loading, loginGoogle, logout, error, updateUserProfile } =
    useAuth();
  const [theme, setTheme] = useState("system");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

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

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      const t = e.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
                <div className="relative">
                  <motion.button
                    ref={buttonRef}
                    aria-label="User menu"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="size-8 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800"
                  >
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-200">
                        {(user.displayName || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </motion.button>

                  {menuOpen && (
                    <motion.div
                      ref={menuRef}
                      role="menu"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-60 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-8 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 shrink-0">
                            {user.photoURL ? (
                              <Image
                                src={user.photoURL}
                                alt=""
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                                {(user.displayName || user.email || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate"
                              title={user.displayName || user.email}
                            >
                              {user.displayName ||
                                (user.email
                                  ? user.email.split("@")[0]
                                  : "User")}
                            </div>
                            {user.email && (
                              <div
                                className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate"
                                title={user.email}
                              >
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            setProfileOpen(true);
                          }}
                          className="w-full text-left text-xs px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        >
                          Edit profile
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left text-xs px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
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
      <ProfileModal
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        onSave={async (values) => {
          await updateUserProfile(values);
          setProfileOpen(false);
        }}
        initial={{
          displayName: user?.displayName || "",
          photoURL: user?.photoURL || "",
        }}
      />
    </div>
  );
}
