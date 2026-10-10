import { useState, type FormEvent, type ReactNode } from 'react'
import { useHistoryQuery, useRankingQuery, useSubmitMatchMutation } from '@/api/hooks'
import type { MatchSubmission } from '@/api/contracts'
import { OPTION_LIMITS, type OptionErrors, type OptionKey } from '@/config/options'
import { createId } from '@/lib/id'
import { mockControl } from '@/mocks/control'
import { SCENARIOS, isScenarioId } from '@/mocks/scenarios'
import { useMockControl } from '@/mocks/useMockControl'
import { useOptionsStore } from '@/state/optionsStore'
import { usePlayerStore } from '@/state/playerStore'

/**
 * Phase 1 diagnostics panel. Intentionally plain: its job is to prove that
 * store -> Axios -> MSW -> TanStack Query works end to end, and to let a human trigger every
 * failure scenario. The real menus replace it in Phase 4.
 */

const card = 'rounded-2xl border border-white/10 bg-abyss-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur'
const button =
  'rounded-lg bg-lagoon-500 px-3 py-1.5 text-sm font-semibold text-abyss-950 transition hover:bg-lagoon-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
const buttonGhost =
  'rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-foam transition hover:bg-white/10 active:scale-95 disabled:opacity-40'
const input =
  'w-full rounded-lg border border-white/15 bg-abyss-950/80 px-3 py-2 text-foam placeholder:text-mist/50 aria-[invalid=true]:border-ember'

function Card({ title, children, id }: { title: string; children: ReactNode; id: string }) {
  return (
    <section className={card} aria-labelledby={id}>
      <h2 id={id} className="mb-3 font-display text-lg font-bold text-doubloon">
        {title}
      </h2>
      {children}
    </section>
  )
}

const formatDuration = (ms: number) => `${Math.round(ms / 1000)}s`

// ---------------------------------------------------------------------------------------

function ScenarioPanel() {
  const control = useMockControl()
  const scenario = SCENARIOS.find((s) => s.id === control.scenarioId)

  return (
    <Card id="scenario-title" title="Network scenario (MSW)">
      <label htmlFor="scenario-select" className="mb-1 block text-sm text-mist">
        Scenario
      </label>
      <select
        id="scenario-select"
        className={input}
        value={control.scenarioId}
        onChange={(e) => isScenarioId(e.target.value) && mockControl.selectScenario(e.target.value)}
      >
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <p className="mt-2 min-h-12 text-sm text-mist">{scenario?.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={buttonGhost}
          onClick={() => mockControl.setLatencyOverride(control.latencyOverrideMs === null ? 0 : null)}
        >
          Latency: {control.latencyOverrideMs === null ? 'scenario' : `${control.latencyOverrideMs} ms`}
        </button>
        <button type="button" className={buttonGhost} onClick={() => mockControl.reset()}>
          Reset mock state
        </button>
        <span className="text-xs text-mist">seed {control.seed}</span>
      </div>
    </Card>
  )
}

function OptionsPanel() {
  const saved = useOptionsStore((s) => s.options)
  const saveOptions = useOptionsStore((s) => s.saveOptions)
  const resetOptions = useOptionsStore((s) => s.resetOptions)
  const [draft, setDraft] = useState<Record<OptionKey, string>>({
    sessionTimeSeconds: String(saved.sessionTimeSeconds),
    enemySpawnIntervalSeconds: String(saved.enemySpawnIntervalSeconds),
    soundEnabled: String(saved.soundEnabled),
  })
  const [errors, setErrors] = useState<OptionErrors>({})
  const [status, setStatus] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = saveOptions(draft)
    setErrors(result.ok ? {} : result.errors)
    setStatus(result.ok ? 'Saved.' : '')
  }

  const onReset = () => {
    resetOptions()
    const defaults = useOptionsStore.getState().options
    setDraft({
      sessionTimeSeconds: String(defaults.sessionTimeSeconds),
      enemySpawnIntervalSeconds: String(defaults.enemySpawnIntervalSeconds),
      soundEnabled: String(defaults.soundEnabled),
    })
    setErrors({})
    setStatus('Defaults restored.')
  }

  return (
    <Card id="options-title" title="Options (Zustand + localStorage)">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        {(Object.keys(OPTION_LIMITS) as OptionKey[]).filter(k => k !== 'soundEnabled').map((key) => {
          const limits = OPTION_LIMITS[key] as any
          const errorId = `${key}-error`
          return (
            <div key={key}>
              <label htmlFor={key} className="mb-1 block text-sm text-mist">
                {limits.label} ({limits.min}–{limits.max}
                {limits.unit})
              </label>
              <input
                id={key}
                inputMode="decimal"
                className={input}
                value={draft[key]}
                aria-invalid={errors[key] ? true : undefined}
                aria-describedby={errors[key] ? errorId : undefined}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              />
              {errors[key] && (
                <p id={errorId} role="alert" className="mt-1 text-sm text-ember">
                  {errors[key]}
                </p>
              )}
            </div>
          )
        })}
        <div className="flex items-center gap-2">
          <button type="submit" className={button}>
            Save
          </button>
          <button type="button" className={buttonGhost} onClick={onReset}>
            Defaults
          </button>
          <span role="status" className="text-sm text-lagoon-400">
            {status}
          </span>
        </div>
      </form>
    </Card>
  )
}

function SubmitPanel() {
  const options = useOptionsStore((s) => s.options)
  const { playerId, nickname } = usePlayerStore()
  const mutation = useSubmitMatchMutation()
  const [last, setLast] = useState<MatchSubmission | null>(null)

  const send = (submission: MatchSubmission) => {
    setLast(submission)
    mutation.mutate(submission)
  }

  const sendNew = () =>
    send({
      matchId: createId(),
      playerId,
      nickname,
      playedAt: new Date().toISOString(),
      score: Math.floor(Math.random() * 20),
      durationMs: options.sessionTimeSeconds * 1000,
      endReason: 'time_up',
      config: { ...options },
    })

  const state = mutation.isPending
    ? `Sending… (attempt ${mutation.failureCount + 1})`
    : mutation.isError
      ? `Failed: ${mutation.error.userMessage}`
      : mutation.isSuccess
        ? mutation.data.duplicate
          ? 'Confirmed (recovered existing record, no duplicate).'
          : 'Confirmed (new record).'
        : 'Idle.'

  return (
    <Card id="submit-title" title="Register a match (idempotent POST)">
      <p className="mb-3 text-sm text-mist">
        Playing as <strong className="text-foam">{nickname}</strong>. “Resend last” replays the same
        <code className="mx-1 rounded bg-black/30 px-1">matchId</code>: the server must not duplicate it.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={sendNew} disabled={mutation.isPending}>
          Submit new match
        </button>
        <button
          type="button"
          className={buttonGhost}
          onClick={() => last && send(last)}
          disabled={!last || mutation.isPending}
        >
          Resend last
        </button>
      </div>
      <p role="status" className="mt-3 text-sm text-foam" data-testid="submit-status">
        {state}
      </p>
    </Card>
  )
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  return (
    <div className="mt-3 flex items-center gap-2 text-sm">
      <button type="button" className={buttonGhost} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prev
      </button>
      <span className="text-mist">
        Page {page} of {totalPages}
      </span>
      <button type="button" className={buttonGhost} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  )
}

function QueryState({
  isPending,
  error,
  empty,
  onRetry,
}: {
  isPending: boolean
  error: { userMessage: string } | null
  empty: boolean
  onRetry: () => void
}) {
  if (isPending) return <p className="text-sm text-mist">Loading…</p>
  if (error) {
    return (
      <div role="alert" className="flex items-center gap-3 text-sm text-ember">
        <span>{error.userMessage}</span>
        <button type="button" className={buttonGhost} onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }
  if (empty) return <p className="text-sm text-mist">Nothing here yet.</p>
  return null
}

function RankingPanel() {
  const config = useOptionsStore((s) => s.options)
  const playerId = usePlayerStore((s) => s.playerId)
  const [page, setPage] = useState(1)
  const query = useRankingQuery({ config, page, pageSize: 5 })

  return (
    <Card id="ranking-title" title="Ranking">
      <QueryState isPending={query.isPending} error={query.error} empty={query.data?.items.length === 0} onRetry={() => void query.refetch()} />
      <ol className="flex flex-col gap-1 text-sm" aria-busy={query.isFetching}>
        {query.data?.items.map((entry) => (
          <li
            key={entry.matchId}
            className={`flex justify-between rounded-lg px-3 py-1.5 ${entry.playerId === playerId ? 'bg-lagoon-500/20 text-lagoon-400' : 'bg-white/5'}`}
          >
            <span>
              #{entry.rank} {entry.nickname}
            </span>
            <span className="font-semibold">{entry.score} pts</span>
          </li>
        ))}
      </ol>
      {query.data && <Pager page={query.data.page} totalPages={query.data.totalPages} onPage={setPage} />}
    </Card>
  )
}

function HistoryPanel() {
  const playerId = usePlayerStore((s) => s.playerId)
  const [page, setPage] = useState(1)
  const query = useHistoryQuery({ playerId, page, pageSize: 5 })

  return (
    <Card id="history-title" title="Match history">
      <QueryState isPending={query.isPending} error={query.error} empty={query.data?.items.length === 0} onRetry={() => void query.refetch()} />
      <ul className="flex flex-col gap-1 text-sm" aria-busy={query.isFetching}>
        {query.data?.items.map((record) => (
          <li key={record.matchId} className="flex justify-between rounded-lg bg-white/5 px-3 py-1.5">
            <span>{new Date(record.playedAt).toLocaleString()}</span>
            <span className="text-mist">
              {formatDuration(record.durationMs)} · {record.endReason === 'time_up' ? 'time up' : 'sunk'}
            </span>
            <span className="font-semibold">{record.score} pts</span>
          </li>
        ))}
      </ul>
      {query.data && <Pager page={query.data.page} totalPages={query.data.totalPages} onPage={setPage} />}
    </Card>
  )
}

export function NetworkSandbox() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ScenarioPanel />
      <OptionsPanel />
      <SubmitPanel />
      <RankingPanel />
      <div className="md:col-span-2">
        <HistoryPanel />
      </div>
    </div>
  )
}
