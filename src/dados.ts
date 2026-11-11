/* Dados simulados. Nenhum vídeo real: as falas são fictícias, escritas para a demonstração,
   e a forma de onda é gerada a partir de uma semente. */
import type { Corte, Falante, Palavra, Status, Video } from './tipos';

type Fala = [falante: Falante, texto: string];

interface Roteiro {
  titulo: string;
  /** Segundo do vídeo em que a primeira frase do roteiro começa. */
  inicio: number;
  nota: number;
  motivo: string;
  gancho: string;
  status: Status;
  frases: Fala[];
  /** Primeira e última frase que fazem parte do corte; o resto é contexto. */
  de: number;
  ate: number;
}

/* Gerador determinístico (mulberry32): a mesma semente devolve sempre a mesma sequência. */
export function sorteio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Dá um horário a cada palavra, como a transcrição real faz: a duração cresce com o
   tamanho da palavra e há uma pausa no fim de cada frase. */
export function transcreve(frases: Fala[], inicio: number): Palavra[] {
  const palavras: Palavra[] = [];
  let t = inicio;
  frases.forEach(([falante, texto], frase) => {
    const partes = texto.split(/\s+/).filter(Boolean);
    partes.forEach((p, i) => {
      const dur = 0.12 + 0.045 * p.replace(/[^\p{L}\p{N}]/gu, '').length;
      const ultima = i === partes.length - 1;
      palavras.push({ texto: p, ini: t, fim: t + dur, frase, fimDeFrase: ultima, falante });
      t += dur + (ultima ? 0.42 : /[,:;]$/.test(p) ? 0.16 : 0.04);
    });
  });
  return palavras.map((p) => ({ ...p, ini: Math.round(p.ini * 100) / 100, fim: Math.round(p.fim * 100) / 100 }));
}

function montaCorte(idVideo: string, r: Roteiro, i: number): Corte {
  const palavras = transcreve(r.frases, r.inicio);
  const doCorte = palavras.filter((p) => p.frase >= r.de && p.frase <= r.ate);
  return {
    id: `${idVideo}-${i + 1}`,
    titulo: r.titulo,
    ini: doCorte[0].ini,
    fim: doCorte[doCorte.length - 1].fim,
    nota: r.nota,
    motivo: r.motivo,
    gancho: r.gancho,
    status: r.status,
    palavras,
  };
}

const ENTREVISTA: Roteiro[] = [
  {
    titulo: 'O ponto que ninguém viu',
    inicio: 628,
    nota: 86,
    status: 'pendente',
    motivo: 'Abre com uma contradição (seis meses numa tela que ninguém olhava) e fecha com o resultado. Funciona sem o resto da entrevista.',
    gancho: 'A gente passou seis meses polindo a tela errada.',
    de: 1,
    ate: 8,
    frases: [
      [0, 'E quando você olha para trás, o que mudou de verdade?'],
      [1, 'O que mudou foi um detalhe que ninguém viu na época.'],
      [1, 'A gente passou seis meses polindo a tela inicial.'],
      [1, 'Só que quase ninguém ficava nela mais de três segundos.'],
      [1, 'As pessoas entravam, procuravam o botão de sempre e iam embora.'],
      [1, 'O problema nunca foi a beleza da tela.'],
      [1, 'O problema era que a gente escondeu o que elas vieram fazer.'],
      [1, 'No dia em que colocamos esse botão no centro, o uso dobrou.'],
      [1, 'Sem campanha, sem anúncio, só tirando uma coisa da frente.'],
      [0, 'E vocês demoraram para perceber isso?'],
    ],
  },
  {
    titulo: 'Por que a gente começou',
    inicio: 1641,
    nota: 79,
    status: 'pendente',
    motivo: 'História de origem curta, com um número concreto (onze pessoas para aprovar uma cor) e uma regra fácil de repetir.',
    gancho: 'Onze pessoas para aprovar a cor de um botão.',
    de: 1,
    ate: 7,
    frases: [
      [0, 'Vamos voltar um pouco, então.'],
      [0, 'Por que vocês começaram?'],
      [1, 'Começou por irritação, para ser sincera.'],
      [1, 'Eu trabalhava num lugar em que toda decisão levava três reuniões.'],
      [1, 'Um dia eu contei: eram onze pessoas para aprovar a cor de um botão.'],
      [1, 'Eu saí de lá pensando que dava para fazer diferente.'],
      [1, 'Duas pessoas, uma mesa e a regra de decidir no mesmo dia.'],
      [1, 'Essa regra existe até hoje, e é a única que a gente nunca quebrou.'],
      [0, 'Nunca mesmo?'],
    ],
  },
  {
    titulo: 'A virada do projeto',
    inicio: 2746,
    nota: 82,
    status: 'pendente',
    motivo: 'Tem tensão (dois meses de caixa), uma quebra de expectativa ("ninguém foi") e uma frase final que resume a ideia.',
    gancho: 'Achei que metade da equipe ia embora naquela semana.',
    de: 1,
    ate: 9,
    frases: [
      [0, 'Teve um momento em que você achou que não ia dar certo?'],
      [1, 'Teve, e eu lembro do dia.'],
      [1, 'A gente tinha dinheiro para mais dois meses e nenhum cliente novo.'],
      [1, 'Eu sentei com a equipe e falei a verdade, sem enfeite.'],
      [1, 'Achei que metade ia embora naquela semana.'],
      [1, 'Ninguém foi.'],
      [1, 'No lugar disso, alguém levantou a mão e perguntou o que dava para cortar.'],
      [1, 'A gente cortou três projetos e ficou com um só.'],
      [1, 'Foi esse único projeto que pagou todo o resto.'],
      [1, 'A virada não foi uma ideia nova, foi ter coragem de largar as outras.'],
      [0, 'Isso muda a forma como você contrata hoje?'],
    ],
  },
];

const PODCAST: Roteiro[] = [
  {
    titulo: 'Ninguém lê manual',
    inicio: 494,
    nota: 88,
    status: 'exportado',
    motivo: 'Frase curta e direta logo no início, com uma conclusão prática em seguida. Os dois falam, o que dá ritmo.',
    gancho: 'Ninguém lê manual.',
    de: 1,
    ate: 5,
    frases: [
      [0, 'Sabe o que eu aprendi atendendo cliente?'],
      [0, 'Ninguém lê manual.'],
      [0, 'Você pode escrever o melhor texto do mundo.'],
      [0, 'A pessoa vai clicar no primeiro botão que parecer certo.'],
      [0, 'Então o botão certo precisa parecer certo.'],
      [1, 'E o errado precisa dar trabalho.'],
      [0, 'Exato.'],
    ],
  },
  {
    titulo: 'O preço do atalho',
    inicio: 1862,
    nota: 81,
    status: 'aprovado',
    motivo: 'Uma história pequena com começo, meio e consequência. O contraste entre a sexta e o sábado fecha bem o trecho.',
    gancho: 'Todo atalho cobra depois.',
    de: 0,
    ate: 4,
    frases: [
      [1, 'Todo atalho cobra depois.'],
      [1, 'A gente pulou os testes para entregar na sexta.'],
      [1, 'Entregou na sexta e passou o fim de semana inteiro consertando.'],
      [1, 'O cliente nem lembra da sexta.'],
      [1, 'Ele lembra do sábado em que nada funcionava.'],
      [0, 'E vocês voltaram a pular?'],
    ],
  },
  {
    titulo: 'Ferramenta não é método',
    inicio: 3160,
    nota: 77,
    status: 'pendente',
    motivo: 'Opinião forte dita em uma frase, seguida de um exemplo do dia a dia. A resposta do outro apresentador serve de fecho.',
    gancho: 'Ferramenta não é método.',
    de: 0,
    ate: 4,
    frases: [
      [0, 'Tem gente que troca de ferramenta todo mês.'],
      [0, 'Como se o problema fosse o aplicativo.'],
      [0, 'Ferramenta não é método.'],
      [0, 'Se você não sabe o que fazer na segunda de manhã, nenhum aplicativo vai saber por você.'],
      [1, 'Essa doeu.'],
      [0, 'Doeu em mim primeiro.'],
    ],
  },
  {
    titulo: 'A pergunta que eu faço sempre',
    inicio: 4205,
    nota: 74,
    status: 'recusado',
    motivo: 'Uma pergunta que o público pode usar no próprio trabalho. O final ("e vai atrasar") depende um pouco do tom de voz.',
    gancho: 'O que acontece se a gente não fizer nada?',
    de: 0,
    ate: 4,
    frases: [
      [1, 'Antes de aceitar um projeto eu faço uma pergunta só.'],
      [1, 'O que acontece se a gente não fizer nada?'],
      [1, 'Se a resposta for nada, eu não pego.'],
      [1, 'Porque aí ninguém vai sentir falta quando atrasar.'],
      [1, 'E vai atrasar.'],
      [0, 'Sempre atrasa.'],
    ],
  },
];

export function videosIniciais(): Video[] {
  return [
    { id: 'entrevista', nome: 'entrevista-estudio', duracao: 3492, semente: 5812, cortes: ENTREVISTA.map((r, i) => montaCorte('entrevista', r, i)) },
    { id: 'podcast', nome: 'podcast-ep-14', duracao: 5047, semente: 1407, cortes: PODCAST.map((r, i) => montaCorte('podcast', r, i)) },
  ];
}

/* Picos de áudio simulados, de 0 a 1. A fala vem em blocos, com respiros entre eles:
   um envelope lento define os blocos e um ruído rápido dá o serrilhado. */
export function picos(semente: number, n: number): number[] {
  const r = sorteio(semente);
  const fases = [r() * 6.28, r() * 6.28, r() * 6.28];
  const saida: number[] = [];
  let pausa = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const envelope = 0.55 + 0.25 * Math.sin(x * 23 + fases[0]) + 0.2 * Math.sin(x * 71 + fases[1]) * Math.sin(x * 9 + fases[2]);
    if (pausa === 0 && r() < 0.035) pausa = 1 + Math.floor(r() * 3);
    const silencio = pausa > 0;
    if (pausa > 0) pausa--;
    const v = silencio ? 0.04 + r() * 0.05 : Math.max(0.08, envelope * (0.45 + r() * 0.55));
    saida.push(Math.min(1, v));
  }
  return saida;
}
