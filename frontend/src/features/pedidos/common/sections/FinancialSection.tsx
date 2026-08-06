import { Input } from "../../../../components/Input";
import { FormSection } from "../../../../components/FormSection";
import { formatCurrencyInput } from "../../../../utils/currencyUtils";
import type { SectionProps } from "../../../../types/project";

export function FinancialSection({ form, onChange, errors, readOnly }: SectionProps & { readOnly?: boolean }) {
  function handleCurrency(field: Parameters<typeof onChange>[0], raw: string) {
    onChange(field, formatCurrencyInput(raw));
  }

  return (
    <FormSection step={6} title="Financeiro">
      <div className="frow frow--4">
        <Input
          label="Valor Bruto"
          value={form.valorBruto}
          onChange={(e) => handleCurrency("valorBruto", e.target.value)}
          readOnly={readOnly}
          error={errors?.valorBruto}
          placeholder="R$ 0,00"
        />
        <Input
          label="Valor Negociado"
          value={form.valorNegociado}
          onChange={(e) => handleCurrency("valorNegociado", e.target.value)}
          readOnly={readOnly}
          error={errors?.valorNegociado}
          placeholder="R$ 0,00"
          required
        />
        <Input
          label="Custo de Material"
          value={form.custoMaterial}
          onChange={(e) => handleCurrency("custoMaterial", e.target.value)}
          readOnly={readOnly}
          error={errors?.custoMaterial}
          placeholder="R$ 0,00"
        />
        <Input
          label="Custo Adicional"
          value={form.custoAdicional}
          onChange={(e) => handleCurrency("custoAdicional", e.target.value)}
          readOnly={readOnly}
          error={errors?.custoAdicional}
          placeholder="R$ 0,00"
        />
      </div>
    </FormSection>
  );
}
