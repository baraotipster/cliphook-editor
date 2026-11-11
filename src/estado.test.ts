import { describe, expect, it } from 'vitest';
import { videosIniciais } from './dados';
import { DURACAO_MINIMA, ajusta, ajustaAFrase, contagens, corteAtual, decide, estadoInicial, filtra, redutor, videoAtual, type Estado } from './estado';

const novo = (): Estado => estadoInicial(videosIniciais());
const primeiro = (e: Estado) => videoAtual(e).cortes[0];

describe('decidir', () => {
  it('aprova um corte pendente e volta para pendente ao repetir', () => {
    const c = primeiro(novo());
    const aprovado = decide(c, 'aprovado');
    expect(aprovado.status).toBe('aprovado');
    expect(decide(aprovado, 'aprovado').status).toBe('pendente');
  });

  it('troca de aprovado para recusado direto', () => {
    const c = decide(primeiro(novo()), 'aprovado');
    expect(decide(c, 'recusado').status).toBe('recusado');
  });

  it('não mexe em corte já exportado', () => {
    const c = { ...primeiro(novo()), status: 'exportado' as const };
    expect(decide(c, 'recusado')).toBe(c);
  });
});

describe('ajuste fino', () => {
  it('move a entrada em décimos de segundo', () => {
    const c = primeiro(novo());
    expect(ajusta(c, 'ini', 0.1).ini).toBeCloseTo(Math.round((c.ini + 0.1) * 10) / 10, 5);
  });

  it('não deixa a entrada sair do trecho transcrito', () => {
    const c = primeiro(novo());
    expect(ajusta(c, 'ini', -999).ini).toBeCloseTo(c.palavras[0].ini, 1);
  });

  it('mantém a duração mínima', () => {
    const c = primeiro(novo());
    const curto = ajusta(c, 'fim', -999);
    expect(curto.fim - curto.ini).toBeGreaterThanOrEqual(DURACAO_MINIMA - 0.05);
  });

  it('ajustar à frase encaixa as pontas em começo e fim de frase', () => {
    const c = primeiro(novo());
    const torto = ajusta(ajusta(c, 'ini', 0.7), 'fim', -0.6);
    const certo = ajustaAFrase(torto);
    expect(certo.ini).toBe(c.ini);
    expect(certo.fim).toBe(c.fim);
  });
});

describe('redutor', () => {
  it('abrir outro vídeo seleciona o primeiro corte dele e limpa o filtro', () => {
    let e = redutor(novo(), { tipo: 'filtro', filtro: 'aprovado' });
    e = redutor(e, { tipo: 'abrirVideo', videoId: 'podcast' });
    expect(videoAtual(e).id).toBe('podcast');
    expect(corteAtual(e).id).toBe('podcast-1');
    expect(e.filtro).toBe('todos');
  });

  it('exporta só os aprovados e avisa quantos saíram', () => {
    let e = novo();
    const [a, b] = videoAtual(e).cortes;
    e = redutor(e, { tipo: 'decidir', corteId: a.id, decisao: 'aprovado' });
    e = redutor(e, { tipo: 'decidir', corteId: b.id, decisao: 'aprovado' });
    e = redutor(e, { tipo: 'exportarInicio' });
    expect(e.exportando).toEqual({ feitos: 0, total: 2 });

    e = redutor(e, { tipo: 'exportarPasso', corteId: a.id });
    e = redutor(e, { tipo: 'exportarPasso', corteId: b.id });
    e = redutor(e, { tipo: 'exportarFim' });

    expect(contagens(videoAtual(e))).toEqual({ pendente: 1, aprovado: 0, recusado: 0, exportado: 2 });
    expect(e.aviso).toBe('2 cortes exportados');
    expect(e.exportando).toBeNull();
  });

  it('não começa a exportar sem corte aprovado', () => {
    expect(redutor(novo(), { tipo: 'exportarInicio' }).exportando).toBeNull();
  });

  it('bloqueia decisões durante a exportação', () => {
    let e = novo();
    const [a, b] = videoAtual(e).cortes;
    e = redutor(e, { tipo: 'decidir', corteId: a.id, decisao: 'aprovado' });
    e = redutor(e, { tipo: 'exportarInicio' });
    e = redutor(e, { tipo: 'decidir', corteId: b.id, decisao: 'aprovado' });
    expect(videoAtual(e).cortes[1].status).toBe('pendente');
  });
});

describe('filtro', () => {
  it('mostra só os cortes do status pedido', () => {
    const podcast = videosIniciais()[1];
    expect(filtra(podcast.cortes, 'todos')).toHaveLength(4);
    expect(filtra(podcast.cortes, 'exportado').map((c) => c.titulo)).toEqual(['Ninguém lê manual']);
  });
});
