import { Search } from "lucide-react";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { FormSection } from "../../../../components/FormSection";
import { Button } from "../../../../components/Button";
import type { SectionProps } from "../../../../types/project";
import type { SelectOption } from "../../../../components/Select";
import "./ClientSection.css";

interface ClientSectionProps extends SectionProps {
  onOpenModal: () => void;
  readOnly?: boolean;
  optionsTipoCliente?: SelectOption[];
}

export function ClientSection({
  form,
  onChange,
  onOpenModal,
  errors,
  readOnly,
  optionsTipoCliente = [],
}: ClientSectionProps) {
  return (
    <FormSection step={2} title="Cliente">
      <div
        className="client-section__row"
        style={readOnly ? { gridTemplateColumns: "100px 1fr 180px" } : undefined}
      >
        <Input
          label="ID"
          value={form.clienteId}
          onChange={(e) => onChange("clienteId", e.target.value)}
          placeholder="000"
          maxLength={6}
          readOnly={readOnly}
          error={errors?.clienteId}
        />
        <Input
          label="Nome do Cliente"
          value={form.clienteNome}
          readOnly
          placeholder="—"
          error={errors?.clienteNome}
        />
        {!readOnly && (
          <div className="client-section__action">
            <span className="client-section__action-spacer" />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onOpenModal}
            >
              <Search size={14} />
              Buscar
            </Button>
          </div>
        )}
        {readOnly ? (
          <Input label="Tipo de Cliente" value={String(form.clienteTipo)} readOnly />
        ) : (
          <Select
            label="Tipo de Cliente"
            placeholder="Selecionar..."
            value={String(form.clienteTipo)}
            onChange={(e) => onChange("clienteTipo", e.target.value)}
            options={optionsTipoCliente}
            error={errors?.clienteTipo}
          />
        )}
      </div>
    </FormSection>
  );
}
