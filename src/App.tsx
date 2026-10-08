import { NetworkSandbox } from '@/dev/NetworkSandbox'

/** Phase 1 shell: exercises the data layer. Replaced by the real menus in Phase 4. */
export default function App() {
  return (
    <main className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lagoon-400">Phase 1 · Foundation</p>
        <h1 className="font-display text-4xl font-black tracking-tight text-foam sm:text-5xl">
          Pirate <span className="text-doubloon">Battle</span>
        </h1>
        <p className="max-w-2xl text-mist">
          Network sandbox: options store, Axios + TanStack Query and the MSW scenarios that will back the
          ranking and match history.
        </p>
      </header>
      <NetworkSandbox />
    </main>
  )
}
