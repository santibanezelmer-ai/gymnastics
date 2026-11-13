/**
 * Maquetas de interfaz en HTML/CSS (no capturas): se ven nítidas a cualquier tamaño
 * y pesan casi nada. Datos de ejemplo: no usar nombres reales de deportistas.
 */
import React from 'react'
import { Trophy, Radio, CheckCircle2, Tv, Users, Clock, Megaphone, Search, Delete } from 'lucide-react'
import { EXAMPLE_RANKING } from './content'


function BrandMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-lg bg-gradient-to-tr from-ox-blue-700 to-ox-blue text-white ${className}`}
      aria-hidden="true"
    >
      <Trophy className="h-[55%] w-[55%]" />
    </span>
  )
}

/** Panel principal del hero: mesa de control en vivo */
export function HeroStage() {
  return (
    <div className="relative grid min-h-[30rem] place-items-center [perspective:1400px] max-sm:min-h-[24rem]">
      <div className="ox-orbit h-[30rem] w-[30rem] max-sm:h-[20rem] max-sm:w-[20rem]" />
      <div className="ox-glass relative z-[2] w-full max-w-[35rem] overflow-hidden rounded-2xl text-white [transform:rotateY(-4deg)_rotateX(1.5deg)] max-sm:[transform:none]">
        <div className="flex min-h-[3.2rem] items-center justify-between border-b border-white/15 px-4 text-[0.68rem] font-semibold text-white/80">
          <span className="inline-flex items-center gap-2">
            <BrandMark className="h-5 w-5" /> Mesa de control
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="ox-pulse h-1.5 w-1.5 rounded-full bg-ox-amber" /> En vivo · Rotación 3
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-4 p-4 max-sm:grid-cols-1">
          <div>
            <span className="block text-[0.63rem] text-white/55">Campeonato de ejemplo · GAF Nivel 4</span>
            <b className="mt-1 block text-xl font-bold">Ranking general</b>
            <div className="mt-3 grid gap-1.5">
              {EXAMPLE_RANKING.map((r) => (
                <div
                  key={r.pos}
                  className={`grid grid-cols-[1.4rem_1fr_auto] items-center gap-2 rounded-lg px-2.5 py-2 text-[0.72rem] ${
                    r.pos === 1 ? 'bg-ox-amber/20 text-white' : 'bg-white/[0.06] text-white/80'
                  }`}
                >
                  <b className="font-[family-name:var(--font-ox-mono)]">{r.pos}</b>
                  <span className="truncate">
                    {r.name} <small className="text-white/50">· {r.club}</small>
                  </span>
                  <strong className="font-[family-name:var(--font-ox-mono)] tabular-nums">{r.score}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-[8.5rem] flex-col justify-between rounded-xl bg-ox-navy-950/50 p-3 max-sm:hidden">
            <small className="text-[0.6rem] text-white/55">Notas validadas</small>
            <strong className="font-[family-name:var(--font-ox-mono)] text-2xl tabular-nums">148/160</strong>
            <div className="ox-bars mt-2 flex h-16 items-end gap-1" aria-hidden="true">
              {[60, 45, 80, 55, 72, 92].map((h, i) => (
                <i key={i} style={{ height: `${h}%`, animationDelay: `${-i * 0.45}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ox-glass-chip absolute top-[2.2rem] left-[-0.6rem] z-[3] max-sm:hidden">
        <CheckCircle2 className="h-5 w-5 text-ox-amber" />
        <span>
          <b className="block text-[0.72rem]">Nota validada · Suelo</b>
          <small className="block font-[family-name:var(--font-ox-mono)] text-[0.62rem] text-white/60">
            D 5.200 + E 8.250 = 13.450
          </small>
        </span>
      </div>
      <div className="ox-glass-chip absolute right-[-0.4rem] bottom-[3rem] z-[3] max-sm:right-0 max-sm:bottom-1">
        <Megaphone className="h-5 w-5 text-ox-amber" />
        <span>
          <b className="block text-[0.72rem]">Llamado a pista · Viga</b>
          <small className="block text-[0.62rem] text-white/60">Compite #214 · prepara #215</small>
        </span>
      </div>
    </div>
  )
}

/** Teclado del juez */
export function JudgeMock() {
  return (
    <div className="flex h-full flex-col bg-[#f7f8fb] p-4 text-ox-ink">
      <div className="flex items-center justify-between border-b border-ox-line pb-2 text-[0.6rem] font-semibold text-ox-ink-500">
        <span>Juez E2 · Suelo</span>
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <Radio className="h-3 w-3" /> Conectado
        </span>
      </div>
      <small className="mt-3 text-[0.62rem] text-ox-ink-500">#214 · Antonia R. · Club Andes</small>
      <strong className="my-2 text-center font-[family-name:var(--font-ox-mono)] text-4xl tracking-tight text-ox-blue tabular-nums">
        8.250
      </strong>
      <div className="grid grid-cols-3 gap-1.5">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((k) => (
          <span
            key={k}
            className="grid h-8 place-items-center rounded-md border border-ox-line bg-white font-[family-name:var(--font-ox-mono)] text-sm"
          >
            {k}
          </span>
        ))}
        <span className="grid h-8 place-items-center rounded-md border border-ox-line bg-white text-ox-ink-500">
          <Delete className="h-3.5 w-3.5" />
        </span>
      </div>
      <span className="mt-2 grid h-9 place-items-center rounded-lg bg-ox-blue text-[0.7rem] font-bold text-white">
        Enviar nota
      </span>
    </div>
  )
}

/** Pantalla del gimnasio (modo TV Arena) */
export function ArenaMock() {
  return (
    <div className="h-full bg-gradient-to-br from-[#0d1530] to-[#060a18] p-4 text-white">
      <div className="flex items-center justify-between text-[0.6rem] text-white/60">
        <span className="inline-flex items-center gap-1.5">
          <Tv className="h-3.5 w-3.5" /> Pantalla del gimnasio
        </span>
        <i className="rounded bg-ox-amber/20 px-1.5 py-0.5 font-[family-name:var(--font-ox-mono)] text-[0.55rem] not-italic text-ox-amber">
          EN VIVO
        </i>
      </div>
      <div className="mt-3 flex items-end justify-between border-b border-white/10 pb-3">
        <span className="text-[0.62rem] text-white/50">Última nota · Suelo</span>
        <strong className="font-[family-name:var(--font-ox-mono)] text-4xl leading-none tracking-tight tabular-nums">
          13.450
        </strong>
      </div>
      <div className="mt-2 grid gap-1">
        {EXAMPLE_RANKING.map((r) => (
          <div
            key={r.pos}
            className={`grid grid-cols-[1.2rem_1fr_auto] items-center gap-2 rounded-md px-2 py-1.5 text-[0.65rem] ${
              r.pos === 1 ? 'bg-gradient-to-r from-ox-amber/30 to-transparent' : 'text-white/70'
            }`}
          >
            <b className="font-[family-name:var(--font-ox-mono)]">{r.pos}</b>
            <span>{r.name}</span>
            <strong className="font-[family-name:var(--font-ox-mono)] tabular-nums">{r.score}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Matriz de rotaciones */
export function RotationMock() {
  const apparatus = ['Salto', 'Asimétricas', 'Viga', 'Suelo']
  const groups = ['G1', 'G2', 'G3', 'G4']
  return (
    <div className="h-full bg-white p-4 text-ox-ink">
      <div className="flex items-center justify-between border-b border-ox-line pb-2">
        <b className="text-[0.75rem]">Rotaciones · Sesión 1</b>
        <span className="inline-flex items-center gap-1 text-[0.58rem] text-ox-ink-500">
          <Clock className="h-3 w-3" /> Rotación 3 de 4
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[3rem_repeat(4,1fr)] gap-1 text-[0.55rem]">
        <span />
        {apparatus.map((a) => (
          <span key={a} className="truncate font-[family-name:var(--font-ox-mono)] uppercase tracking-wider text-ox-ink-500">
            {a}
          </span>
        ))}
        {[1, 2, 3, 4].map((rot) => (
          <React.Fragment key={rot}>
            <span className="self-center font-semibold text-ox-ink-500">Rot. {rot}</span>
            {apparatus.map((_, ai) => {
              const g = groups[(ai - rot + 1 + 8) % 4]
              const current = rot === 3
              return (
                <span
                  key={ai}
                  className={`grid h-7 place-items-center rounded-md font-[family-name:var(--font-ox-mono)] ${
                    current ? 'bg-ox-blue text-white' : rot < 3 ? 'bg-ox-paper text-ox-ink-500 line-through' : 'bg-ox-ice text-ox-blue-700'
                  }`}
                >
                  {g}
                </span>
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-ox-amber/50 bg-ox-amber-soft px-2.5 py-2 text-[0.6rem]">
        <Megaphone className="h-3.5 w-3.5 text-amber-700" />
        <span>
          <b>Viga:</b> compite #214, en preparación #215
        </span>
      </div>
    </div>
  )
}

/** Portal del club: nómina e inscripciones */
export function ClubPortalMock() {
  const rows = [
    { name: 'Antonia R.', cat: 'Nivel 4', state: 'Inscrita', tone: 'ok' },
    { name: 'Florencia D.', cat: 'Nivel 5', state: 'Inscrita', tone: 'ok' },
    { name: 'Martina S.', cat: 'Nivel 4', state: 'Falta licencia', tone: 'warn' },
  ]
  return (
    <div className="h-full bg-white text-ox-ink">
      <div className="flex items-center justify-between border-b border-ox-line px-4 py-3">
        <span>
          <b className="block text-[0.78rem]">Club Andes · Nómina</b>
          <small className="text-[0.55rem] text-ox-ink-500">Código de invitación ANDES-24</small>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-ox-blue px-2 py-1 text-[0.55rem] font-bold text-white">
          <Users className="h-3 w-3" /> Inscribir
        </span>
      </div>
      <div className="mx-4 my-2 flex items-center gap-1.5 rounded-md border border-ox-line bg-ox-paper px-2 py-1.5 text-[0.55rem] text-ox-ink-500">
        <Search className="h-3 w-3" /> Buscar gimnasta o categoría…
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="grid grid-cols-[1.4fr_0.8fr_auto] items-center gap-2 border-t border-ox-line px-4 py-2.5 text-[0.6rem]"
        >
          <span className="font-semibold">{r.name}</span>
          <span className="text-ox-ink-500">{r.cat}</span>
          <strong
            className={`rounded px-1.5 py-0.5 text-[0.52rem] ${
              r.tone === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {r.state}
          </strong>
        </div>
      ))}
    </div>
  )
}