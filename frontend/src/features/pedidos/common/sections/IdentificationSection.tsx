import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { FormSection } from "../../../../components/FormSection";
import type { SelectOption } from "../../../../components/Select";
import type { SectionProps } from "../../../../types/project";

function maskNumeroProjeto(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

interface IdentificationSectionProps extends SectionProps {
  mode?: "novo" | "editar" | "excluir";
  onContractBlur?: () => void;
  onNumOCBlur?: () => void;
  onNumOCDoubleClick?: () => void;
  loadingContract?: boolean;
  loadingProject?: boolean;
  optionsTipoContrato?: SelectOption[];
  optionsEtapa?: SelectOption[];
}

export function IdentificationSection({
  form,
  onChange,
  errors,
  mode = "novo",
  onContractBlur,
  onNumOCBlur,
  onNumOCDoubleClick,
  loadingContract,
  loadingProject,
  optionsTipoContrato = [],
  optionsEtapa = [],
}: IdentificationSectionProps) {
  const isNovo = mode === "novo";
  const readOnly = mode === "excluir";

  const numOCInput = (
    <Input
      label="Num. OC"
      value={form.numOC}
      onChange={(e) => onChange("numOC", e.target.value)}
      onBlur={onNumOCBlur}
      onDoubleClick={isNovo ? onNumOCDoubleClick : undefined}
      disabled={loadingContract || loadingProject}
      error={errors?.numOC}
      placeholder="Ex: 1234567890"
    />
  );

  const contratoInput = (
    <Input
      label="Contrato"
      value={form.contrato}
      onChange={(e) => onChange("contrato", e.target.value)}
      onBlur={isNovo ? onContractBlur : undefined}
      disabled={isNovo ? loadingContract : undefined}
      readOnly={readOnly}
      error={errors?.contrato}
      placeholder="Digite contrato"
    />
  );

  const numProjetoInput = (
    <Input
      label="N° Projeto"
      value={form.numeroProjeto}
      onChange={(e) =>
        onChange(
          "numeroProjeto",
          isNovo ? maskNumeroProjeto(e.target.value) : e.target.value,
        )
      }
      readOnly={readOnly}
      error={errors?.numeroProjeto}
      placeholder="Ex: 01/01"
    />
  );

  const tipoContratoField = readOnly ? (
    <Input label="Tipo do Contrato" value={String(form.tipoContrato)} readOnly />
  ) : (
    <Select
      label="Tipo do Contrato"
      value={String(form.tipoContrato)}
      onChange={(e) => onChange("tipoContrato", e.target.value)}
      options={optionsTipoContrato}
      error={errors?.tipoContrato}
    />
  );

  const etapaField = readOnly ? (
    <Input label="Etapa" value={String(form.etapa)} readOnly />
  ) : (
    <Select
      label="Etapa"
      value={String(form.etapa)}
      onChange={(e) => onChange("etapa", e.target.value)}
      options={optionsEtapa}
      error={errors?.etapa}
    />
  );

  return (
    <FormSection step={1} title="Identificação do Projeto">
      {isNovo ? (
        <div className="frow frow--5">
          {contratoInput}
          {numOCInput}
          {numProjetoInput}
          {tipoContratoField}
          {etapaField}
        </div>
      ) : (
        <>
          <div className="frow frow--3">
            {numOCInput}
            {contratoInput}
            {numProjetoInput}
          </div>
          <div className="frow frow--2">
            {tipoContratoField}
            {etapaField}
          </div>
        </>
      )}
    </FormSection>
  );
}
