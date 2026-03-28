import { useEffect, useMemo, useState } from "react"
import { createFileRoute, useHydrated } from "@tanstack/react-router"
import { useLiveQuery } from "@tanstack/react-db"
import { Shuffle, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSessionCollections } from "@/lib/session-collections"
import {
  getCurrentMemberQuery,
  getSessionMembersQuery,
  getSessionOptionsQuery,
  getSessionSummaryQuery,
} from "@/lib/session-live-queries"
import {
  clearSessionIdentity,
  getSessionIdentity,
  saveSessionIdentity,
} from "@/lib/session-identity"
import { normalizeSessionCode } from "@/lib/session-model"

export const Route = createFileRoute("/$code")({
  component: RouteComponent,
})

function RouteComponent() {
  const { code } = Route.useParams()
  const normalizedCode = normalizeSessionCode(code)
  const collections = useMemo(
    () => getSessionCollections(normalizedCode),
    [normalizedCode]
  )
  const hydrated = useHydrated()
  const [nickname, setNickname] = useState("")
  const [optionLabel, setOptionLabel] = useState("")
  const [memberId, setMemberId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isAddingOption, setIsAddingOption] = useState(false)
  const [isChoosing, setIsChoosing] = useState(false)
  const [isStartingDecision, setIsStartingDecision] = useState(false)

  useEffect(() => {
    if (!hydrated) return

    const identity = getSessionIdentity(normalizedCode)
    if (identity) {
      setMemberId(identity.memberId)
      setNickname(identity.nickname)
    }
  }, [hydrated, normalizedCode])

  const sessionSummaryQuery = useMemo(
    () => getSessionSummaryQuery(collections),
    [collections]
  )
  const membersQuery = useMemo(
    () => getSessionMembersQuery(collections),
    [collections]
  )
  const optionsQuery = useMemo(
    () => getSessionOptionsQuery(collections),
    [collections]
  )
  const currentMemberQuery = useMemo(() => {
    if (!memberId) {
      return null
    }

    return getCurrentMemberQuery(collections, memberId)
  }, [collections, memberId])

  const {
    data: sessionSummary,
    isLoading: isSessionLoading,
    isReady: isSessionReady,
  } = useLiveQuery(
    (q) => (hydrated ? sessionSummaryQuery(q) : undefined),
    [hydrated, sessionSummaryQuery]
  )

  const { data: members = [] } = useLiveQuery(
    (q) => (hydrated ? membersQuery(q) : undefined),
    [hydrated, membersQuery]
  )

  const { data: options = [] } = useLiveQuery(
    (q) => (hydrated ? optionsQuery(q) : undefined),
    [hydrated, optionsQuery]
  )

  const { data: currentMember } = useLiveQuery(
    (q) =>
      hydrated && currentMemberQuery ? currentMemberQuery(q) : undefined,
    [currentMemberQuery, hydrated]
  )

  const hasSession = Boolean(sessionSummary)
  const isHost = currentMember?.isHost ?? false
  const canChooseOption = isHost && options.length > 0

  const resetError = () => setActionError(null)

  const handleJoinSession = async () => {
    const trimmedNickname = nickname.trim()

    if (!trimmedNickname || !sessionSummary || isJoining) {
      return
    }

    const nextMemberId = crypto.randomUUID()

    setIsJoining(true)
    resetError()
    saveSessionIdentity(normalizedCode, {
      memberId: nextMemberId,
      nickname: trimmedNickname,
    })
    setMemberId(nextMemberId)

    try {
      const tx = collections.sessionMembersCollection.insert({
        id: nextMemberId,
        sessionId: sessionSummary.id,
        nickname: trimmedNickname,
        isHost: false,
        createdAt: new Date(),
      })

      await tx.isPersisted.promise
    } catch (error) {
      clearSessionIdentity(normalizedCode)
      setMemberId(null)
      setActionError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel entrar na sessao."
      )
    } finally {
      setIsJoining(false)
    }
  }

  const handleAddOption = async () => {
    const trimmedLabel = optionLabel.trim()

    if (!trimmedLabel || !sessionSummary || !currentMember || isAddingOption) {
      return
    }

    setIsAddingOption(true)
    resetError()

    try {
      const tx = collections.sessionOptionsCollection.insert({
        id: crypto.randomUUID(),
        sessionId: sessionSummary.id,
        createdByMemberId: currentMember.id,
        label: trimmedLabel,
        createdAt: new Date(),
      })

      await tx.isPersisted.promise
      setOptionLabel("")
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel adicionar a opcao."
      )
    } finally {
      setIsAddingOption(false)
    }
  }

  const handleStartDecision = async () => {
    if (!sessionSummary || !isHost || isStartingDecision) {
      return
    }

    setIsStartingDecision(true)
    resetError()

    try {
      const tx = collections.sessionsCollection.update(
        sessionSummary.id,
        (draft) => {
          draft.status = "deciding"
          draft.chosenOptionId = null
          draft.updatedAt = new Date()
        }
      )

      await tx.isPersisted.promise
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel iniciar a decisao."
      )
    } finally {
      setIsStartingDecision(false)
    }
  }

  const handleChooseRandomOption = async () => {
    if (!sessionSummary || !canChooseOption || isChoosing) {
      return
    }

    const chosenOption = options[Math.floor(Math.random() * options.length)]

    setIsChoosing(true)
    resetError()

    try {
      const tx = collections.sessionsCollection.update(
        sessionSummary.id,
        (draft) => {
          draft.status = "chosen"
          draft.chosenOptionId = chosenOption.id
          draft.updatedAt = new Date()
        }
      )

      await tx.isPersisted.promise
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel sortear uma opcao."
      )
    } finally {
      setIsChoosing(false)
    }
  }

  if (!hydrated || isSessionLoading) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-16">
        <div className="rounded-3xl border border-border/60 bg-card/60 px-6 py-5 text-sm text-muted-foreground backdrop-blur-sm">
          Carregando sessao...
        </div>
      </main>
    )
  }

  if (isSessionReady && !hasSession) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-border/60 bg-card/70 p-8 text-center shadow-sm backdrop-blur-sm">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Codigo {normalizedCode}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Sessao nao encontrada
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Confira se o codigo esta correto ou crie uma nova sala na tela
            inicial.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <section className="rounded-[28px] border border-border/60 bg-card/65 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.32em] text-muted-foreground uppercase">
              Sala {normalizedCode}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {sessionSummary?.topic}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Sessao colaborativa com sync em tempo real via Electric e dados
              locais reativos com TanStack DB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{sessionSummary?.status}</Badge>
            {sessionSummary?.chosenOptionLabel ? (
              <Badge variant="success">
                Escolhido: {sessionSummary.chosenOptionLabel}
              </Badge>
            ) : null}
          </div>
        </div>

        {actionError ? (
          <p className="mt-4 text-sm text-destructive">{actionError}</p>
        ) : null}
      </section>

      {!currentMember ? (
        <section className="rounded-[28px] border border-border/60 bg-card/65 p-6 shadow-sm backdrop-blur-sm">
          <div className="max-w-xl space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Entre na sala
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Escolha o seu apelido
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && handleJoinSession()
                }
                placeholder="Ex: Lira"
                className="h-12 rounded-xl bg-background/70 px-4 text-base"
              />
              <Button
                onClick={handleJoinSession}
                disabled={!nickname.trim() || isJoining}
                className="h-12 rounded-xl px-6"
              >
                {isJoining ? "Entrando..." : "Entrar na sessao"}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
        <div className="space-y-6">
          <Panel
            title="Participantes"
            description="Quem esta online na sessao agora."
            icon={<Users className="size-4" />}
          >
            <div className="space-y-3">
              {members.length === 0 ? (
                <EmptyState>Ninguem entrou na sessao ainda.</EmptyState>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {member.nickname}
                        {member.id === currentMember?.id ? " (voce)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.isHost ? "Host da sala" : "Participante"}
                      </p>
                    </div>
                    {member.$synced ? (
                      <span className="text-[11px] font-medium text-emerald-500">
                        sincronizado
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-500">
                        sincronizando
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel
            title="Controle da rodada"
            description="Fluxo do host para abrir a decisao e sortear uma resposta."
            icon={<Sparkles className="size-4" />}
          >
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleStartDecision}
                disabled={!isHost || isStartingDecision}
                className="h-11 w-full justify-center rounded-xl"
              >
                {isStartingDecision
                  ? "Atualizando..."
                  : "Abrir fase de decisao"}
              </Button>
              <Button
                onClick={handleChooseRandomOption}
                disabled={!canChooseOption || isChoosing}
                className="h-11 w-full justify-center rounded-xl"
              >
                <Shuffle className="size-4" />
                {isChoosing ? "Sorteando..." : "Sortear opcao"}
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Somente o host consegue iniciar a rodada e escolher a opcao
                final.
              </p>
            </div>
          </Panel>
        </div>

        <Panel
          title="Opcoes da sessao"
          description="Cada nova opcao aparece para todos em tempo real."
          icon={<Shuffle className="size-4" />}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={optionLabel}
                onChange={(event) => setOptionLabel(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && handleAddOption()
                }
                placeholder="Ex: Sushi na Liberdade"
                disabled={!currentMember}
                className="h-12 rounded-xl bg-background/70 px-4 text-base"
              />
              <Button
                onClick={handleAddOption}
                disabled={
                  !currentMember || !optionLabel.trim() || isAddingOption
                }
                className="h-12 rounded-xl px-6"
              >
                {isAddingOption ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>

            <div className="space-y-3">
              {options.length === 0 ? (
                <EmptyState>
                  Adicione a primeira opcao para comecar a decidir.
                </EmptyState>
              ) : (
                options.map((option) => {
                  const isChosen = option.id === sessionSummary?.chosenOptionId
                  const author = members.find(
                    (member) => member.id === option.createdByMemberId
                  )

                  return (
                    <div
                      key={option.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {author
                            ? `por ${author.nickname}`
                            : "Opcao colaborativa"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isChosen ? (
                          <Badge variant="success">escolhida</Badge>
                        ) : null}
                        {option.$synced ? (
                          <Badge>sync ok</Badge>
                        ) : (
                          <Badge variant="warning">pendente</Badge>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Panel>
      </section>
    </main>
  )
}

function Panel({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card/65 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 px-4 py-6 text-sm text-muted-foreground">
      {children}
    </div>
  )
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "success" | "warning"
}) {
  const variantClassName =
    variant === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : variant === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-border/60 bg-background/70 text-muted-foreground"

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase ${variantClassName}`}
    >
      {children}
    </span>
  )
}
