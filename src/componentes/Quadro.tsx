import type { Relogio } from '../relogio';
import { useTempo } from '../relogio';
import { blocoDaLegenda, falaEm } from '../fala';
import type { Video } from '../tipos';

/* O "vídeo" da demonstração: duas pessoas desenhadas em CSS, e quem fala fica em destaque.
   No formato 9:16 a cena inteira desliza para centralizar quem está falando, que é o que
   o app faz de verdade com o enquadramento vertical. */
export function Quadro({ video, relogio, formato }: { video: Video; relogio: Relogio; formato: '16:9' | '9:16' }) {
  const t = useTempo(relogio);
  const fala = falaEm(video, t);
  const bloco = formato === '9:16' ? blocoDaLegenda(fala) : [];
  const vertical = formato === '9:16';

  return (
    <div className={`quadro ${vertical ? 'quadro-v' : 'quadro-h'}`} data-falante={fala.falante}>
      <div className="cena" aria-hidden="true">
        <div className={`pessoa pessoa-0 ${fala.falante === 0 ? 'fala' : ''}`}>
          <i className="cabeca" />
          <i className="tronco" />
        </div>
        <div className={`pessoa pessoa-1 ${fala.falante === 1 ? 'fala' : ''}`}>
          <i className="cabeca" />
          <i className="tronco" />
        </div>
      </div>
      {vertical && bloco.length > 0 && (
        <p className="legenda" aria-hidden="true">
          {bloco.map((p) => (
            <span key={p.ini} className={p === fala.palavra ? 'dita' : ''}>
              {p.texto.replace(/[.,;:!?"]/g, '')}{' '}
            </span>
          ))}
        </p>
      )}
      <span className="quadro-selo">{vertical ? '9:16' : 'Vídeo simulado'}</span>
    </div>
  );
}
