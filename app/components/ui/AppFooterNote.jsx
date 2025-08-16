"use client";

import React from "react";

export default function AppFooterNote({ text }) {
  if (!text) return null;
  return (
    <p className="text-[11px] text-neutral-500 text-center" aria-live="polite">
      {text}
    </p>
  );
}
