"use client";

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [estMonte, setEstMonte] = useState(false);

  useEffect(() => {
    setEstMonte(true);
  }, []);

  if (!estMonte) {
    return (
      <button
        type="button"
        aria-label="Changer de thème"
        className="flex h-9 w-9 items-center justify-center rounded border border-outline bg-surface-container text-outline-variant"
      />
    );
  }

  const themeActif = theme === "light" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={
        themeActif === "dark"
          ? "Activer le mode clair"
          : "Activer le mode sombre"
      }
      onClick={() => setTheme(themeActif === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded border border-outline bg-surface-container text-outline-variant transition-colors hover:border-accent hover:text-accent"
    >
      {themeActif === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}