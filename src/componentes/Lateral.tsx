import { contagens } from '../estado';
import { fmt } from '../tempo';
import type { Video } from '../tipos';
import { Marca } from './Icone';

interface Props {
  videos: Video[];
  atual: string;
  bloqueado: boolean;
  abrir(id: string): void;
}

export function Lateral({ videos, atual, bloqueado, abrir }: Props) {
  return (
    <aside className="lateral">
      <div className="logo">
        <Marca />
        <b>ClipHook</b>
      </div>

      <nav aria-label="Meus vídeos">
        <h2 className="rotulo">
          Meus vídeos <span>{videos.length}</span>
        </h2>
        <ul className="videos">
          {videos.map((v) => {
            const n = contagens(v);
            const aberto = v.id === atual;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={`video ${aberto ? 'gancho' : ''}`}
                  aria-current={aberto ? 'true' : undefined}
                  disabled={bloqueado && !aberto}
                  onClick={() => abrir(v.id)}
                >
                  <span className="miniatura">
                    <span>{fmt(v.duracao)}</span>
                  </span>
                  <span className="video-txt">
                    <b>{v.nome}</b>
                    <small>
                      {v.cortes.length} cortes · {n.aprovado + n.exportado} aprov. · {n.exportado} export.
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="nota-demo">
        Demonstração no navegador. Os vídeos, as falas e as notas são simulados; o app de verdade roda no Windows e analisa os seus arquivos.
      </p>
    </aside>
  );
}
