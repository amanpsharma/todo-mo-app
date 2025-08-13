"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function LoggedOutHero({ loading, loginGoogle }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-2"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: "easeOut" }
      }
    >
      <section
        className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 p-6 sm:p-10 shadow-sm"
        aria-labelledby="hero-title"
        aria-describedby="hero-desc"
      >
        <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none select-none">
          <motion.div
            className="absolute -top-24 -right-24 h-64 w-64 bg-gradient-to-tr from-violet-500/30 to-fuchsia-400/30 blur-3xl rounded-full"
            animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            className="absolute -bottom-24 -left-24 h-64 w-64 bg-gradient-to-br from-sky-400/30 to-emerald-400/30 blur-3xl rounded-full"
            animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }
            }
          />
        </div>
        <div className="text-center">
          <h1
            id="hero-title"
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Organize your day
            </span>{" "}
            beautifully
          </h1>
          <p
            id="hero-desc"
            className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400"
          >
            Fast, simple, and shareable todo lists with categories, animated
            modals, and read-only sharing. Powered by Next.js 15 and React 19.
            Secure with Firebase Auth and MongoDB.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            onClick={loginGoogle}
            disabled={loading}
            aria-busy={loading || undefined}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image src="/globe.svg" alt="" width={16} height={16} aria-hidden />
            <span aria-live="polite">
              {loading ? "Loading…" : "Continue with Google"}
            </span>
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex"
          >
            <Link
              href="#features"
              className="text-sm px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/50"
            >
              Explore features
            </Link>
          </motion.div>
        </div>

        <div
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3"
          id="features"
        >
          {[
            { icon: "/window.svg", label: "Clean, accessible UI" },
            { icon: "/file.svg", label: "Categories + filters" },
            { icon: "/globe.svg", label: "Share, view-only" },
            { icon: "/next.svg", label: "Next.js 15 (App Router)" },
            { icon: "/vercel.svg", label: "Fast deploy on Vercel" },
            { icon: "/globe.svg", label: "React 19 + Framer Motion 11" },
          ].map((f) => (
            <motion.div
              key={f.label}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-white/60 dark:bg-neutral-900/60"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <Image src={f.icon} alt="" width={18} height={18} aria-hidden />
              <span className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300">
                {f.label}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50/90 to-white/70 dark:from-neutral-900/60 dark:to-neutral-950/40 p-4 sm:p-6 shadow-inner">
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-3">
              <Image
                src="/window.svg"
                alt=""
                width={14}
                height={14}
                aria-hidden
              />
              Preview
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="size-4 accent-blue-600"
                />
                <span className="line-through text-neutral-400">
                  Welcome to your Todo app
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  readOnly
                  className="size-4 accent-blue-600"
                />
                <span>
                  Add tasks and{" "}
                  <span className="font-medium">organize by category</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  readOnly
                  className="size-4 accent-blue-600"
                />
                <span>
                  <span className="font-medium">Share</span> a category as
                  view-only
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
