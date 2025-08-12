import TodoApp from "./components/TodoApp"; // direct import of client component

export const metadata = {
  title: "Todo App",
  description: "A simple todo list built with Next.js",
};

export default function Home() {
  return (
    <main className="min-h-screen px-1 py-4 md:py-16 font-sans bg-white dark:bg-neutral-900">
      <TodoApp />
    </main>
  );
}
