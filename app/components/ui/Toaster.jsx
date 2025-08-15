"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
  FiBell,
  FiX,
} from "react-icons/fi";

// Style maps extracted outside component to avoid recreation on each render
const COLOR_MAPS = {
  bold: {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600",
    default: "text-violet-500",
  },
  subtle: {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
    default: "text-violet-500",
  },
};

const BG_MAPS = {
  dark: {
    success: "bg-green-900/40",
    error: "bg-red-900/40",
    info: "bg-blue-900/40",
    warning: "bg-yellow-900/30",
    default: "bg-violet-900/40",
  },
  light: {
    success: "bg-green-100",
    error: "bg-red-100",
    info: "bg-blue-100",
    warning: "bg-yellow-100",
    default: "bg-violet-100",
  },
};

export default function Toaster() {
  const tone = "subtle"; // 'subtle' | 'bold'
  const [dark, setDark] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Helper function for media query listeners to reduce code duplication
  const useMediaQuery = (query, setter) => {
    useEffect(() => {
      try {
        const mq = window.matchMedia && window.matchMedia(query);
        if (!mq) return;

        const handler = (e) => setter(!!e.matches);
        setter(!!mq.matches);

        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
      } catch {}
    }, [query]);
  };

  useMediaQuery("(prefers-color-scheme: dark)", setDark);
  useMediaQuery("(min-width: 768px)", setIsDesktop);

  const position = isDesktop ? "top-right" : "bottom-center";
  const containerStyle = useMemo(
    () =>
      position === "top-right"
        ? { top: 16, right: 16, zIndex: 9999 }
        : { bottom: 16, zIndex: 9999 },
    [position]
  );

  const colorMap = COLOR_MAPS[tone === "bold" ? "bold" : "subtle"];
  const bgMap = BG_MAPS[dark ? "dark" : "light"];
  const isBold = tone === "bold";

  const progressStyle = useMemo(
    () => ({
      bottom: 0,
      top: "auto",
      left: 0,
      right: 0,
      height: 4,
      opacity: 1,
      background: isBold
        ? "linear-gradient(90deg, #7C3AED, #2563EB)"
        : "linear-gradient(90deg, #A78BFA, #60A5FA)",
    }),
    [isBold]
  );

  const progressClassName = isBold
    ? "!h-1 !rounded-b-xl !bg-gradient-to-r !from-violet-600 !to-blue-600"
    : "!h-1 !rounded-b-xl !bg-gradient-to-r !from-violet-400 !to-blue-400";

  const renderIcon = useMemo(() => {
    return ({ type }) => {
      const iconType = type || "default";
      const IconComponent =
        {
          success: FiCheckCircle,
          error: FiAlertTriangle,
          info: FiInfo,
          warning: FiAlertCircle,
          default: FiBell,
        }[iconType] || FiBell;

      const icon = <IconComponent className={colorMap[iconType]} />;

      return isBold ? (
        <span
          className={`inline-flex items-center justify-center p-1.5 rounded-md ${bgMap[iconType]} ${colorMap[iconType]}`}
        >
          {icon}
        </span>
      ) : (
        icon
      );
    };
  }, [colorMap, bgMap, isBold]);

  return (
    <ToastContainer
      className="!w-auto"
      position={position}
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      limit={3}
      theme={dark ? "dark" : "light"}
      transition={Slide}
      icon={renderIcon}
      toastClassName={({ type = "default" }) => {
        const borderWeight = isBold ? "border-l-[6px]" : "border-l-2";
        const accent = `border-l-${
          type === "success"
            ? isBold
              ? "green-600"
              : "green-400"
            : type === "error"
            ? isBold
              ? "red-600"
              : "red-400"
            : type === "warning"
            ? isBold
              ? "yellow-600"
              : "yellow-400"
            : type === "info"
            ? isBold
              ? "blue-600"
              : "blue-400"
            : isBold
            ? "violet-600"
            : "violet-400"
        }`;
        const shadow = isBold
          ? "shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          : "shadow-[0_6px_18px_rgba(0,0,0,0.10)]";
        return `group pointer-events-auto rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 backdrop-blur-md bg-white/95 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-50 max-w-[92vw] sm:max-w-sm pl-3 pr-2 py-2 sm:py-2.5 flex items-start gap-2 sm:gap-3 mb-3 last:mb-0 ${shadow} ${borderWeight} ${accent}`;
      }}
      bodyClassName="text-sm leading-snug break-words flex items-start gap-2 sm:gap-3"
      progressClassName={progressClassName}
      progressStyle={progressStyle}
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          aria-label="Close"
          className="inline-flex items-center justify-center rounded hover:opacity-80"
        >
          <FiX />
        </button>
      )}
      style={containerStyle}
    />
  );
}
