import type { Relogio } from '../relogio';
import { useTempo, useTocando } from '../relogio';
import { fmt } from '../tempo';
import type { Corte, Video } from '../tipos';
import { Icone } from './Icone';
import { Quadro } from './Quadro';

interface Props {
  video: Video;
  corte: Corte;
  relogio: Relogio;
  repetir: boolean;
  alternarRepetir(): void;
  irParaCorte(deslocamento: -1 | 1): void;
}

export function Player({ video, corte, relogio, repetir, alternarRepetir, irParaCorte }: Props) {
  const tocando = useTocando(relogio);

  return (
    <section className="player" aria-label="Vídeo original">
      <Quadro video={video} relogio={relogio} formato="16:9" />
      <div className="controles">
        <button type="button" className="ic" onClick={() => irParaCorte(-1)} aria-label="Corte anterior" title="Corte anterior">
          <Icone nome="anterior" />
        </button>
        <button type="button" className="ic" onClick={() => relogio.ir(relogio.tempo() - 5)} aria-label="Voltar 5 segundos" title="Voltar 5 segundos">
          <Icone nome="volta" />
        </button>
        <button
          type="button"
          className="ic ic-play"
          onClick={() => (tocando ? relogio.pausar() : relogio.tocar())}
          aria-label={tocando ? 'Pausar' : 'Reproduzir'}
          title={tocando ? 'Pausar (espaço)' : 'Reproduzir (espaço)'}
        >
          <Icone nome={tocando ? 'pausa' : 'play'} tamanho={22} />
        </button>
        <button type="button" className="ic" onClick={() => relogio.ir(relogio.tempo() + 5)} aria-label="Avançar 5 segundos" title="Avançar 5 segundos">
          <Icone nome="avanca" />
        </button>
        <button type="button" className="ic" onClick={() => irParaCorte(1)} aria-label="Próximo corte" title="Próximo corte">
          <Icone nome="proximo" />
        </button>

        <Barra video={video} corte={corte} relogio={relogio} />

        <button type="button" className={`ic ${repetir ? 'ligado' : ''}`} onClick={alternarRepetir} aria-pressed={repetir} aria-label="Repetir o corte selecionado" title="Repetir o corte selecionado">
          <Icone nome="repetir" />
        </button>
      </div>
    </section>
  );
}

/* Tempo e barra de busca. Só este pedaço redesenha a cada quadro. A faixa laranja
   marca onde o corte selecionado fica dentro do vídeo. */
function Barra({ video, corte, relogio }: { video: Video; corte: Corte; relogio: Relogio }) {
  const t = useTempo(relogio);
  const pct = (v: number) => `${(v / video.duracao) * 100}%`;

  return (
    <>
      <span className="relogio num">
        {fmt(t)} <span>/ {fmt(video.duracao)}</span>
      </span>
      <span className="busca">
        <span className="busca-corte" style={{ left: pct(corte.ini), width: pct(corte.fim - corte.ini) }} />
        <input
          type="range"
          min={0}
          max={video.duracao}
          step={0.1}
          value={t}
          onChange={(e) => relogio.ir(Number(e.target.value))}
          aria-label="Posição no vídeo"
          aria-valuetext={`${fmt(t)} de ${fmt(video.duracao)}`}
        />
      </span>
    </>
  );
}
