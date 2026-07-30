import { X } from "lucide-react";
import type { ContractOption } from "../../../../services/project";
import type { SelectOption } from "../../../../components/Select";
import "./index.css";

interface ContractSelectModalProps {
  isOpen: boolean;
  options: ContractOption[];
  lojas: SelectOption[];
  contrato: string;
  onSelect: (option: ContractOption) => void;
  onClose: () => void;
}

export function ContractSelectModal({
  isOpen,
  options,
  lojas,
  contrato,
  onSelect,
  onClose,
}: ContractSelectModalProps) {
  if (!isOpen) return null;

  function lojaLabel(id: string | number | undefined): string {
    if (id == null || id === '' || id === 0) return "—";
    return lojas.find((l) => Number(l.value) === Number(id))?.label ?? `Loja ${id}`;
  }

  return (
    <div className="csm-overlay" onClick={onClose}>
      <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="csm-header">
          <span className="csm-title">
            Contrato {contrato} — Selecione a Loja
          </span>
          <button className="csm-close" onClick={onClose} type="button">
            <X size={14} />
          </button>
        </div>

        <ul className="csm-list">
          {options.map((opt, i) => (
            <li key={i} className="csm-item" onClick={() => onSelect(opt)}>
              <span className="csm-item__loja">
                {lojaLabel(opt.loja)}
              </span>
              <span className="csm-item__cliente">
                {opt.clienteNome || "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
