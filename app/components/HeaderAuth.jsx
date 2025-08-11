"use client";
import { useAuth } from "./AuthProvider";
import Image from "next/image";

export default function HeaderAuth() {
  const { user, loading, loginGoogle, logout, error } = useAuth();
  return (
    <header className="w-full flex items-center justify-between mb-8">
      <h2 className="text-xl font-semibold">My Todos</h2>
      {loading && <span className="text-sm text-neutral-500">Loading...</span>}
      {!loading && !user && (
        <div className="flex gap-2">
          <button
            onClick={loginGoogle}
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-500"
          >
            Google Login
          </button>
        </div>
      )}
      {!loading && user && (
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span
            className="text-sm max-w-[160px] truncate"
            title={user.email || user.displayName}
          >
            {user.displayName || user.email}
          </span>
          <button
            onClick={logout}
            className="text-sm px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Logout
          </button>
        </div>
      )}
      {error && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 max-w-sm w-full px-3 py-2 text-xs bg-red-600/90 text-white rounded shadow">
          Auth error: {error.message || String(error)}
        </div>
      )}
    </header>
  );
}
