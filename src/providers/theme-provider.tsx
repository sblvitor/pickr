import { ScriptOnce } from "@tanstack/react-router"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

export type Theme = 'dark' | 'light' | 'auto'
type ResolvedTheme = "light" | "dark"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeProviderContext = createContext<ThemeContextValue | null>(null)

function resolve(theme: Theme): ResolvedTheme {
  if (theme === "auto") {
    if (typeof window === "undefined") return "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "auto"
  try {
    return (localStorage.getItem("pickr-ui-theme") as Theme)
  } catch {
    return "auto"
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  storageKey = 'pickr-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolve(getStoredTheme())
  )

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme)
    const r = resolve(newTheme)
    setResolvedTheme(r)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(r)
  }, [])

  useEffect(() => {
    if (theme !== "auto") return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const r = resolve("auto")
      setResolvedTheme(r)
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(r)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const value = {
    theme,
    setTheme,
    resolvedTheme
  }

  const themeScript = `(function () {
    try {
      var storageKey = ${JSON.stringify(storageKey)};
      var theme = localStorage.getItem(storageKey) || ${JSON.stringify(defaultTheme)};
      var resolved = theme === 'auto'
        ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    } catch (e) {}
  })();`
 
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <ScriptOnce children={themeScript} />
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
 
  if (!context)
    throw new Error("useTheme must be used within a ThemeProvider")
 
  return context
}