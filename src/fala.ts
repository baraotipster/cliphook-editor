import type { Falante, Palavra, Video } from './tipos';

export interface Fala {
  falante: Falante;
  /** Palavra dita neste instante, quando o tempo cai dentro de um trecho transcrito. */
  palavra: Palavra | null;
  /** As palavras da frase atual, para a legenda. */
  frase: Palavra[];
}

/* Quem fala e qual palavra está sendo dita no tempo t. Fora dos trechos transcritos
   não há legenda; os falantes só se alternam de tempos em tempos. */
export function falaEm(video: Video, t: number): Fala {
  for (const c of video.cortes) {
    const ps = c.palavras;
    if (t < ps[0].ini || t > ps[ps.length - 1].fim + 0.4) continue;
    /* a palavra atual é a última que já começou: assim a legenda não pisca nas pausas */
    let atual = ps[0];
    for (const p of ps) {
      if (p.ini <= t) atual = p;
      else break;
    }
    return { falante: atual.falante, palavra: atual, frase: ps.filter((p) => p.frase === atual.frase) };
  }
  return { falante: (Math.floor(t / 7) % 2) as Falante, palavra: null, frase: [] };
}

/* Legenda em blocos de até três palavras, como a que o app queima no vídeo.
   Devolve o bloco que contém a palavra atual. */
export function blocoDaLegenda(fala: Fala, tamanho = 3): Palavra[] {
  if (!fala.palavra) return [];
  const i = fala.frase.indexOf(fala.palavra);
  const inicio = Math.floor(i / tamanho) * tamanho;
  return fala.frase.slice(inicio, inicio + tamanho);
}
