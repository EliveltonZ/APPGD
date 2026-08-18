import type { ProjectFormData, ProjectFormErrors } from "../../../types/project";
import { validatePedido } from "../../../validation/pedido";

export function validate(form: ProjectFormData): ProjectFormErrors {
  return validatePedido(form);
}
