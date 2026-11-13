/**
 * Textos y datos de la landing de marketing.
 * Todo el copy vive aquí para poder editarlo sin tocar los componentes.
 */

/** Datos de ejemplo para las maquetas: nombres inventados, nunca deportistas reales. */
export const EXAMPLE_RANKING = [
  { pos: 1, name: 'Antonia R.', club: 'Club Andes', score: '51.350' },
  { pos: 2, name: 'Josefa M.', club: 'Club Austral', score: '50.875' },
  { pos: 3, name: 'Trinidad P.', club: 'Club Bío Bío', score: '49.900' },
  { pos: 4, name: 'Emilia C.', club: 'Club Andes', score: '49.425' },
]

export const PILOT_EVENT_SLUG = 'artistica-paillaco-2026'

/** Contacto opcional: se muestra solo si las variables están definidas en .env */
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL || ''
/** Número en formato internacional sin "+" ni espacios, p. ej. 56912345678 */
export const CONTACT_WHATSAPP: string = import.meta.env.VITE_CONTACT_WHATSAPP || ''

export const NAV_LINKS = [
  { href: '#problema', label: 'Problema' },
  { href: '#solucion', label: 'Solución' },
  { href: '#en-vivo', label: 'En vivo' },
  { href: '#disciplinas', label: 'Disciplinas' },
  { href: '#precios', label: 'Precios' },
] as const

export const VALUE_STRIP = [
  { title: 'Jueces con PIN.', text: 'Entran desde su celular, sin crear cuentas ni contraseñas.' },
  { title: 'Código FIG 2025-2028.', text: 'D + E − ND, descarte de extremos y desempates oficiales.' },
  { title: 'Resultados al instante.', text: 'De la nota del juez a la pantalla del gimnasio en segundos.' },
] as const

export const PROBLEMS = [
  {
    icon: 'sheet',
    title: 'Mesa de control en papel',
    text: 'Planillas, calculadora y Excel para sumar notas. Un error de digitación cambia un podio.',
  },
  {
    icon: 'clock',
    title: 'Resultados que tardan horas',
    text: 'Familias y entrenadores esperan la premiación sin saber cómo va el campeonato.',
  },
  {
    icon: 'megaphone',
    title: 'Rotaciones a ciegas',
    text: 'El orden de paso vive en una hoja impresa y el llamado a pista depende del megáfono.',
  },
  {
    icon: 'scale',
    title: 'Apelaciones sin respaldo',
    text: 'Cuando se corrige una nota, nadie puede mostrar qué cambió, quién lo cambió y cuándo.',
  },
] as const

export const DISCIPLINES = [
  { code: 'GAF', name: 'Artística femenina' },
  { code: 'GAM', name: 'Artística masculina' },
  { code: 'GR', name: 'Rítmica' },
  { code: 'TRA', name: 'Trampolín' },
  { code: 'AER', name: 'Aeróbica' },
  { code: 'ACRO', name: 'Acrobática' },
  { code: 'PK', name: 'Parkour' },
] as const

export const DISCIPLINE_DETAILS = [
  {
    code: 'GAF · GAM',
    title: 'Artística',
    text: '4 aparatos femeninos y 6 masculinos. D + E − ND, regla de dos intentos en salto y descarte de extremos.',
  },
  {
    code: 'GR · AER',
    title: 'Rítmica y aeróbica',
    text: 'Aro, pelota, mazas, cinta, manos libres y conjuntos. Dificultad, artística y ejecución por separado.',
  },
  {
    code: 'TRA · ACRO',
    title: 'Trampolín y acrobática',
    text: 'Individual, DMT, tumbling y sincronizado con tiempo de vuelo y desplazamiento horizontal.',
  },
  {
    code: 'PK',
    title: 'Parkour',
    text: 'Speed con tiempos en segundos y penalizaciones de recorrido, más freestyle.',
  },
] as const

export const STEPS = [
  {
    title: 'Creas el campeonato',
    text: 'Defines categorías, aparatos y reglas. Si ya tienes las inscripciones en Excel, las importas.',
  },
  {
    title: 'Los clubes se inscriben',
    text: 'Cada club entra con su código de invitación, carga su nómina y ve sus rotaciones.',
  },
  {
    title: 'Compites en vivo',
    text: 'Jueces con PIN, mesa de control, pantalla del gimnasio y actas oficiales al cierre.',
  },
] as const

export interface Plan {
  id: string
  eyebrow: string
  name: string
  price: string
  period: string
  featured?: boolean
  badge?: string
  specs: { label: string; value: string }[]
  cta: string
  ctaHref: string
}

/** Mismos valores que la landing anterior y SubscriptionPlansView. Revisa IVA y condiciones antes de publicar. */
export const PLANS: Plan[] = [
  {
    id: 'club',
    eyebrow: 'Club participante',
    name: 'Plan Club',
    price: '$0',
    period: 'gratis',
    specs: [
      { label: 'Gimnastas', value: 'hasta 25' },
      { label: 'Inscripción en torneos', value: 'con código' },
      { label: 'Resultados en vivo', value: 'incluido' },
    ],
    cta: 'Comenzar gratis',
    ctaHref: '/ingresar',
  },
  {
    id: 'organizador',
    eyebrow: 'Club anfitrión / asociación',
    name: 'Plan Organizador',
    price: '$49.990',
    period: 'CLP / mes · sin contrato',
    featured: true,
    badge: 'Más elegido',
    specs: [
      { label: 'Campeonatos y categorías', value: 'ilimitados' },
      { label: 'Terminales de jueces', value: 'PIN express' },
      { label: 'Modo TV Arena y podio', value: 'incluido' },
      { label: 'Actas con desempates FIG', value: 'incluido' },
    ],
    cta: 'Solicita una demo',
    ctaHref: '#contacto',
  },
  {
    id: 'federacion',
    eyebrow: 'Federación nacional',
    name: 'Plan Federación',
    price: '$120.000',
    period: 'CLP / mes',
    specs: [
      { label: 'Asociaciones', value: 'varias, bajo un paraguas' },
      { label: 'Licencias y ranking', value: 'nacional' },
      { label: 'Subdominio propio', value: 'incluido' },
      { label: 'Soporte', value: 'SLA prioritario' },
    ],
    cta: 'Habla con nosotros',
    ctaHref: '#contacto',
  },
]

export const FAQS = [
  {
    q: '¿Los jueces necesitan crear una cuenta?',
    a: 'No. Entran desde su celular o tablet con el PIN del campeonato y quedan asignados a su aparato.',
  },
  {
    q: '¿Puedo cargar las inscripciones que ya tengo en Excel?',
    a: 'Sí. El importador lee tu planilla de deportistas, clubes y categorías y la convierte en el campeonato.',
  },
  {
    q: '¿Qué disciplinas soporta?',
    a: 'Artística femenina y masculina, rítmica, trampolín, aeróbica, acrobática y parkour, según el Código FIG 2025-2028.',
  },
  {
    q: '¿Cómo se resuelve una apelación de nota?',
    a: 'El jurado superior la resuelve en la plataforma y queda un registro con la nota previa, la corregida, quién la cambió y cuándo.',
  },
  {
    q: '¿Los datos de mi club están protegidos?',
    a: 'Cada organización tiene sus datos aislados en la base con políticas de seguridad por fila: un club no puede ver ni modificar los datos de otro.',
  },
  {
    q: '¿Cómo empiezo?',
    a: 'Completa el formulario de contacto y coordinamos una demostración con un campeonato de ejemplo.',
  },
] as const

export const ROLES = [
  { value: 'organizador', label: 'Organizo campeonatos' },
  { value: 'club', label: 'Represento a un club' },
  { value: 'federacion', label: 'Federación o asociación' },
  { value: 'juez', label: 'Juez' },
  { value: 'otro', label: 'Otro' },
] as const