import { useEffect, useRef, useState } from "react";

export type ColorMode = "light" | "dark";

const STORAGE_KEY = "vendempire-color-mode";
const MODE_EVENT = "vendempire-color-mode-change";

export function useColorMode() {
  const [mode, setMode] = useState<ColorMode>("dark");
  const modeRef = useRef<ColorMode>("dark");

  useEffect(() => {
    const apply = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const next: ColorMode = saved === "light" ? "light" : "dark";
      modeRef.current = next;
      document.documentElement.classList.toggle("dark", next === "dark");
      setMode(next);
    };
    apply();
    window.addEventListener(MODE_EVENT, apply);
    return () => window.removeEventListener(MODE_EVENT, apply);
  }, []);

  function toggleMode() {
    const next = modeRef.current === "dark" ? "light" : "dark";
    modeRef.current = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(MODE_EVENT));
    setMode(next);
  }

  return { mode, toggleMode };
}
