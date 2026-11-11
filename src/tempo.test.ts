import { describe, expect, it } from 'vitest';
import { picos, transcreve, videosIniciais } from './dados';
import { blocoDaLegenda, falaEm } from './fala';
import { fmt, fmtDecimo, fmtDuracao } from './tempo';

describe('formatação de tempo', () => {
  it('minutos e segundos', () => {
    expect(fmt(0)).toBe('0:00');
    expect(fmt(41.9)).toBe('0:41');
    expect(fmt(3492)).toBe('58:12');
  });

  it('passa para horas depois de 60 minutos', () => {
    expect(fmt(5047)).toBe('1:24:07');
  });

  it('décimos com vírgula, como no app', () => {
    expect(fmtDecimo(962.4)).toBe('16:02,4');
    expect(fmtDecimo(59.96)).toBe('1:00,0');
  });

  it('duração curta em segundos, longa em minutos', () => {
    expect(fmtDuracao(41.2)).toBe('41 s');
    expect(fmtDuracao(75)).toBe('1:15');
  });
});

describe('dados simulados', () => {
  it('a mesma semente desenha a mesma onda', () => {
    expect(picos(5812, 50)).toEqual(picos(5812, 50));
    expect(picos(5812, 50)).not.toEqual(picos(1407, 50));
  });

  it('os picos ficam entre 0 e 1', () => {
    for (const v of picos(7, 400)) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('as palavras da transcrição não se sobrepõem', () => {
    const ps = transcreve([[0, 'Uma frase curta.'], [1, 'E outra, logo depois.']], 100);
    for (let i = 1; i < ps.length; i++) expect(ps[i].ini).toBeGreaterThanOrEqual(ps[i - 1].fim);
    expect(ps.filter((p) => p.fimDeFrase)).toHaveLength(2);
  });

  it('todo corte cabe dentro do vídeo e do próprio trecho transcrito', () => {
    for (const v of videosIniciais()) {
      for (const c of v.cortes) {
        expect(c.ini).toBeGreaterThanOrEqual(c.palavras[0].ini);
        expect(c.fim).toBeLessThanOrEqual(c.palavras[c.palavras.length - 1].fim);
        expect(c.fim).toBeLessThan(v.duracao);
      }
    }
  });
});

describe('quem fala', () => {
  const video = videosIniciais()[0];
  const corte = video.cortes[0];

  it('acha a palavra dita dentro de um corte', () => {
    const alvo = corte.palavras[5];
    const fala = falaEm(video, (alvo.ini + alvo.fim) / 2);
    expect(fala.palavra).toBe(alvo);
    expect(fala.falante).toBe(alvo.falante);
  });

  it('fora dos trechos transcritos não há legenda', () => {
    const fala = falaEm(video, 5);
    expect(fala.palavra).toBeNull();
    expect(blocoDaLegenda(fala)).toEqual([]);
  });

  it('a legenda mostra até três palavras, incluindo a atual', () => {
    const alvo = corte.palavras.filter((p) => p.frase === 2)[4];
    const bloco = blocoDaLegenda(falaEm(video, alvo.ini + 0.01));
    expect(bloco.length).toBeLessThanOrEqual(3);
    expect(bloco).toContain(alvo);
  });
});
