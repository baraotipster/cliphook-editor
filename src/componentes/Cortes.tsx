import { contagens, filtra } from '../estado';
import { fmt, fmtDuracao } from '../tempo';
import type { Corte, Filtro, Status, Video } from '../tipos';
import { Icone } from './Icone';

export const ROTULO: Record<Status, string> = { pendente: 'Pendente', aprovado: 'Aprovado', recusado: 'Recusado', exportado: 'Exportado' };

interface Props {
  video: Video;
  corteId: string;
  filtro: Filtro;
  bloqueado: boolean;
  filtrar(f: Filtro): void;
  selecionar(c: Corte): void;
  decidir(c: Corte, decisao: 'aprovado' | 'recusado'): void;
}

export function Cortes({ video, corteId, filtro, bloqueado, filtrar, selecionar, decidir }: Props) {
  const n = contagens(video);
  const abas: [Filtro, string, number][] = [
    ['todos', 'Todos', video.cortes.length],
    ['pendente', 'Pendentes', n.pendente],
    ['aprovado', 'Aprovados', n.aprovado],
    ['exportado', 'Exportados', n.exportado],
  ];
  const visiveis = filtra(video.cortes, filtro);

  return (
    <section className="cortes" aria-labelledby="t-cortes">
      <header className="secao-topo">
        <div>
          <h2 id="t-cortes">Cortes encontrados pela IA</h2>
          <p>Cada corte traz o motivo da escolha. Aprove os que você quer publicar.</p>
        </div>
        <div className="abas" role="group" aria-label="Filtrar cortes">
          {abas.map(([f, rotulo, total]) => (
            <button key={f} type="button" aria-pressed={filtro === f} onClick={() => filtrar(f)}>
              {rotulo} <span className="num">{total}</span>
            </button>
          ))}
        </div>
      </header>

      {visiveis.length === 0 ? (
        <p className="vazio">Nenhum corte neste filtro. Volte para "Todos" para ver a lista inteira.</p>
      ) : (
        <ul className="cartoes">
          {visiveis.map((c) => {
            const sel = c.id === corteId;
            return (
              <li key={c.id} className={`cartao st-${c.status} ${sel ? 'gancho cartao-sel' : ''}`}>
                <button type="button" className="cartao-abre" onClick={() => selecionar(c)} aria-pressed={sel}>
                  <span className="cartao-capa">
                    <span className={`selo st-${c.status}`}>{ROTULO[c.status]}</span>
                    <span className="cartao-dur num">{fmtDuracao(c.fim - c.ini)}</span>
                  </span>
                  <span className="cartao-titulo">{c.titulo}</span>
                  <span className="cartao-meta num">
                    <span className="hora">
                      {fmt(c.ini)} → {fmt(c.fim)}
                    </span>
                    <span>Nota {c.nota}</span>
                  </span>
                </button>
                {c.status === 'exportado' ? (
                  <p className="cartao-feito">
                    <Icone nome="ok" tamanho={16} /> Já exportado
                  </p>
                ) : (
                  <div className="cartao-bts">
                    <button type="button" className={`bt ${c.status === 'aprovado' ? 'bt-lima' : ''}`} disabled={bloqueado} aria-pressed={c.status === 'aprovado'} onClick={() => decidir(c, 'aprovado')}>
                      {c.status === 'aprovado' ? 'Aprovado' : 'Aprovar'}
                    </button>
                    <button type="button" className={`bt ${c.status === 'recusado' ? 'bt-perigo' : ''}`} disabled={bloqueado} aria-pressed={c.status === 'recusado'} onClick={() => decidir(c, 'recusado')}>
                      {c.status === 'recusado' ? 'Recusado' : 'Recusar'}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
