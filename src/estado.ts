/* Estado do editor e as regras que o mudam. Tudo aqui é função pura: fácil de testar
   e sem depender de React. O tempo de reprodução fica fora (ver relogio.ts), porque muda
   a cada quadro e não deve redesenhar a tela inteira. */
import type { Corte, Filtro, Status, Video } from './tipos';
import { limita } from './tempo';

export interface Estado {
  videos: Video[];
  videoId: string;
  corteId: string;
  filtro: Filtro;
  repetir: boolean;
  /** Durante a exportação: quantos cortes já saíram, de quantos. */
  exportando: { feitos: number; total: number } | null;
  aviso: string | null;
}

export type Acao =
  | { tipo: 'abrirVideo'; videoId: string }
  | { tipo: 'selecionarCorte'; corteId: string }
  | { tipo: 'decidir'; corteId: string; decisao: 'aprovado' | 'recusado' }
  | { tipo: 'titulo'; corteId: string; titulo: string }
  | { tipo: 'ajustar'; corteId: string; ponta: 'ini' | 'fim'; delta: number }
  | { tipo: 'ajustarAFrase'; corteId: string }
  | { tipo: 'filtro'; filtro: Filtro }
  | { tipo: 'repetir' }
  | { tipo: 'exportarInicio' }
  | { tipo: 'exportarPasso'; corteId: string }
  | { tipo: 'exportarFim' }
  | { tipo: 'fecharAviso' };

/** Um corte não pode ficar menor que isto, em segundos. */
export const DURACAO_MINIMA = 3;

export const videoAtual = (e: Estado): Video => e.videos.find((v) => v.id === e.videoId) ?? e.videos[0];

export const corteAtual = (e: Estado): Corte => {
  const v = videoAtual(e);
  return v.cortes.find((c) => c.id === e.corteId) ?? v.cortes[0];
};

export function contagens(v: Video): Record<Status, number> {
  const n: Record<Status, number> = { pendente: 0, aprovado: 0, recusado: 0, exportado: 0 };
  for (const c of v.cortes) n[c.status]++;
  return n;
}

export function filtra(cortes: Corte[], filtro: Filtro): Corte[] {
  return filtro === 'todos' ? cortes : cortes.filter((c) => c.status === filtro);
}

/* Aprovar e recusar funcionam como interruptores: repetir a mesma decisão volta o corte
   para pendente. Um corte já exportado não muda mais por aqui. */
export function decide(c: Corte, decisao: 'aprovado' | 'recusado'): Corte {
  if (c.status === 'exportado') return c;
  return { ...c, status: c.status === decisao ? 'pendente' : decisao };
}

/* Move a entrada ou a saída. As pontas ficam dentro do trecho transcrito e o corte
   nunca fica menor que a duração mínima. */
export function ajusta(c: Corte, ponta: 'ini' | 'fim', delta: number): Corte {
  const primeiro = c.palavras[0].ini;
  const ultimo = c.palavras[c.palavras.length - 1].fim;
  const arredonda = (v: number) => Math.round(v * 10) / 10;
  if (ponta === 'ini') return { ...c, ini: arredonda(limita(c.ini + delta, primeiro, c.fim - DURACAO_MINIMA)) };
  return { ...c, fim: arredonda(limita(c.fim + delta, c.ini + DURACAO_MINIMA, ultimo)) };
}

const maisPerto = (alvo: number, opcoes: number[]) => opcoes.reduce((a, b) => (Math.abs(b - alvo) < Math.abs(a - alvo) ? b : a));

/* Encaixa a entrada no começo de frase mais próximo e a saída no fim de frase mais próximo,
   para o corte não começar nem terminar no meio de uma fala. */
export function ajustaAFrase(c: Corte): Corte {
  const inicios = c.palavras.filter((_p, i) => i === 0 || c.palavras[i - 1].fimDeFrase).map((p) => p.ini);
  const fins = c.palavras.filter((p) => p.fimDeFrase).map((p) => p.fim);
  const ini = maisPerto(c.ini, inicios);
  const depois = fins.filter((f) => f - ini >= DURACAO_MINIMA);
  const fim = depois.length ? maisPerto(c.fim, depois) : c.fim;
  return { ...c, ini, fim };
}

function trocaCorte(e: Estado, corteId: string, muda: (c: Corte) => Corte): Estado {
  return {
    ...e,
    videos: e.videos.map((v) => (v.id !== e.videoId ? v : { ...v, cortes: v.cortes.map((c) => (c.id === corteId ? muda(c) : c)) })),
  };
}

export function redutor(e: Estado, a: Acao): Estado {
  switch (a.tipo) {
    case 'abrirVideo': {
      const v = e.videos.find((x) => x.id === a.videoId);
      if (!v || e.exportando) return e;
      return { ...e, videoId: v.id, corteId: v.cortes[0].id, filtro: 'todos', aviso: null };
    }
    case 'selecionarCorte':
      return { ...e, corteId: a.corteId };
    case 'decidir':
      return e.exportando ? e : trocaCorte(e, a.corteId, (c) => decide(c, a.decisao));
    case 'titulo':
      return trocaCorte(e, a.corteId, (c) => ({ ...c, titulo: a.titulo }));
    case 'ajustar':
      return trocaCorte(e, a.corteId, (c) => ajusta(c, a.ponta, a.delta));
    case 'ajustarAFrase':
      return trocaCorte(e, a.corteId, ajustaAFrase);
    case 'filtro':
      return { ...e, filtro: a.filtro };
    case 'repetir':
      return { ...e, repetir: !e.repetir };
    case 'exportarInicio': {
      const total = contagens(videoAtual(e)).aprovado;
      return total === 0 || e.exportando ? e : { ...e, exportando: { feitos: 0, total }, aviso: null };
    }
    case 'exportarPasso': {
      if (!e.exportando) return e;
      const prox = trocaCorte(e, a.corteId, (c) => ({ ...c, status: 'exportado' }));
      return { ...prox, exportando: { ...e.exportando, feitos: e.exportando.feitos + 1 } };
    }
    case 'exportarFim': {
      if (!e.exportando) return e;
      const n = e.exportando.feitos;
      return { ...e, exportando: null, aviso: `${n} ${n === 1 ? 'corte exportado' : 'cortes exportados'}` };
    }
    case 'fecharAviso':
      return { ...e, aviso: null };
  }
}

export function estadoInicial(videos: Video[]): Estado {
  return { videos, videoId: videos[0].id, corteId: videos[0].cortes[0].id, filtro: 'todos', repetir: false, exportando: null, aviso: null };
}
