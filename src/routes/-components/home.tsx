import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  LogIn,
  Shuffle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";


const floatingWords = [
  "Pizza or Sushi?",
  "Netflix or Cinema?",
  "Beach or Mountain?",
  "React or Vue?",
  "Coffee or Tea?",
  "Cats or Dogs?",
  "Morning or Night?",
  "Spotify or Vinyl?",
];

function FloatingWord({
  word,
  index,
}: {
  word: string;
  index: number;
}) {
  const positions = [
    { top: "8%", left: "8%" },
    { top: "15%", right: "8%" },
    { top: "35%", left: "3%" },
    { top: "45%", right: "4%" },
    { top: "60%", left: "6%" },
    { top: "70%", right: "6%" },
    { top: "82%", left: "4%" },
    { top: "88%", right: "10%" },
  ];

  const pos = positions[index % positions.length];

  return (
    <motion.span
      className="pointer-events-none absolute hidden select-none font-mono text-[0.7rem] tracking-wider text-foreground/[0.07] sm:text-sm md:block"
      style={pos}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -8, 0],
      }}
      transition={{
        opacity: { delay: 1.5 + index * 0.2, duration: 1 },
        y: {
          delay: 1.5 + index * 0.2,
          duration: 4 + index * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {word}
    </motion.span>
  );
}

export default function Home() {
  const [sessionName, setSessionName] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const cycleWords = [
    "jantar",
    "filme",
    "destino",
    "jogo",
    "projeto",
    "nome",
    "presente",
    "rolê",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % cycleWords.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    if (!sessionName.trim()) return;
    console.log("Creating session:", sessionName);
  };

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-amber-400/10 blur-[120px] dark:bg-amber-500/[0.07]"
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[100px] dark:bg-orange-500/5"
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating background words */}
      {floatingWords.map((word, i) => (
        <FloatingWord key={word} word={word} index={i} />
      ))}

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/25">
            <Shuffle className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Pickr
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => console.log("open join dialog")}
          >
            <LogIn className="size-4" />
            <span className="hidden sm:inline">Entrar em sessão</span>
          </Button>

          <ThemeToggle />
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-xl flex-col items-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="mb-8 flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-amber-700 dark:text-amber-400">
              <Sparkles className="size-3.5" />
              Decisões colaborativas em tempo real
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-center font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            Não sabe qual{" "}
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  className="inline-block bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                  transition={{ duration: 0.4 }}
                >
                  {cycleWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-linear-to-r from-amber-500 to-orange-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </span>
            <br />
            escolher?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-5 max-w-md text-center text-base leading-relaxed text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Crie uma sessão, convide seus amigos e deixe o{" "}
            <span className="font-semibold text-foreground">Pickr</span>{" "}
            decidir por vocês.
          </motion.p>

          {/* Input area */}
          <motion.div
            className="mt-10 flex w-full flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Ex: Onde vamos jantar?"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-12 rounded-xl border-border/60 bg-background/80 pl-4 pr-4 text-base shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-amber-500/50 focus-visible:ring-amber-500/20"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={!sessionName.trim()}
              className="h-12 gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-6 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
            >
              Criar sessão
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            className="mt-16 grid w-full max-w-lg grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {[
              {
                icon: <Users className="size-5" />,
                label: "Colaborativo",
                desc: "Em tempo real",
              },
              {
                icon: <Zap className="size-5" />,
                label: "Instantâneo",
                desc: "Sem cadastro",
              },
              {
                icon: <Shuffle className="size-5" />,
                label: "Aleatório",
                desc: "Justo pra todos",
              },
            ].map((feat, i) => (
              <motion.div
                key={feat.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {feat.icon}
                </div>
                <span className="text-sm font-semibold">{feat.label}</span>
                <span className="text-xs text-muted-foreground">
                  {feat.desc}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="relative z-10 py-6 text-center text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        Feito com ◆ para decisões impossíveis
      </motion.footer>
    </div>
  );
}