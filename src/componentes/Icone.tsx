/* Ícones em traço, no mesmo desenho dos do app. */
const TRACO = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const DESENHOS = {
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  pausa: (
    <>
      <rect x="7" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" />
      <rect x="13.5" y="5.5" width="3.5" height="13" rx="1" fill="currentColor" />
    </>
  ),
  volta: <path d="M11 7 6 12l5 5M18 7l-5 5 5 5" {...TRACO} />,
  avanca: <path d="m13 7 5 5-5 5M6 7l5 5-5 5" {...TRACO} />,
  anterior: <path d="M7 6v12M18 6l-8 6 8 6z" {...TRACO} />,
  proximo: <path d="M17 6v12M6 6l8 6-8 6z" {...TRACO} />,
  repetir: <path d="M17 3.5 20 6.5l-3 3M4 11.5v-1a4 4 0 0 1 4-4h12M7 20.5l-3-3 3-3M20 12.5v1a4 4 0 0 1-4 4H4" {...TRACO} />,
  ok: <path d="m5 12.5 4.5 4.5L19 7.5" {...TRACO} strokeWidth={2.2} />,
  x: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" {...TRACO} />,
  seta: <path d="M7 17 17 7M9 7h8v8" {...TRACO} />,
} as const;

export type NomeDeIcone = keyof typeof DESENHOS;

export function Icone({ nome, tamanho = 20 }: { nome: NomeDeIcone; tamanho?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true" focusable="false">
      {DESENHOS[nome]}
    </svg>
  );
}

/* Símbolo do ClipHook: o gancho sobre o quadrado verde-limão. */
export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={tamanho} height={tamanho} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#b7f36b" />
      <circle cx="18" cy="7.4" r="2.5" fill="none" stroke="#111318" strokeWidth="2.5" />
      <path d="M18 9.9 V18.2 a5.8 5.8 0 0 1 -11.6 0 L6.4 15.6 L10.2 18.6" fill="none" stroke="#111318" strokeWidth="2.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22.2 12.4 L26.4 15 L22.2 17.6 Z" fill="#111318" />
    </svg>
  );
}
