import type { CapaData } from "../capaData";
import { ExpRow } from "../shared/ExpRow";

const EXP_LABELS = [
  { label: "ACESSÓRIOS AVULSOS", key: "avulso" },
  { label: "PAINEIS",             key: "paineis" },
  { label: "PORTAS DE ALUMÍNIO",  key: "portaAluminio" },
  { label: "VIDROS / ESPELHOS",   key: "vidros" },
  { label: "PEÇAS C/ PINTURA",    key: "pecasPintadas" },
  { label: "TAPEÇARIAS",          key: "tapecaria" },
  { label: "SERRALHERIA",         key: "serralheria" },
  { label: "CABIDES",             key: "cabide" },
  { label: "TRILHOS",             key: "trilho" },
] as const;

export function ExpedicaoSection({ data }: { data: CapaData }) {
  const ex = data.expedicao ?? {};

  return (
    <div>
      <div className="cp-title cp-bg-red cp-cell">EXPEDIÇÃO</div>

      <div className="cp-row" style={{ height: 26 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 233 }}>
          <label className="cp-label cp-bold cp-font-8">VOLUMES DE MODULAÇÃO / PEÇAS:</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 110 }}>
          <label className="cp-label">{ex.modulos?.qtd ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 42 }}>
          <label className="cp-label cp-font-10">BOX:</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 55 }}>
          <label className="cp-label">{ex.modulos?.box ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-blue" style={{ width: 120 }}>
          <label className="cp-label cp-font-10">CONFERIDO POR:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }} />
      </div>

      {EXP_LABELS.map(({ label, key }) => (
        <ExpRow key={key} label={label} item={ex[key]} filled />
      ))}

      <div className="cp-row" style={{ height: 26 }}>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-red" style={{ width: 114 }}>
          <label className="cp-label cp-font-10">TOTAL VOLUMES</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center" style={{ width: 60 }}>
          <label className="cp-label">{data.totalVolumes ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-red" style={{ width: 130 }}>
          <label className="cp-label cp-font-10">PRONTO P/ ENTREGA</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t" style={{ width: 136, paddingLeft: 2 }}>
          <label className="cp-label cp-font-6">DATA:</label>
        </div>
        <div className="cp-cell cp-no-r cp-no-t cp-center cp-bg-red" style={{ width: 120 }}>
          <label className="cp-label cp-font-10">CONFERIDO POR:</label>
        </div>
        <div className="cp-cell cp-no-t cp-center" style={{ flex: 1 }}>
          <label className="cp-label">{data.conferido ?? ""}</label>
        </div>
      </div>

      <div className="cp-row" style={{ height: 26, marginTop: 8 }}>
        <div className="cp-cell cp-no-r cp-center cp-bg-green" style={{ width: 114.766 }}>
          <label className="cp-label cp-bold cp-font">SAIDA P/ ENTREGA</label>
        </div>
        <div className="cp-cell cp-no-r" style={{ flex: 1, paddingLeft: 4 }}>
          <label className="cp-label">{data.entrega ?? ""}</label>
        </div>
        <div className="cp-cell cp-no-r cp-center cp-bg-green" style={{ width: 153 }}>
          <label className="cp-label cp-bold cp-font">MOTORISTA RESPONSAVEL</label>
        </div>
        <div className="cp-cell cp-center" style={{ width: 203 }}>
          <label className="cp-label">{data.motorista ?? ""}</label>
        </div>
      </div>
    </div>
  );
}
