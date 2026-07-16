import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Task surfaces inherit the same editorial black / ivory / signal-red system
  as the redesigned homepage. Copy can vary by task, but the visual language
  stays cohesive across archives and detail views.
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Michroma', 'Space Grotesk', system-ui, sans-serif"
const BODY_FONT = "'Space Grotesk', 'IBM Plex Sans', system-ui, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#050505',
  surface: '#0b0b0b',
  raised: '#141414',
  text: '#f4f1ea',
  muted: '#b1ada5',
  line: 'rgba(255,255,255,0.1)',
  accent: '#ff2020',
  accentSoft: 'rgba(255,32,32,0.12)',
  onAccent: '#ffffff',
  glow: 'rgba(255,32,32,0.18)',
  radius: '1.75rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Journal', note: 'In-depth reads, references, and standout stories in one reading flow.' },
  listing: { ...base, kicker: 'Directory', note: 'Browse image-led listings with quick access to key business details.' },
  classified: { ...base, kicker: 'Noticeboard', note: 'Offers, openings, and timely posts with stronger visual hierarchy.' },
  image: { ...base, kicker: 'Gallery', note: 'A visual-first surface for image-led discovery and collection browsing.' },
  sbm: { ...base, kicker: 'Links', note: 'Curated references and saved resources collected into one sharp archive.' },
  pdf: { ...base, kicker: 'Library', note: 'Downloadable documents, handbooks, and presentations presented cleanly.' },
  profile: { ...base, kicker: 'Profiles', note: 'People, studios, and public-facing profiles with stronger identity surfaces.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    // Re-point the shared article-body accent vars so post HTML (headings,
    // links) inherits this task's accent instead of the global site accent.
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
