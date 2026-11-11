import { useEffect, useMemo, useReducer } from 'react';
import { Cortes } from './componentes/Cortes';
import { Lateral } from './componentes/Lateral';
import { LinhaDoTempo } from './componentes/LinhaDoTempo';
import { Painel } from './componentes/Painel';
import { Player } from './componentes/Player';
import { videosIniciais } from './dados';
import { contagens, corteAtual, estadoInicial, redutor, videoAtual } from './estado';
import { criaRelogio } from './relogio';
import { fmt } from './tempo';
import type { Corte } from './tipos';

const REPO = 'https://github.com/baraotipster/cliphook-editor';

export function App() {
  const [estado, despacha] = useReducer(redutor, undefined, () => estadoInicial(videosIniciais()));
  const relogio = useMemo(criaRelogio, []);
  const video = videoAtual(estado);
  const corte = corteAtual(estado);
  const n = contagens(video);
  const exportando = estado.exportando;

  /* O relógio precisa saber a duração do vídeo e o trecho a repetir. */
  useEffect(() => {
    relogio.configurar(video.duracao, estado.repetir ? [corte.ini, corte.fim] : null);
  }, [relogio, video.duracao, estado.repetir, corte.ini, corte.fim]);

  /* Ao abrir um vídeo, a reprodução para no começo do primeiro corte. */
  useEffect(() => {
    relogio.pausar();
    relogio.ir(video.cortes[0].ini);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relogio, video.id]);

  const selecionar = (c: Corte) => {
    despacha({ tipo: 'selecionarCorte', corteId: c.id });
    relogio.ir(c.ini);
  };

  const irParaCorte = (deslocamento: -1 | 1) => {
    const i = video.cortes.findIndex((c) => c.id === corte.id);
    const alvo = video.cortes[i + deslocamento];
    if (alvo) selecionar(alvo);
  };

  /* Exportação simulada: um corte aprovado por vez, com um intervalo entre eles. */
  useEffect(() => {
    if (!exportando) return;
    const proximo = video.cortes.find((c) => c.status === 'aprovado');
    const id = window.setTimeout(
      () => despacha(proximo ? { tipo: 'exportarPasso', corteId: proximo.id } : { tipo: 'exportarFim' }),
      proximo ? 900 : 350,
    );
    return () => window.clearTimeout(id);
  }, [exportando, video.cortes]);

  useEffect(() => {
    if (!estado.aviso) return;
    const id = window.setTimeout(() => despacha({ tipo: 'fecharAviso' }), 6000);
    return () => window.clearTimeout(id);
  }, [estado.aviso]);

  /* Atalhos de teclado, fora de campos de texto e de botões em foco. */
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest('input, textarea, button, a, select') || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === ' ') relogio.tocando() ? relogio.pausar() : relogio.tocar();
      else if (k === 'arrowleft') relogio.ir(relogio.tempo() - 5);
      else if (k === 'arrowright') relogio.ir(relogio.tempo() + 5);
      else if (k === 'j') irParaCorte(-1);
      else if (k === 'k') irParaCorte(1);
      else if (k === 'a') despacha({ tipo: 'decidir', corteId: corte.id, decisao: 'aprovado' });
      else if (k === 'r') despacha({ tipo: 'decidir', corteId: corte.id, decisao: 'recusado' });
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const rotuloExportar = exportando
    ? `Exportando ${Math.min(exportando.feitos + 1, exportando.total)} de ${exportando.total}…`
    : n.aprovado === 0
      ? 'Aprove cortes para exportar'
      : `Exportar ${n.aprovado} ${n.aprovado === 1 ? 'corte' : 'cortes'}`;

  return (
    <div className="app">
      <Lateral videos={estado.videos} atual={video.id} bloqueado={!!exportando} abrir={(id) => despacha({ tipo: 'abrirVideo', videoId: id })} />

      <div className="principal">
        <p className="faixa">
          <a href="https://ricardochiarini.com/cliphook">← Caso ClipHook no portfólio de Ricardo Chiarini</a>
          <a href={REPO} target="_blank" rel="noopener">
            Ver código (React + TypeScript)<span className="sr"> (abre em nova aba)</span>
          </a>
        </p>

        <header className="topo">
          <div>
            <h1>{video.nome}</h1>
            <p className="num">
              Vídeo de {fmt(video.duracao)} · {video.cortes.length} cortes encontrados pela IA · {n.aprovado + n.exportado} aprovados · {n.exportado} exportados
            </p>
          </div>
          <button type="button" className="bt bt-lima bt-exportar" disabled={n.aprovado === 0 || !!exportando} onClick={() => despacha({ tipo: 'exportarInicio' })}>
            {rotuloExportar}
            {exportando && <i style={{ width: `${(exportando.feitos / exportando.total) * 100}%` }} />}
          </button>
        </header>

        <div className="editor">
          <main className="coluna">
            <Player video={video} corte={corte} relogio={relogio} repetir={estado.repetir} alternarRepetir={() => despacha({ tipo: 'repetir' })} irParaCorte={irParaCorte} />
            <LinhaDoTempo video={video} corteId={corte.id} relogio={relogio} selecionar={selecionar} />
            <Cortes
              video={video}
              corteId={corte.id}
              filtro={estado.filtro}
              bloqueado={!!exportando}
              filtrar={(f) => despacha({ tipo: 'filtro', filtro: f })}
              selecionar={selecionar}
              decidir={(c, decisao) => despacha({ tipo: 'decidir', corteId: c.id, decisao })}
            />
            <p className="atalhos">
              <kbd>Espaço</kbd> reproduz · <kbd>←</kbd> <kbd>→</kbd> 5 s · <kbd>J</kbd> <kbd>K</kbd> troca de corte · <kbd>A</kbd> aprova · <kbd>R</kbd> recusa
            </p>
          </main>
          <Painel key={corte.id} video={video} corte={corte} relogio={relogio} bloqueado={!!exportando} despacha={despacha} />
        </div>
      </div>

      <div className="avisos" role="status" aria-live="polite">
        {estado.aviso && (
          <p className="aviso">
            <b>{estado.aviso}</b>
            <span>Simulação: nenhum arquivo foi gerado.</span>
            <button type="button" onClick={() => despacha({ tipo: 'fecharAviso' })} aria-label="Fechar aviso">
              ×
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
