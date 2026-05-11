import { useEffect, useState, useCallback } from "react";

const KEY = "datasage.activeDatasetId";
const EVT = "datasage:active-dataset-changed";

export function getActiveDatasetId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setActiveDatasetId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(KEY, id);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useActiveDatasetId(): [string | null, (id: string | null) => void] {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(getActiveDatasetId());
    const onChange = () => setId(getActiveDatasetId());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = useCallback((v: string | null) => setActiveDatasetId(v), []);
  return [id, update];
}
