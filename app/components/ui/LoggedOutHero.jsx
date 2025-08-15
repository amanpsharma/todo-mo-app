"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function LoggedOutHero({ loading, loginGoogle }) {
  const prefersReducedMotion = useReducedMotion();
  // Variants for staggered feature reveal
  const featureContainer = prefersReducedMotion
    ? undefined
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.06, delayChildren: 0.1 },
        },
      };
  const featureItem = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 8 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      };
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
        {/* Decorative background: grid + soft gradients (respects reduced motion) */}
        <div className="absolute inset-0 -z-10 opacity-50 pointer-events-none select-none">
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
          </div>
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
          <div
            className="mt-3 flex items-center justify-center gap-2"
            aria-hidden
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-2.5 py-1 text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Free to
              use
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/60 px-2.5 py-1 text-[11px] text-neutral-600 dark:text-neutral-400">
              <span className="size-1.5 rounded-full bg-sky-500" /> No credit
              card
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            onClick={loginGoogle}
            disabled={loading}
            aria-busy={loading || undefined}
            className="relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          >
            {!prefersReducedMotion && (
              <motion.span
                aria-hidden
                initial={{ x: "-120%" }}
                whileHover={{ x: "140%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-white/20 blur-md skew-x-12"
              />
            )}
            {/* Inline Google mark for better recognition */}
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 48 48"
              className="shrink-0"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.5 6.1 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-7.5 19-20 0-1.1-.1-2.1-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.5 6.1 28.9 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.3 0 10.1-2 13.6-5.2l-6.3-5.2C29.1 35.4 26.7 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.5 39.7 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.8-5 6-11.3 6-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.5 39.7 16.2 44 24 44c10.4 0 19-7.5 19-20 0-1.1-.1-2.1-.4-3.5z"
              />
            </svg>
            <span aria-live="polite">
              {loading ? "Loading…" : "Continue with Google"}
            </span>
          </motion.button>
          <motion.div
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
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

        <motion.div
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3"
          id="features"
          variants={featureContainer}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView={prefersReducedMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.3 }}
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
              className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-white/60 dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              variants={featureItem}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <Image src={f.icon} alt="" width={18} height={18} aria-hidden />
              <span className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300">
                {f.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8">
          <motion.div
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50/90 to-white/70 dark:from-neutral-900/60 dark:to-neutral-950/40 p-4 sm:p-6 shadow-inner"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            whileInView={
              prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
            }
            viewport={{ once: true, amount: 0.3 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: "easeOut" }
            }
          >
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
            <p className="mt-3 text-[11px] text-neutral-500">
              Tip: You can change theme anytime from the header and invite
              others to view a category securely.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
