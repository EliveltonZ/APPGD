import { Select } from "../../../components/Select";
import { FormSection } from "../../../components/FormSection";
import type { SectionProps } from "../../../types/project";
import {
  VENDEDOR_TYPE_OPTIONS,
  LIBERADOR_TYPE_OPTIONS,
  SHOP_TYPE_OPTIONS,
} from "../../../data/projectConfig";

export function CommercialSection({ form, onChange, errors }: SectionProps) {
  return (
    <FormSection step={3} title="Informações Comerciais">
      <div className="frow frow--3">
        <Select
          label="Vendedor"
          value={form.vendedor}
          onChange={(e) => onChange("vendedor", e.target.value)}
          options={VENDEDOR_TYPE_OPTIONS}
          error={errors?.vendedor}
        />

        <Select
          label="Liberador"
          value={form.liberador}
          onChange={(e) => onChange("liberador", e.target.value)}
          options={LIBERADOR_TYPE_OPTIONS}
          error={errors?.liberador}
        />

        <Select
          label="Loja"
          value={form.loja}
          onChange={(e) => onChange("loja", e.target.value)}
          options={SHOP_TYPE_OPTIONS}
          error={errors?.loja}
        />
      </div>
    </FormSection>
  );
}
