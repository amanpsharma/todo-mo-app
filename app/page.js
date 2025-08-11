import TodoApp from "./components/TodoApp"; // direct import of client component

export const metadata = {
  title: "Todo App",
  description: "A simple todo list built with Next.js",
};

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 md:py-16 font-sans bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <TodoApp />
    </main>
  );
}
