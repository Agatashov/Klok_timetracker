export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const PROJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  slate:   { bg: 'bg-slate-100',   text: 'text-slate-700',   dot: 'bg-slate-500' },
  red:     { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
  orange:  { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cyan:    { bg: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-500' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-500' },
  pink:    { bg: 'bg-pink-100',    text: 'text-pink-700',    dot: 'bg-pink-500' },
}

export const COLOR_OPTIONS = Object.keys(PROJECT_COLORS)

export function getProjectColor(color: string) {
  return PROJECT_COLORS[color] ?? PROJECT_COLORS.slate
}
