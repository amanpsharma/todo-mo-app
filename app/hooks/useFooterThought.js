"use client";

import { useEffect, useState } from "react";
import { pickFooterThought } from "../lib/utils";

export default function useFooterThought() {
  const [footerThought, setFooterThought] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFooterThought(pickFooterThought());
  }, []);

  // Return empty string during SSR to avoid hydration mismatch
  return mounted ? footerThought : "";
}
