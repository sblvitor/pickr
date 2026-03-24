import { motion } from "motion/react";
import { Shuffle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <motion.header
      className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary shadow-md shadow-primary-glow ring-1 ring-primary-foreground/15">
          <Shuffle
            className="size-4 text-primary-foreground"
            strokeWidth={2.5}
          />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          Pickr
        </span>
      </div>
      <ThemeToggle />
    </motion.header>
  )
}