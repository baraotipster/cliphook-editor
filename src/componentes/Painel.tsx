import type { Acao } from '../estado';
import type { Relogio } from '../relogio';
import { useTempo } from '../relogio';
import { fmt, fmtDecimo, fmtDuracao } from '../tempo';
import type { Corte, Video } from '../tipos';
import { ROTULO } from './Cortes';
import { Quadro } from './Quadro';

interface Props {
  video: Video;
  corte: Corte;
  relogio: Relogio;
  bloqueado: boolean;
  despacha(a: Acao): void;
}

/* O painel do corte selecionado: título, prévia vertical, decisão, motivo da IA,
   transcrição e ajuste fino das pontas. */
export function Painel({ video, corte, relogio, bloqueado, despacha }: Props) {
  const posicao = video.cortes.findIndex((c) => c.id === corte.id) + 1;
  const exportado = corte.status === 'exportado';

  const assistir = () => {
    relogio.ir(corte.ini);
    relogio.tocar();
  };

  return (
    <aside className="painel" aria-label={`Corte ${posicao} de ${video.cortes.length}`}>
      <header className="painel-topo">
        <span className="rotulo">
          Corte {posicao} de {video.cortes.length} · <span className={`txt-${corte.status}`}>{ROTULO[corte.status]}</span>
        </span>
        <span className="nota" title="Uma estimativa da IA para comparar os cortes entre si. Não é previsão de alcance nem garantia de views.">
          Potencial de viralizar <b className="num">{corte.nota}</b> / 100
        </span>
      </header>

      <div className="campo-titulo">
        <label htmlFor="titulo">Título do corte</label>
        <div>
          <textarea id="titulo" rows={2} value={corte.titulo} disabled={exportado} onChange={(e) => despacha({ tipo: 'titulo', corteId: corte.id, titulo: e.target.value })} />
          <button type="button" className="bt bt-peq" disabled={exportado} title="Passar o título para maiúsculas" onClick={() => despacha({ tipo: 'titulo', corteId: corte.id, titulo: corte.titulo.toUpperCase() })}>
            AA
          </button>
        </div>
      </div>

      <div className="previa">
        <div className="gancho previa-quadro">
          <Quadro video={video} relogio={relogio} formato="9:16" />
        </div>
        <div className="previa-lado">
          <p className="hora num">
            {fmt(corte.ini)} → {fmt(corte.fim)} · {fmtDuracao(corte.fim - corte.ini)}
          </p>
          <p className="segue">Enquadramento vertical seguindo quem fala.</p>
          <button type="button" className="bt" onClick={assistir}>
            Assistir prévia
          </button>
          <button type="button" className="bt" onClick={() => relogio.ir(corte.ini)}>
            Do início
          </button>
          {exportado ? (
            <p className="painel-feito">Este corte já foi exportado.</p>
          ) : (
            <>
              <button type="button" className={`bt bt-grande ${corte.status === 'aprovado' ? 'bt-lima' : 'bt-lima-vazio'}`} disabled={bloqueado} aria-pressed={corte.status === 'aprovado'} onClick={() => despacha({ tipo: 'decidir', corteId: corte.id, decisao: 'aprovado' })}>
                {corte.status === 'aprovado' ? 'Aprovado' : 'Aprovar corte'}
              </button>
              <button type="button" className={`bt ${corte.status === 'recusado' ? 'bt-perigo' : ''}`} disabled={bloqueado} aria-pressed={corte.status === 'recusado'} onClick={() => despacha({ tipo: 'decidir', corteId: corte.id, decisao: 'recusado' })}>
                {corte.status === 'recusado' ? 'Recusado' : 'Recusar'}
              </button>
            </>
          )}
        </div>
      </div>

      <section className="bloco">
        <h3>Por que a IA escolheu</h3>
        <p>{corte.motivo}</p>
        <p className="gancho-sugerido">
          <span className="rotulo">Gancho sugerido</span>
          {corte.gancho}
        </p>
      </section>

      <section className="bloco">
        <h3>Transcrição do corte</h3>
        <Transcricao corte={corte} relogio={relogio} />
      </section>

      <section className="bloco">
        <h3>Ajuste fino do trecho</h3>
        <Ajuste rotulo="Início" valor={corte.ini} desligado={exportado || bloqueado} mexer={(d) => despacha({ tipo: 'ajustar', corteId: corte.id, ponta: 'ini', delta: d })} />
        <Ajuste rotulo="Fim" valor={corte.fim} desligado={exportado || bloqueado} mexer={(d) => despacha({ tipo: 'ajustar', corteId: corte.id, ponta: 'fim', delta: d })} />
        <button type="button" className="bt" disabled={exportado || bloqueado} onClick={() => despacha({ tipo: 'ajustarAFrase', corteId: corte.id })}>
          Ajustar à frase
        </button>
      </section>
    </aside>
  );
}

/* Cada palavra leva ao seu instante no vídeo. A palavra dita agora fica em verde-limão;
   as que estão fora do corte (contexto) ficam apagadas. */
function Transcricao({ corte, relogio }: { corte: Corte; relogio: Relogio }) {
  const t = useTempo(relogio);
  return (
    <p className="transcricao">
      {corte.palavras.map((p) => {
        const fora = p.fim <= corte.ini || p.ini >= corte.fim;
        const dita = t >= p.ini && t < p.fim + 0.04;
        return (
          <button key={p.ini} type="button" tabIndex={-1} className={`${fora ? 'fora' : ''} ${dita ? 'dita' : ''}`} onClick={() => relogio.ir(p.ini)}>
            {p.texto}
          </button>
        );
      })}
    </p>
  );
}

function Ajuste({ rotulo, valor, desligado, mexer }: { rotulo: string; valor: number; desligado: boolean; mexer(delta: number): void }) {
  return (
    <div className="ajuste">
      <span>{rotulo}</span>
      <output className="hora num">{fmtDecimo(valor)}</output>
      <button type="button" className="bt bt-peq" disabled={desligado} onClick={() => mexer(-0.1)} aria-label={`${rotulo}: 0,1 segundo antes`}>
        − 0,1 s
      </button>
      <button type="button" className="bt bt-peq" disabled={desligado} onClick={() => mexer(0.1)} aria-label={`${rotulo}: 0,1 segundo depois`}>
        + 0,1 s
      </button>
    </div>
  );
}
