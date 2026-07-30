import { Select } from "../../../../components/Select";
import { FormSection } from "../../../../components/FormSection";
import type { SelectOption } from "../../../../components/Select";
import type { SectionProps } from "../../../../types/project";

interface CommercialSectionProps extends SectionProps {
  optionsVendedor?: SelectOption[];
  optionsLiberador?: SelectOption[];
  optionsLoja?: SelectOption[];
}

export function CommercialSection({
  form,
  onChange,
  errors,
  optionsVendedor = [],
  optionsLiberador = [],
  optionsLoja = [],
}: CommercialSectionProps) {
  return (
    <FormSection step={3} title="Informações Comerciais">
      <div className="frow frow--3">
        <Select
          label="Vendedor"
          value={form.vendedor}
          onChange={(e) => onChange("vendedor", e.target.value)}
          options={optionsVendedor}
          error={errors?.vendedor}
        />
        <Select
          label="Liberador"
          value={form.liberador}
          onChange={(e) => onChange("liberador", e.target.value)}
          options={optionsLiberador}
          error={errors?.liberador}
        />
        <Select
          label="Loja"
          value={form.loja}
          onChange={(e) => onChange("loja", e.target.value)}
          options={optionsLoja}
          error={errors?.loja}
        />
      </div>
    </FormSection>
  );
}
