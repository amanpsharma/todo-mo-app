"use client";

import { useEffect, useState } from "react";
import { pickFooterThought } from "../lib/utils";

export default function useFooterThought() {
  const [footerThought, setFooterThought] = useState("");
  useEffect(() => {
    setFooterThought(pickFooterThought());
  }, []);
  return footerThought;
}
