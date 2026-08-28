import type { ProjectFormData, ProjectFormErrors } from "../types/project";
import { required } from "./rules";

export function validatePedido(form: ProjectFormData): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  if (form.tipoProjeto === "ASSISTENCIA") {
    if (required(form.numeroSolicitacao, "Nº Solicitação")) errors.numeroSolicitacao = "Obrigatório";
    if (required(form.clienteNome, "Cliente"))              errors.clienteNome       = "Selecione um cliente";
    if (required(form.ambiente, "Ambiente"))                errors.ambiente          = "Obrigatório";
    if (required(form.supervisor, "Supervisor"))            errors.supervisor        = "Obrigatório";
    if (required(form.motivoAssistencia, "Motivo"))         errors.motivoAssistencia = "Descreva o motivo da assistência";
  } else {
    const numOC = form.numOC.trim();
    if (required(form.contrato, "Contrato"))              errors.contrato       = "Obrigatório";
    if (numOC.length < 10 || isNaN(Number(numOC)))       errors.numOC          = "Ordem de compra inválida";
    if (required(form.clienteNome, "Cliente"))            errors.clienteNome    = "Selecione um cliente";
    if (required(form.tipoContrato, "Tipo de contrato"))  errors.tipoContrato   = "Selecione o tipo";
    if (required(form.etapa, "Etapa"))                    errors.etapa          = "Selecione a etapa";
    if (required(form.vendedor, "Vendedor"))              errors.vendedor       = "Selecione um vendedor";
    if (required(form.liberador, "Liberador"))            errors.liberador      = "Selecione um liberador";
    if (required(form.loja, "Loja"))                      errors.loja           = "Selecione uma loja";
    if (required(form.tipoAmbiente, "Tipo de ambiente"))  errors.tipoAmbiente   = "Selecione um tipo";
    if (required(form.ambiente, "Ambiente"))              errors.ambiente       = "Obrigatório";
    if (required(form.dataAssinatura, "Data assinatura")) errors.dataAssinatura = "Data inválida";
    if (required(form.chegouFabrica, "Chegou fábrica"))   errors.chegouFabrica  = "Data inválida";
    if (required(form.dataEntrega, "Data entrega"))       errors.dataEntrega    = "Data inválida";
    if (required(form.valorBruto, "Valor bruto"))         errors.valorBruto     = "Obrigatório";
    if (required(form.valorNegociado, "Valor negociado")) errors.valorNegociado = "Obrigatório";
  }

  return errors;
}
