import type { CapaData } from "../capaData";
import { EtapaRow } from "./EtapaRow";

const ETAPAS: Array<{ label: string; key: keyof NonNullable<CapaData["etapas"]> }> = [
  { label: "CORTE:",          key: "corte" },
  { label: "CUSTOMIZACÃO:",   key: "customizacao" },
  { label: "COLADEIRA:",      key: "coladeira" },
  { label: "USINAGEM:",       key: "usinagem" },
  { label: "MONTAGEM:",       key: "montagem" },
  { label: "PAINEIS:",        key: "paineis" },
  { label: "EMBALAGEM:",      key: "embalagem" },
  { label: "ACAB. ESPECIAIS:", key: "acabamento" },
];

export function EtapasSection({
  etapas,
  filled = false,
}: {
  etapas?: CapaData["etapas"];
  filled?: boolean;
}) {
  const et = etapas ?? {};
  return (
    <>
      <div className="cp-row" style={{ height: 26, marginTop: 8 }}>
        <div className="cp-cell cp-no-r cp-center cp-bg-blue" style={{ width: 122.766 }}>
          <label className="cp-label cp-bold">ETAPAS:</label>
        </div>
        <div className="cp-cell cp-no-r cp-center cp-bg-blue" style={{ width: 170 }}>
          <label className="cp-label cp-bold">INICIO:</label>
        </div>
        <div className="cp-cell cp-no-r cp-center cp-bg-blue" style={{ width: 170 }}>
          <label className="cp-label cp-bold">FIM:</label>
        </div>
        <div className="cp-cell cp-no-r cp-center cp-bg-blue" style={{ width: 170 }}>
          <label className="cp-label cp-bold">RESPONSAVEL:</label>
        </div>
        <div className="cp-cell cp-center cp-bg-blue" style={{ flex: 1, minWidth: 60 }}>
          <label className="cp-label cp-bold">PAUSA:</label>
        </div>
      </div>
      {ETAPAS.map(({ label, key }) => (
        <EtapaRow key={key} label={label} etapa={et[key]} filled={filled} />
      ))}
    </>
  );
}
