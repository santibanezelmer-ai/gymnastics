import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, Mail, MessageCircle, AlertCircle } from 'lucide-react'
import { submitDemoRequest } from './demoRequests'
import { CONTACT_EMAIL, CONTACT_WHATSAPP, DISCIPLINES, ROLES } from './content'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const field =
  'w-full rounded-xl border border-ox-line bg-white px-3.5 py-3 text-sm text-ox-ink placeholder:text-ox-ink-500/70 focus:border-ox-blue'
const label = 'grid gap-1.5 text-[0.78rem] font-semibold text-ox-ink-600'

export function ContactSection() {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    // Campo trampa para bots: si viene lleno, se ignora en silencio.
    if (String(data.get('website') || '')) {
      setStatus('sent')
      return
    }
    const text = (k: string) => String(data.get(k) || '').trim()
    setStatus('sending')
    try {
      await submitDemoRequest({
        full_name: text('full_name'),
        organization: text('organization'),
        role: text('role'),
        email: text('email'),
        phone: text('phone') || null,
        discipline: text('discipline') || null,
        message: text('message') || null,
      })
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const whatsappHref = CONTACT_WHATSAPP
    ? `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent('Hola, quiero una demo de Operix Gymnastics')}`
    : ''

  return (
    <section id="contacto" className="ox-section bg-ox-paper">
      <div className="ox-container grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
        <div>
          <span className="ox-label">Contacto</span>
          <h2 className="ox-h2">Agenda una demo de tu campeonato.</h2>
          <p className="mt-5 max-w-md leading-relaxed text-ox-ink-600">
            Te mostramos la plataforma con un campeonato de ejemplo de tu disciplina: inscripción de clubes, terminal
            de jueces, pantalla del gimnasio y actas. Respondemos en un día hábil.
          </p>
          {(whatsappHref || CONTACT_EMAIL) && (
            <div className="mt-8 grid gap-3 text-sm">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-ox-blue-700 hover:underline"
                >
                  <MessageCircle className="h-4 w-4" /> Escríbenos por WhatsApp
                </a>
              )}
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 font-semibold text-ox-blue-700 hover:underline"
                >
                  <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
                </a>
              )}
            </div>
          )}
        </div>

        {status === 'sent' ? (
          <div
            role="status"
            className="flex flex-col items-start justify-center gap-3 rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm"
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <h3 className="text-xl font-bold">Recibimos tu solicitud.</h3>
            <p className="text-sm text-ox-ink-600">Te escribiremos al correo que dejaste para coordinar la demo.</p>
            <button type="button" className="ox-btn ox-btn-outline ox-btn-small mt-2" onClick={() => setStatus('idle')}>
              Enviar otra solicitud
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="grid gap-4 rounded-2xl border border-ox-line bg-white p-6 shadow-[0_1.5rem_4rem_rgb(11_26_69/0.06)] sm:grid-cols-2 sm:p-8"
          >
            <label className={label} htmlFor="ox-full_name">
              Nombre
              <input id="ox-full_name" name="full_name" required maxLength={120} autoComplete="name" className={field} />
            </label>
            <label className={label} htmlFor="ox-organization">
              Club, asociación o federación
              <input id="ox-organization" name="organization" required maxLength={160} className={field} />
            </label>
            <label className={label} htmlFor="ox-email">
              Correo
              <input id="ox-email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
            </label>
            <label className={label} htmlFor="ox-phone">
              <span>
                WhatsApp o teléfono <span className="font-normal text-ox-ink-500">(opcional)</span>
              </span>
              <input id="ox-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} />
            </label>
            <label className={label} htmlFor="ox-role">
              ¿Quién eres?
              <select id="ox-role" name="role" required defaultValue="" className={field}>
                <option value="" disabled>
                  Elige una opción
                </option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={label} htmlFor="ox-discipline">
              Disciplina principal
              <select id="ox-discipline" name="discipline" defaultValue="" className={field}>
                <option value="">Varias / no sé</option>
                {DISCIPLINES.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${label} sm:col-span-2`} htmlFor="ox-message">
              <span>
                ¿Qué campeonato quieres organizar? <span className="font-normal text-ox-ink-500">(opcional)</span>
              </span>
              <textarea id="ox-message" name="message" rows={3} maxLength={2000} className={`${field} resize-y`} />
            </label>
            {/* Campo trampa: oculto para personas, visible para bots */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            {status === 'error' && (
              <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No pudimos enviar tu solicitud. Inténtalo de nuevo
                  {CONTACT_EMAIL ? ` o escríbenos a ${CONTACT_EMAIL}` : ' en unos minutos'}.
                </span>
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <p className="text-[0.72rem] text-ox-ink-500">Solo usamos estos datos para coordinar la demo.</p>
              <button type="submit" className="ox-btn ox-btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : 'Solicitar demo'}
                <ArrowRight />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}