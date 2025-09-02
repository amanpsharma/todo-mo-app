// Animation variants for TodoList component

// Default variants when reduced motion is not preferred
export const listVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: { opacity: 0 },
};

export const itemVariants = {
  initial: { opacity: 0, y: -15, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 22,
      mass: 0.85,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.96,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Empty state and empty variants
export const emptyStateVariants = {
  initial: { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.96 },
};

// Animation config for check toggle
export const checkToggleAnimation = {
  checked: { scale: 1, opacity: 1, rotate: [0, 15, 0] },
  unchecked: { scale: 0, opacity: 0 },
  transition: {
    type: "spring",
    stiffness: 550,
    damping: 30,
    mass: 0.8,
    duration: 0.3,
  },
};
