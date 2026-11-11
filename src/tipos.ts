export type Status = 'pendente' | 'aprovado' | 'recusado' | 'exportado';

/** Quem está falando: 0 é a pessoa à esquerda do quadro, 1 a da direita. */
export type Falante = 0 | 1;

export interface Palavra {
  texto: string;
  ini: number;
  fim: number;
  /** Índice da frase dentro do trecho transcrito. */
  frase: number;
  fimDeFrase: boolean;
  falante: Falante;
}

export interface Corte {
  id: string;
  titulo: string;
  /** Entrada e saída, em segundos do vídeo original. */
  ini: number;
  fim: number;
  nota: number;
  motivo: string;
  gancho: string;
  status: Status;
  /** Transcrição do trecho, com uma frase de contexto antes e depois quando existe. */
  palavras: Palavra[];
}

export interface Video {
  id: string;
  nome: string;
  duracao: number;
  /** Semente da forma de onda: o mesmo vídeo desenha sempre a mesma onda. */
  semente: number;
  cortes: Corte[];
}

export type Filtro = 'todos' | 'pendente' | 'aprovado' | 'exportado';
