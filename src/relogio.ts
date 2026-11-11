/* Relógio da reprodução. Como não há vídeo de verdade, o tempo é contado com
   requestAnimationFrame. Ele vive fora do React: os poucos componentes que precisam
   do tempo se inscrevem com useSyncExternalStore, e o resto da tela não redesenha
   sessenta vezes por segundo. */
import { useSyncExternalStore } from 'react';
import { limita } from './tempo';

export interface Relogio {
  tempo(): number;
  tocando(): boolean;
  assinar(ouvinte: () => void): () => void;
  tocar(): void;
  pausar(): void;
  ir(t: number): void;
  /** Duração do vídeo e, se houver, o trecho que deve ficar repetindo. */
  configurar(duracao: number, laco: [number, number] | null): void;
}

export function criaRelogio(): Relogio {
  let tempo = 0;
  let tocando = false;
  let duracao = 1;
  let laco: [number, number] | null = null;
  let raf = 0;
  let antes = 0;
  const ouvintes = new Set<() => void>();
  const avisa = () => ouvintes.forEach((f) => f());

  const quadro = (agora: number) => {
    /* limite de 0,1 s: voltar de uma aba inativa não faz o tempo saltar */
    const dt = Math.min(0.1, (agora - antes) / 1000);
    antes = agora;
    tempo += dt;
    if (laco && tempo >= laco[1]) tempo = laco[0];
    if (tempo >= duracao) {
      tempo = duracao;
      tocando = false;
    }
    avisa();
    if (tocando) raf = requestAnimationFrame(quadro);
  };

  return {
    tempo: () => tempo,
    tocando: () => tocando,
    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => {
        ouvintes.delete(ouvinte);
      };
    },
    tocar() {
      if (tocando) return;
      if (tempo >= duracao) tempo = 0;
      tocando = true;
      antes = performance.now();
      raf = requestAnimationFrame(quadro);
      avisa();
    },
    pausar() {
      if (!tocando) return;
      tocando = false;
      cancelAnimationFrame(raf);
      avisa();
    },
    ir(t) {
      tempo = limita(t, 0, duracao);
      avisa();
    },
    configurar(d, l) {
      duracao = d;
      laco = l;
    },
  };
}

export const useTempo = (r: Relogio) => useSyncExternalStore(r.assinar, r.tempo);
export const useTocando = (r: Relogio) => useSyncExternalStore(r.assinar, r.tocando);
