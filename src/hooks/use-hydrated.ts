import { useState, useEffect } from "react";

/**
 * Returns false on server/first render, true after hydration.
 * Use to conditionally enable framer-motion initial states.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
