const dois = (n: number) => String(n).padStart(2, '0');

/** 3492 → "58:12" · 5047 → "1:24:07" */
export function fmt(seg: number): string {
  const s = Math.max(0, Math.floor(seg));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${dois(m)}:${dois(s % 60)}` : `${m}:${dois(s % 60)}`;
}

/** Com décimos, como no ajuste fino do app: 962.4 → "16:02,4" */
export function fmtDecimo(seg: number): string {
  const total = Math.max(0, Math.round(seg * 10));
  return `${fmt(Math.floor(total / 10))},${total % 10}`;
}

/** Duração curta de um corte: 41.2 → "41 s" · 75 → "1:15" */
export function fmtDuracao(seg: number): string {
  const s = Math.round(seg);
  return s < 60 ? `${s} s` : fmt(s);
}

export const limita = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
