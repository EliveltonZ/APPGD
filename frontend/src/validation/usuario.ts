import { required, minLength, mustMatch, mustDiffer } from "./rules";
import type { ValidationResult } from "./types";
import { makeResult } from "./types";

export interface CriarUsuarioForm {
  login: string;
  setor: string;
  local: string;
  senha: string;
  confirmSenha: string;
}

export interface AlterarSenhaForm {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export function validateCriarUsuario(form: CriarUsuarioForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("login",        required(form.login,  "Login"));
  e("setor",        required(form.setor,  "Setor"));
  e("local",        required(form.local,  "Local"));
  e("senha",        required(form.senha,  "Senha"));
  if (!errors.senha)
    e("senha",      minLength(form.senha, 6, "Senha"));
  e("confirmSenha", required(form.confirmSenha, "Confirmação de senha"));
  if (!errors.confirmSenha)
    e("confirmSenha", mustMatch(form.confirmSenha, form.senha, "Confirmação de senha"));

  return makeResult(errors);
}

export function validateAlterarSenha(form: AlterarSenhaForm): ValidationResult {
  const errors: Record<string, string> = {};
  const e = (f: string, msg: string | null) => { if (msg) errors[f] = msg; };

  e("senhaAtual",      required(form.senhaAtual,      "Senha atual"));
  e("novaSenha",       required(form.novaSenha,       "Nova senha"));
  if (!errors.novaSenha)
    e("novaSenha",     minLength(form.novaSenha, 6,   "Nova senha"));
  if (!errors.novaSenha)
    e("novaSenha",     mustDiffer(form.novaSenha, form.senhaAtual, "Nova senha"));
  e("confirmarSenha",  required(form.confirmarSenha,  "Confirmação"));
  if (!errors.confirmarSenha)
    e("confirmarSenha",mustMatch(form.confirmarSenha, form.novaSenha, "Confirmação"));

  return makeResult(errors);
}
