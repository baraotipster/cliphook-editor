import { useEffect, useMemo, useRef, useState } from 'react';
import { picos } from '../dados';
import type { Relogio } from '../relogio';
import { fmt } from '../tempo';
import type { Corte, Video } from '../tipos';

const BARRAS = 420;
const COR = { fora: '#3a3f4b', corte: 'rgba(245,245,240,.42)', selecionado: 'rgba(245,245,240,.9)' };

interface Props {
  video: Video;
  corteId: string;
  relogio: Relogio;
  selecionar(c: Corte): void;
}

export function LinhaDoTempo({ video, corteId, relogio, selecionar }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const tela = useRef<HTMLCanvasElement>(null);
  const agulha = useRef<HTMLSpanElement>(null);
  const [dica, setDica] = useState<{ x: number; t: number } | null>(null);
  const onda = useMemo(() => picos(video.semente, BARRAS), [video.semente]);

  /* A onda só é redesenhada quando muda o vídeo, um corte ou o tamanho da caixa. */
  useEffect(() => {
    const cv = tela.current;
    const cx = caixa.current;
    if (!cv || !cx) return;

    const desenha = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cx.clientWidth;
      const H = cx.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      const g = cv.getContext('2d');
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      const passo = W / BARRAS;
      const largura = Math.max(1, passo * 0.62);
      onda.forEach((v, i) => {
        const t = ((i + 0.5) / BARRAS) * video.duracao;
        const dentro = video.cortes.find((c) => t >= c.ini && t <= c.fim);
        g.fillStyle = !dentro ? COR.fora : dentro.id === corteId ? COR.selecionado : COR.corte;
        const h = Math.max(2, v * (H - 14));
        g.fillRect(i * passo, (H - h) / 2, largura, h);
      });
    };

    desenha();
    const ro = new ResizeObserver(desenha);
    ro.observe(cx);
    return () => ro.disconnect();
  }, [onda, video, corteId]);

  /* A agulha anda sem passar pelo React: mexe direto no estilo a cada quadro. */
  useEffect(() => {
    const move = () => {
      if (agulha.current) agulha.current.style.left = `${(relogio.tempo() / video.duracao) * 100}%`;
    };
    move();
    return relogio.assinar(move);
  }, [relogio, video.duracao]);

  const tempoEm = (clientX: number) => {
    const r = caixa.current!.getBoundingClientRect();
    return { x: clientX - r.left, t: Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * video.duracao };
  };

  /* Um corte de 40 s num vídeo de 58 min teria 4 px de largura. O marcador ganha uma
     largura mínima para continuar clicável, sem mudar o trecho real desenhado na onda. */
  const pct = (v: number) => (v / video.duracao) * 100;

  return (
    <section className="linha" aria-labelledby="t-linha">
      <header className="secao-topo">
        <h2 id="t-linha">Linha do tempo</h2>
        <ul className="legenda-status" aria-label="Legenda">
          <li className="st-pendente">Pendente</li>
          <li className="st-aprovado">Aprovado</li>
          <li className="st-recusado">Recusado</li>
          <li className="st-exportado">Exportado</li>
        </ul>
      </header>

      <div
        className="onda"
        ref={caixa}
        onPointerMove={(e) => setDica(tempoEm(e.clientX))}
        onPointerLeave={() => setDica(null)}
        onClick={(e) => relogio.ir(tempoEm(e.clientX).t)}
      >
        <canvas ref={tela} aria-hidden="true" />
        {video.cortes.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`marca st-${c.status} ${c.id === corteId ? 'marca-sel' : ''}`}
            style={{ left: `${pct((c.ini + c.fim) / 2)}%`, width: `max(22px, ${pct(c.fim - c.ini)}%)` }}
            aria-label={`Corte ${i + 1}: ${c.titulo}, de ${fmt(c.ini)} a ${fmt(c.fim)}, ${c.status}`}
            aria-pressed={c.id === corteId}
            onClick={(e) => {
              e.stopPropagation();
              selecionar(c);
            }}
          >
            <i />
          </button>
        ))}
        <span className="agulha" ref={agulha} aria-hidden="true" />
        {dica && (
          <span className="dica num" style={{ left: dica.x }} aria-hidden="true">
            {fmt(dica.t)}
          </span>
        )}
      </div>

      <div className="regua num" aria-hidden="true">
        <span>0:00</span>
        <span>{fmt(video.duracao / 2)}</span>
        <span>{fmt(video.duracao)}</span>
      </div>
    </section>
  );
}
