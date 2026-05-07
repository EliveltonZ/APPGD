import { Input } from "../../../components/Input";
import { FormSection } from "../../../components/FormSection";
import type { SectionProps } from "../../../types/project";

export function FinancialSection({ form, onChange, errors }: SectionProps) {
  return (
    <FormSection step={6} title="Financeiro">
      <div className="frow frow--4">
        <Input
          label="Valor Bruto"
          value={form.valorBruto}
          onChange={(e) => onChange("valorBruto", e.target.value)}
          error={errors?.valorBruto}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor Negociado"
          value={form.valorNegociado}
          onChange={(e) => onChange("valorNegociado", e.target.value)}
          error={errors?.valorNegociado}
          placeholder="R$ 0,00"
          required
        />
        <Input
          label="Custo de Material"
          value={form.custoMaterial}
          onChange={(e) => onChange("custoMaterial", e.target.value)}
          error={errors?.custoMaterial}
          placeholder="R$ 0,00"
        />
        <Input
          label="Custo Adicional"
          value={form.custoAdicional}
          onChange={(e) => onChange("custoAdicional", e.target.value)}
          error={errors?.custoAdicional}
          placeholder="R$ 0,00"
        />
      </div>
    </FormSection>
  );
}
