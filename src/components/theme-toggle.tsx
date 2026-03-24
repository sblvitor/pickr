import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme } from '@lonik/themer'
import { useHydrated } from '@tanstack/react-router'
import { Button } from "./ui/button"

const themeOrder = ["system", "light", "dark"] as const
type ThemeValue = (typeof themeOrder)[number]

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const currentTheme: ThemeValue = theme as ThemeValue
  const hydrated = useHydrated()

  const nextTheme = (value: ThemeValue): ThemeValue => {
    const index = themeOrder.indexOf(value)
    return themeOrder[(index + 1) % themeOrder.length]
  }

  const icon = 
    currentTheme === 'light' ? (
      <Sun />
    ) : currentTheme === 'dark' ? (
      <Moon />
    ) : (
      <SunMoon />
    )

  return (
    <Button
      suppressHydrationWarning
      variant={'outline'}
      type="button"
      aria-label={`Tema: ${currentTheme}. Clique para alterar tema`}
      title={`Tema: ${currentTheme}`}
      onClick={() => setTheme(nextTheme(currentTheme))}
    >
      {hydrated && icon}
    </Button>
  )
}