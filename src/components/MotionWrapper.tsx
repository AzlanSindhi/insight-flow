import { motion, type HTMLMotionProps } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * SSR-safe motion.div that only applies initial/animate after hydration.
 * This prevents the opacity:0 flash on SSR where animations don't fire.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 20,
  className,
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition">) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y } : false}
      animate={mounted ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
