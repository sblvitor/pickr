import { Moon, Sun, SunMoon } from 'lucide-react'
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import type {Theme} from "@/providers/theme-provider";
import { useTheme } from "@/providers/theme-provider"

const themeConfig = {
  dark: { icon: Moon, label: "Escuro", next: "light" },
  light: { icon: Sun, label: "Claro", next: "auto" },
  auto: { icon: SunMoon, label: "Sistema", next: "dark" },
} as const satisfies Record<
  Theme,
  { icon: React.ComponentType; label: string; next: Theme }
>

export const ThemeToggle = () => {

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stableTheme: Theme = mounted ? theme : "auto"
  const { icon: Icon, label, next } = themeConfig[stableTheme]

  return (
    <Button
      variant={'outline'}
      onClick={() => setTheme(next)}
    >
      <Icon />
      {label}
    </Button>
  )
}