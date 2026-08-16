import { resolveEffectiveTheme } from "@/lib/theme";
import type { SupportedTheme } from "@/types/oauth";
import { useEffect, useSyncExternalStore } from "react";

function subscribeToColorScheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getColorSchemeSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: light)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Custom hook to enforce branding-aware theming with system theme fallback.
 *
 * Rules:
 * - If branding allows only 'light' -> forces light mode (even if OS is in dark mode).
 * - If branding allows only 'dark' -> forces dark mode (even if OS is in light mode).
 * - If branding allows both or is unspecified -> aligns dynamically with system OS theme.
 */
export function useThemeEnforcement(supportedThemes?: SupportedTheme[] | null): {
  theme: SupportedTheme;
  isSystemDark: boolean;
} {
  const isSystemDark = useSyncExternalStore(
    subscribeToColorScheme,
    getColorSchemeSnapshot,
    getServerSnapshot,
  );

  const effectiveTheme = resolveEffectiveTheme(supportedThemes, isSystemDark);

  // Apply class and color-scheme to document root
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (effectiveTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
  }, [effectiveTheme]);

  return {
    theme: effectiveTheme,
    isSystemDark,
  };
}
