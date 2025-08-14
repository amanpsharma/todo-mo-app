"use client";
import React from "react";
import { FiTrash2, FiLogOut } from "react-icons/fi";

export function IconTrash({ className = "", ...props }) {
  return <FiTrash2 className={`h-4 w-4 ${className}`} aria-hidden {...props} />;
}

export function IconExit({ className = "", ...props }) {
  return <FiLogOut className={`h-4 w-4 ${className}`} aria-hidden {...props} />;
}

export function Avatar({ label = "?", size = 18, className = "" }) {
  const letter =
    String(label || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.55) }}
    >
      {letter}
    </span>
  );
}

export function SpinnerMini({ className = "" }) {
  return (
    <svg
      className={`animate-spin h-3 w-3 text-violet-600 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

export default { IconTrash, IconExit, Avatar, SpinnerMini };
