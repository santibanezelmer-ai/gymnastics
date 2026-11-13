import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Trophy,
  Menu,
  X,
  FileSpreadsheet,
  Clock,
  Megaphone,
  Scale,
  KeyRound,
  ShieldCheck,
  Layers,
  ChevronDown,
  CheckCircle2,
  Smartphone,
  Tv,
  Gavel,
  Radio,
} from 'lucide-react'
import './marketing.css'
import { ArenaMock, ClubPortalMock, HeroStage, JudgeMock, RotationMock, } from './mockups'
import { ContactSection } from './ContactSection'
import {
  DISCIPLINES,
  EXAMPLE_RANKING,
  DISCIPLINE_DETAILS,
  FAQS,
  NAV_LINKS,
  PILOT_EVENT_SLUG,
  PLANS,
  PROBLEMS,
  STEPS,
  VALUE_STRIP,
} from './content'

const CURRENT_YEAR = new Date().getFullYear()

export interface MarketingLandingProps {
  navigate: (to: string) => void
}

const PROBLEM_ICONS = {
  sheet: FileSpreadsheet,
  clock: Clock,
  megaphone: Megaphone,
  scale: Scale,
} as const

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-ox-ink'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-ox-blue-700 to-ox-blue text-white shadow-sm">
        <Trophy className="h-5 w-5" />
      </span>
      Operix <span className="font-semibold opacity-70">Gymnastics</span>
    </span>
  )
}

/** Enlace interno de la SPA: usa el router propio para rutas y deja pasar anclas (#). */
function useAppLink(navigate: (to: string) => void) {
  return (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('/')) {
      e.preventDefault()
      navigate(href)
    }
  }
}

function Nav({ navigate }: MarketingLandingProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const link = useAppLink(navigate)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || open

  return (
    <header className={`ox-nav-shell ${solid ? 'is-scrolled' : ''}`}>
      <nav className="ox-nav" aria-label="Navegación principal">
        <a href="#inicio" onClick={() => setOpen(false)}>
          <Logo light={!solid} />
        </a>
        <div className="hidden items-center gap-[clamp(1rem,2.4vw,2.2rem)] text-[0.82rem] font-semibold lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="opacity-70 transition-opacity hover:opacity-100">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/club/rotaciones"
            onClick={link('/club/rotaciones')}
            className="hidden text-[0.8rem] font-semibold text-blue-400 hover:text-blue-300 lg:inline"
          >
            Portal Clubes
          </a>
          <a
            href="/ingresar"
            onClick={link('/ingresar')}
            className="hidden text-[0.8rem] font-semibold opacity-75 hover:opacity-100 lg:inline"
          >
            Organización
          </a>
          <a href="#contacto" className="ox-btn ox-btn-primary ox-btn-small max-sm:hidden">
            Solicita una demo
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl lg:hidden"
            aria-expanded={open}
            aria-controls="ox-mobile-menu"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div
          id="ox-mobile-menu"
          className="mx-auto mt-2 grid w-[min(100%-1rem,32rem)] rounded-2xl bg-white/95 p-3 text-ox-ink shadow-lg backdrop-blur-xl lg:hidden"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-between border-b border-ox-line px-3 font-semibold"
            >
              {l.label}
              <ArrowRight className="h-4 w-4 text-ox-ink-500" />
            </a>
          ))}
          <a href="/club/rotaciones" onClick={link('/club/rotaciones')} className="flex min-h-12 items-center px-3 font-semibold text-blue-400">
            Portal Clubes (Delegaciones)
          </a>
          <a href="/ingresar" onClick={link('/ingresar')} className="flex min-h-12 items-center px-3 font-semibold">
            Acceso Organización
          </a>
          <a href="#contacto" onClick={() => setOpen(false)} className="ox-btn ox-btn-primary mt-2">
            Solicita una demo
          </a>
        </div>
      )}
    </header>
  )
}

function Hero({ navigate }: MarketingLandingProps) {
  const link = useAppLink(navigate)
  const liveHref = `/evento/${PILOT_EVENT_SLUG}`
  return (
    <section id="inicio" className="relative isolate overflow-hidden text-white">
      <div className="ox-hero-bg" />
      <div className="ox-grid-bg" />
      <div className="ox-orbit -top-[17rem] -right-[14rem] h-[38rem] w-[38rem]" />
      <div className="ox-container grid items-center gap-[clamp(2rem,5vw,5.5rem)] pt-32 pb-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,1.05fr)] lg:pt-36">
        <div className="max-w-[43rem]">
          <div className="mb-6 inline-flex items-center gap-2 text-[0.78rem] font-semibold text-ox-amber">
            <Trophy className="h-4 w-4" /> Puntuación oficial FIG 2025-2028
          </div>
          <h1 className="text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.97] font-extrabold tracking-[-0.038em]">
            Tu campeonato de gimnasia, <span className="text-ox-amber">en vivo</span> desde la primera nota.
          </h1>
          <p className="mt-6 max-w-[39rem] text-[clamp(1rem,1.45vw,1.18rem)] leading-relaxed text-white/75">
            Inscripción de clubes, terminal de jueces con PIN, rotaciones, pantalla del gimnasio y actas oficiales en una
            sola plataforma, en español.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 max-sm:grid">
            <a href="#contacto" className="ox-btn ox-btn-light">
              Solicita una demo <ArrowRight />
            </a>
            <a href={liveHref} onClick={link(liveHref)} className="ox-btn ox-btn-quiet">
              <Radio /> Ver un campeonato en vivo
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.75rem] text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Jueces entran con PIN
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> 7 disciplinas FIG
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Datos aislados por organización
            </span>
          </div>
        </div>
        <HeroStage />
      </div>
    </section>
  )
}

function ValueStrip() {
  return (
    <div className="bg-ox-ink text-white">
      <div className="ox-container grid md:grid-cols-3">
        {VALUE_STRIP.map((v, i) => (
          <p
            key={v.title}
            className={`flex flex-col justify-center gap-0.5 py-4 text-[0.74rem] leading-snug text-white/55 md:min-h-[5.2rem] md:px-6 ${
              i === 0 ? 'md:pl-0' : ''
            } ${i < 2 ? 'border-b border-white/10 md:border-r md:border-b-0' : ''}`}
          >
            <b className="text-[0.8rem] text-white">{v.title}</b>
            {v.text}
          </p>
        ))}
      </div>
    </div>
  )
}

function Problem() {
  return (
    <section id="problema" className="ox-section bg-white">
      <div className="ox-container">
        <div className="mx-auto mb-14 max-w-[55rem] text-center">
          <span className="ox-label">El problema</span>
          <h2 className="ox-h2">Un campeonato no debería depender de una calculadora.</h2>
          <p className="mx-auto mt-5 max-w-[43rem] leading-relaxed text-ox-ink-600">
            Los torneos mueven cientos de gimnastas, decenas de jueces y familias esperando resultados, con planillas y
            hojas impresas.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1.1fr]">
          {PROBLEMS.map((p, i) => {
            const Icon = PROBLEM_ICONS[p.icon]
            return (
              <article
                key={p.title}
                className={`min-h-[15rem] rounded-2xl border border-ox-line bg-white p-6 shadow-[0_5px_8px_rgb(11_26_69/0.05)] ${
                  i === 1 || i === 2 ? 'lg:mt-9' : ''
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ox-ice text-ox-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-9 text-[1.18rem] font-bold tracking-tight">{p.title}</h3>
                <p className="mt-2.5 text-[0.88rem] leading-relaxed text-ox-ink-600">{p.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    kicker: 'Jueces · celular',
    title: 'Cada juez anota desde su celular.',
    text: 'Entra con el PIN del campeonato, ve a quién le toca y envía su nota. El cálculo FIG lo hace la plataforma.',
    bg: 'bg-[radial-gradient(circle_at_82%_72%,#3b6cf0,transparent_36%),linear-gradient(145deg,#0b1a45,#1d4ed8)]',
    view: <JudgeMock />,
  },
  {
    kicker: 'Gimnasio · pantalla',
    title: 'El público ve el ranking al instante.',
    text: 'Modo TV de alto contraste, legible desde las graderías, con podio al cierre de cada categoría.',
    bg: 'bg-[radial-gradient(circle_at_12%_85%,#f5b83d55,transparent_35%),linear-gradient(145deg,#060d26,#16285e)]',
    view: <ArenaMock />,
  },
  {
    kicker: 'Mesa de control · rotaciones',
    title: 'Rotaciones y llamado a pista, ordenados.',
    text: 'Matriz de rotación por aparato, orden de paso con dorsales y aviso de quién compite y quién se prepara.',
    bg: 'bg-[radial-gradient(circle_at_80%_80%,#93b4ff,transparent_34%),linear-gradient(145deg,#16285e,#3157c9)]',
    view: <RotationMock />,
  },
  {
    kicker: 'Clubes · portal',
    title: 'Los clubes inscriben solos.',
    text: 'Con su código de invitación, cada club carga su nómina, revisa licencias y ve sus rotaciones privadas.',
    bg: 'bg-[radial-gradient(circle_at_20%_86%,#2f5fe0,transparent_34%),linear-gradient(145deg,#0b1020,#1b2a5c)]',
    view: <ClubPortalMock />,
  },
]

function Solution() {
  return (
    <section id="solucion" className="ox-section bg-ox-paper">
      <div className="ox-container">
        <div className="mb-14 max-w-[50rem]">
          <span className="ox-label">La solución</span>
          <h2 className="ox-h2">Todo el campeonato, en una sola plataforma.</h2>
          <p className="mt-5 max-w-[43rem] leading-relaxed text-ox-ink-600">
            Cuatro vistas conectadas en tiempo real: lo que anota un juez aparece en la mesa de control, en la pantalla
            del gimnasio y en el portal público.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {FEATURES.map((f) => (
            <article key={f.title} className={`group relative min-h-[40rem] overflow-hidden rounded-[1.35rem] text-white ${f.bg}`}>
              <div className="relative z-[2] max-w-[34rem] px-8 pt-8">
                <span className="font-[family-name:var(--font-ox-mono)] text-[0.64rem] tracking-[0.13em] text-white/60 uppercase">
                  {f.kicker}
                </span>
                <h3 className="mt-3 text-[clamp(1.9rem,3.2vw,2.9rem)] leading-[1.02] font-bold tracking-[-0.04em]">{f.title}</h3>
                <p className="mt-3.5 max-w-[30rem] text-[0.9rem] leading-relaxed text-white/70">{f.text}</p>
              </div>
              <div className="ox-feature-view" aria-hidden="true">
                {f.view}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const LIVE_STEPS = [
  { icon: Smartphone, title: 'Nota enviada', who: 'Juez E2 · Suelo' },
  { icon: Gavel, title: 'Nota validada', who: 'Juez árbitro' },
  { icon: Tv, title: 'Ranking actualizado', who: 'Pantalla y portal público' },
]

function LiveFlow() {
  const [active, setActive] = useState(0)
  return (
    <section id="en-vivo" className="ox-section relative isolate overflow-hidden bg-ox-navy-950 text-white">
      <div className="ox-grid-bg" />
      <div className="ox-container">
        <div className="mx-auto max-w-[60rem] text-center">
          <span className="ox-label is-dark">En vivo</span>
          <h2 className="ox-h2">De la nota del juez a la pantalla, en segundos.</h2>
          <p className="mx-auto mt-5 max-w-[43rem] leading-relaxed text-white/65">
            Sin planilleros ni digitación doble. La nota pasa por el juez árbitro y se publica sola.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl md:p-8 lg:grid-cols-[0.7fr_0.6fr_1.2fr]">
          <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-[2.2rem] border-[0.42rem] border-[#2a2f3d] shadow-2xl">
            <div className="h-[24rem]">
              <JudgeMock />
            </div>
          </div>

          <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Recorrido de una nota">
            {LIVE_STEPS.map((s, i) => {
              const Icon = s.icon
              const state = i < active ? 'done' : i === active ? 'active' : 'next'
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className={`grid w-full grid-cols-[2.4rem_1fr] items-center gap-x-3 rounded-xl p-2 text-left transition ${
                      state === 'next' ? 'text-white/45 hover:text-white/80' : 'text-white'
                    } ${state === 'active' ? 'bg-white/[0.07]' : ''}`}
                  >
                    <span
                      className={`row-span-2 grid h-10 w-10 place-items-center rounded-full border font-[family-name:var(--font-ox-mono)] text-xs ${
                        state === 'active'
                          ? 'border-ox-amber bg-ox-blue shadow-[0_0_0_0.38rem_rgb(29_78_216/0.2)]'
                          : state === 'done'
                            ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                            : 'border-white/15 bg-white/5'
                      }`}
                    >
                      {state === 'done' ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <b className="self-end text-[0.8rem]">
                      {i + 1}. {s.title}
                    </b>
                    <small className="text-[0.68rem] text-white/50">{s.who}</small>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="overflow-hidden rounded-2xl border-[0.5rem] border-[#1d2233] shadow-2xl">
            <div className="h-[22rem]">
              <ArenaMock />
            </div>
          </div>
        </div>

        <div className="mt-14 grid border-y border-white/10 md:grid-cols-3">
          {[
            ['Terminal del juez', 'Teclado grande, sin cuentas: el juez solo necesita el PIN.'],
            ['Juez árbitro', 'Valida, corrige y resuelve apelaciones con registro de cada cambio.'],
            ['Portal público', `Familias y clubes siguen el ranking desde el celular. Líder actual: ${EXAMPLE_RANKING[0].name}`],
          ].map(([t, d], i) => (
            <p key={t} className={`flex flex-col gap-1.5 px-0 py-6 md:px-8 ${i < 2 ? 'border-b border-white/10 md:border-r md:border-b-0' : ''}`}>
              <b className="text-base">{t}</b>
              <small className="text-[0.8rem] leading-relaxed text-white/65">{d}</small>
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

function Disciplines() {
  return (
    <section id="disciplinas" className="ox-section bg-white">
      <div className="ox-container">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[46rem]">
            <span className="ox-label">Disciplinas</span>
            <h2 className="ox-h2">Siete disciplinas, un mismo reglamento.</h2>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Disciplinas soportadas">
            {DISCIPLINES.map((d) => (
              <li
                key={d.code}
                title={d.name}
                className="rounded-full border border-ox-line bg-ox-paper px-3 py-1 font-[family-name:var(--font-ox-mono)] text-[0.72rem] font-semibold text-ox-blue-700"
              >
                {d.code}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12 grid border-y border-ox-blue/15 sm:grid-cols-2 lg:grid-cols-4">
          {DISCIPLINE_DETAILS.map((d, i) => (
            <div
              key={d.code}
              className={`px-0 py-8 sm:px-6 ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < 3 ? 'lg:border-r' : 'lg:border-r-0'} border-ox-blue/15 ${
                i < 2 ? 'border-b sm:border-b lg:border-b-0' : i === 2 ? 'border-b sm:border-b-0' : ''
              }`}
            >
              <span className="font-[family-name:var(--font-ox-mono)] text-[0.7rem] font-semibold tracking-widest text-ox-blue">{d.code}</span>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{d.title}</h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ox-ink-600">{d.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Steps() {
  return (
    <section className="bg-white pb-[clamp(5rem,9vw,8rem)]">
      <div className="ox-container">
        <div className="mb-12 max-w-[46rem]">
          <span className="ox-label">Cómo partimos</span>
          <h2 className="text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.02] font-extrabold tracking-[-0.032em]">
            De la planilla al campeonato en vivo.
          </h2>
        </div>
        <ol className="grid gap-[clamp(1.5rem,3vw,3rem)] md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t-2 border-ox-line pt-6">
              <b className="inline-grid h-8 w-8 place-items-center rounded-lg bg-ox-ice font-[family-name:var(--font-ox-mono)] text-sm text-ox-blue-700">
                {i + 1}
              </b>
              <h3 className="mt-4 text-[1.18rem] font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-[22rem] text-[0.92rem] leading-relaxed text-ox-ink-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Pricing({ navigate }: MarketingLandingProps) {
  const link = useAppLink(navigate)
  return (
    <section id="precios" className="ox-section bg-[radial-gradient(circle_at_50%_0%,rgb(29_78_216/0.1),transparent_32rem)] bg-ox-paper">
      <div className="ox-container">
        <div className="mx-auto mb-14 max-w-[52rem] text-center">
          <span className="ox-label">Precios</span>
          <h2 className="ox-h2">Gratis para participar. Pagas cuando organizas.</h2>
          <p className="mx-auto mt-5 max-w-[40rem] leading-relaxed text-ox-ink-600">
            Los clubes que solo compiten en torneos de otros no pagan. Precios en pesos chilenos.
          </p>
        </div>
        <div className="mx-auto grid max-w-[68rem] gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.id}
              className={`flex flex-col rounded-[1.35rem] border p-7 ${
                p.featured
                  ? 'border-ox-blue/40 bg-white shadow-[0_1.8rem_5rem_rgb(29_78_216/0.14)]'
                  : 'border-ox-line bg-white/90 shadow-[0_1.5rem_4rem_rgb(11_26_69/0.05)]'
              }`}
            >
              <div className="flex min-h-8 items-center justify-between gap-3 font-[family-name:var(--font-ox-mono)] text-[0.68rem] font-bold tracking-[0.09em] text-ox-ink-600 uppercase">
                {p.eyebrow}
                {p.badge && <b className="rounded-full bg-ox-ice px-2 py-1 text-[0.58rem] text-ox-blue">{p.badge}</b>}
              </div>
              <h3 className="mt-1 text-lg font-bold">{p.name}</h3>
              <strong className="mt-4 text-[2.4rem] leading-none font-extrabold tracking-[-0.05em] tabular-nums">{p.price}</strong>
              <small className="mt-1.5 text-[0.78rem] text-ox-ink-500">{p.period}</small>
              <ul className="my-6 grid border-t border-ox-line">
                {p.specs.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-3 border-b border-ox-line py-3 text-[0.84rem]">
                    <span className="text-ox-ink-500">{s.label}</span>
                    <b className="text-right">{s.value}</b>
                  </li>
                ))}
              </ul>
              <a
                href={p.ctaHref}
                onClick={link(p.ctaHref)}
                className={`ox-btn mt-auto w-full ${p.featured ? 'ox-btn-primary' : 'ox-btn-outline'}`}
              >
                {p.cta} <ArrowRight />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section className="ox-section bg-white">
      <div className="ox-container grid gap-12 lg:grid-cols-[0.68fr_1fr] lg:gap-24">
        <div>
          <span className="ox-label">Preguntas frecuentes</span>
          <h2 className="ox-h2">Lo que más nos preguntan.</h2>
        </div>
        <div className="grid gap-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="rounded-2xl border border-ox-line bg-white px-6 transition open:border-ox-blue/30 open:shadow-[0_10px_26px_rgb(11_26_69/0.07)]"
            >
              <summary className="flex min-h-[4.4rem] cursor-pointer items-center justify-between gap-4 text-[1.02rem] font-bold">
                {f.q}
                <ChevronDown className="ox-faq-icon h-8 w-8 shrink-0 rounded-full bg-ox-ice p-2 text-ox-blue transition" />
              </summary>
              <p className="pr-12 pb-6 text-[0.92rem] leading-relaxed text-ox-ink-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ navigate }: MarketingLandingProps) {
  const link = useAppLink(navigate)
  const liveHref = `/evento/${PILOT_EVENT_SLUG}`
  return (
    <section className="relative isolate grid min-h-[34rem] place-items-center overflow-hidden text-center text-white">
      <div className="ox-hero-bg" />
      <div className="ox-grid-bg" />
      <div className="ox-container max-w-[56rem]">
        <h2 className="ox-h2">Tu próximo campeonato, sin planillas.</h2>
        <p className="mx-auto mt-5 mb-8 max-w-[38rem] leading-relaxed text-white/70">
          Te mostramos cómo se vería con tus categorías, tus jueces y tu gimnasio.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#contacto" className="ox-btn ox-btn-light">
            Solicita una demo <ArrowRight />
          </a>
          <a href={liveHref} onClick={link(liveHref)} className="ox-btn ox-btn-quiet">
            Ver resultados en vivo
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer({ navigate }: MarketingLandingProps) {
  const link = useAppLink(navigate)
  return (
    <footer className="bg-ox-ink pt-16 pb-8 text-white">
      <div className="ox-container grid gap-10 md:grid-cols-[1.6fr_repeat(3,0.7fr)]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-[19rem] text-[0.8rem] leading-relaxed text-white/55">
            Gestión de campeonatos y puntuación oficial de gimnasia.
          </p>
        </div>
        <div className="grid content-start gap-1 text-[0.82rem]">
          <b className="mb-1 text-[0.68rem] text-white/50">Producto</b>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="py-1 text-white/75 hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <div className="grid content-start gap-1 text-[0.82rem]">
          <b className="mb-1 text-[0.68rem] text-white/50">Accesos</b>
          <a href="/eventos" onClick={link('/eventos')} className="py-1 text-white/75 hover:text-white">
            Cartelera de campeonatos
          </a>
          <a href="/club/rotaciones" onClick={link('/club/rotaciones')} className="py-1 text-white/75 hover:text-white">
            Portal de Clubes (Delegaciones)
          </a>
          <a href="/ingresar" onClick={link('/ingresar')} className="py-1 text-white/75 hover:text-white">
            Acceso Organización
          </a>
          <a href="/juez" onClick={link('/juez')} className="py-1 text-white/75 hover:text-white">
            Juez con PIN
          </a>
        </div>
        <div className="grid content-start gap-1 text-[0.82rem]">
          <b className="mb-1 text-[0.68rem] text-white/50">Ventas</b>
          <a href="#contacto" className="py-1 text-white/75 hover:text-white">
            Solicita una demo
          </a>
        </div>
      </div>
      <div className="ox-container mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[0.72rem] text-white/50">
        <span>© {CURRENT_YEAR} Operix Gymnastics · Comercial Hels SpA</span>
        <span>Conforme al Código de Puntuación FIG 2025-2028</span>
      </div>
    </footer>
  )
}

export function MarketingLanding({ navigate }: MarketingLandingProps) {
  return (
    <main className="ox">
      <Nav navigate={navigate} />
      <Hero navigate={navigate} />
      <ValueStrip />
      <Problem />
      <Solution />
      <LiveFlow />
      <Disciplines />
      <Steps />
      <Pricing navigate={navigate} />
      <Faq />
      <ContactSection />
      <FinalCta navigate={navigate} />
      <Footer navigate={navigate} />
    </main>
  )
}

export default MarketingLanding