const ValidationError = require('./ValidationError');

// Classe abstrata (template method): centraliza acúmulo de erros e as regras
// reutilizáveis; subclasses de entidade implementam apenas rules().
// Espelha, em forma de classe, as funções puras de frontend/src/validation/rules.ts
// — mesmas mensagens e mesma semântica, para o comportamento não divergir entre as pontas.
class BaseValidator {
  constructor(data) {
    if (new.target === BaseValidator) {
      throw new Error('BaseValidator é abstrata e não pode ser instanciada diretamente');
    }
    this.data = data || {};
    this.errors = {};
  }

  // Subclasses devem sobrescrever com as regras do domínio (podem chamar
  // super.rules() primeiro para herdar validações comuns e depois
  // acrescentar as específicas do tipo — é o ponto de polimorfismo).
  rules() {
    throw new Error(`${this.constructor.name} precisa implementar rules()`);
  }

  addError(field, message) {
    if (message && !this.errors[field]) this.errors[field] = message;
  }

  // ── Regras reutilizáveis ─────────────────────────────────────────────

  required(value, field, label) {
    const invalido =
      value === null || value === undefined ||
      (typeof value === 'string' && !value.trim()) ||
      (typeof value === 'number' && Number.isNaN(value));
    if (invalido) this.addError(field, `${label} é obrigatório`);
    return !invalido;
  }

  minLength(value, min, field, label) {
    if (String(value ?? '').trim().length < min) {
      this.addError(field, `${label} deve ter no mínimo ${min} caractere${min > 1 ? 's' : ''}`);
      return false;
    }
    return true;
  }

  isNumeric(value, field, label) {
    if (!/^\d+$/.test(String(value ?? '').trim())) {
      this.addError(field, `${label} deve conter apenas números`);
      return false;
    }
    return true;
  }

  isPositive(value, field, label) {
    const n = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(n) || n <= 0) {
      this.addError(field, `${label} deve ser maior que zero`);
      return false;
    }
    return true;
  }

  mustMatch(value, reference, field, label) {
    if (value !== reference) {
      this.addError(field, `${label} não confere`);
      return false;
    }
    return true;
  }

  mustDiffer(value, reference, field, label) {
    if (value === reference) {
      this.addError(field, `${label} deve ser diferente do valor atual`);
      return false;
    }
    return true;
  }

  dateNotBefore(dateA, dateB, field, labelA, labelB) {
    if (!dateA || !dateB) return true;
    if (new Date(dateA) < new Date(dateB)) {
      this.addError(field, `${labelA} não pode ser anterior a ${labelB}`);
      return false;
    }
    return true;
  }

  // ── Orquestração (não sobrescrever) ─────────────────────────────────

  validate() {
    this.errors = {};
    this.rules();
    return { valid: Object.keys(this.errors).length === 0, errors: this.errors };
  }

  // Uso típico no service: new FooValidator(dados).throwIfInvalid();
  throwIfInvalid() {
    const result = this.validate();
    if (!result.valid) throw new ValidationError(result.errors);
    return result;
  }
}

module.exports = BaseValidator;
