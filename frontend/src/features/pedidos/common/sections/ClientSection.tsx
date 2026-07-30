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
  optionsTipoCliente?: SelectOption[];
}

export function ClientSection({
  form,
  onChange,
  onOpenModal,
  errors,
  optionsTipoCliente = [],
}: ClientSectionProps) {
  return (
    <FormSection step={2} title="Cliente">
      <div className="client-section__row">
        <Input
          label="ID"
          value={form.clienteId}
          onChange={(e) => onChange("clienteId", e.target.value)}
          placeholder="000"
          maxLength={6}
          error={errors?.clienteId}
        />
        <Input
          label="Nome do Cliente"
          value={form.clienteNome}
          readOnly
          placeholder="—"
          error={errors?.clienteNome}
        />
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
      </div>
      <Select
        label="Tipo de Cliente"
        placeholder="Selecionar..."
        value={String(form.clienteTipo)}
        onChange={(e) => onChange("clienteTipo", e.target.value)}
        options={optionsTipoCliente}
        error={errors?.clienteTipo}
      />
    </FormSection>
  );
}
