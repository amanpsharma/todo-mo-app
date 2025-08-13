import { Suspense } from "react";
import TodoApp from "./components/TodoApp"; // client component

export const metadata = {
  title: "Todo App | Organize Your Tasks",
  description:
    "A modern, intuitive todo list application built with Next.js and React. Manage your daily tasks efficiently with a clean, responsive interface.",
  keywords: "todo, task manager, productivity, Next.js, React, todo list",
  authors: [{ name: "Your Name" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Todo App | Organize Your Tasks",
    description:
      "A modern, intuitive todo list application built with Next.js and React.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Todo App | Organize Your Tasks",
    description:
      "A modern, intuitive todo list application built with Next.js and React.",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen px-1 py-4 md:py-16 font-sans bg-white dark:bg-neutral-900">
      <Suspense
        fallback={
          <div className="w-full max-w-xl mx-auto">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50 p-6 shadow-sm animate-pulse h-40" />
          </div>
        }
      >
        <TodoApp />
      </Suspense>
    </main>
  );
}
