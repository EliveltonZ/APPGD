// Erro estruturado por campo, lançado pelos validators (ver BaseValidator).
// Mantém compatibilidade com o padrão já existente em paradasService.js
// (code: 'VALIDACAO' → 400 no errorHandler), acrescentando o mapa `errors`
// por campo para o frontend jogar direto em setErrors() sem tradução.
class ValidationError extends Error {
  constructor(errors) {
    super('Dados inválidos');
    this.name = 'ValidationError';
    this.code = 'VALIDACAO';
    this.status = 400;
    this.errors = errors;
  }
}

module.exports = ValidationError;
