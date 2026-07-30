import type { ProjectFormData, ProjectFormErrors } from "../../../types/project";

export function validate(form: ProjectFormData): ProjectFormErrors {
  const numOC = form.numOC.trim();
  const errors: ProjectFormErrors = {};
  if (!form.contrato.trim()) errors.contrato = "Obrigatório";
  if (numOC.length < 10 || isNaN(Number(numOC)))
    errors.numOC = "Ordem de compra invalida";
  if (!form.clienteNome) errors.clienteNome = "Selecione um cliente";
  if (!form.tipoContrato) errors.tipoContrato = "Selecione o tipo";
  if (!form.etapa) errors.etapa = "Selecione a etapa";
  if (!form.vendedor) errors.vendedor = "Selecione um vendedor";
  if (!form.liberador) errors.liberador = "Selecione um liberador";
  if (!form.loja) errors.loja = "Selecione uma loja";
  if (!form.tipoAmbiente) errors.tipoAmbiente = "Selecione um tipo";
  if (!form.ambiente) errors.ambiente = "Obrigatório";
  if (!form.dataAssinatura) errors.dataAssinatura = "Data Invalida";
  if (!form.chegouFabrica) errors.chegouFabrica = "Data Invalida";
  if (!form.dataEntrega) errors.dataEntrega = "Data Invalida";
  if (!form.valorBruto) errors.valorBruto = "Obrigatório";
  if (!form.valorNegociado) errors.valorNegociado = "Obrigatório";
  return errors;
}
