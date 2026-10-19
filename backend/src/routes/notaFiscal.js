'use strict';

const router = require('express').Router();
const repo   = require('../repositories/notaFiscalRepository');
const codigoNFRepo = require('../repositories/materiaisCodigoNFRepository');
const nfeMatchService = require('../services/nfeMatchService');

// Permissões reais da feature de estoque ainda não foram desenhadas (mesma
// decisão já tomada pra /estoque — ver comentário lá). Por enquanto, liberado
// pra qualquer usuário autenticado (o middleware `auth` global já exige
// token válido antes de chegar aqui).

// Mesmo contrato do errorHandler.js global (status, mensagem, e `errors`
// por campo quando for um ValidationError) — replicado aqui porque esta
// rota não usa next(err)/o middleware global, e sim responde direto.
// Antes disso, erros sem status explícito caíam num regex sobre o texto
// da mensagem pra "adivinhar" se era validação (422) ou erro interno
// (500) — trocado por status explícito em cada throw (ver
// notaFiscalRepository.js / nfeXmlParser.js), nunca mais inferido.
function handler(fn) {
  return async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Esta nota já foi lançada.' });
      }
      const status = err.status || 500;
      const message = status < 500 ? (err.message || 'Erro.') : 'Erro interno no servidor.';
      const body = { error: message };
      if (err.errors) body.errors = err.errors;
      res.status(status).json(body);
    }
  };
}

router.get('/',          handler(() => repo.listar()));
router.get('/:id/itens', handler((req) => repo.buscarItens(req.params.id)));
router.post('/',         handler((req) => repo.criar(req.body, req.user?.sub)));

// Lê um XML de NF-e (chave, fornecedor, itens) e tenta casar fornecedor
// (por CNPJ) e cada item (por vínculo já salvo) — nada é gravado aqui, só
// prévia pra tela montar o rascunho.
router.post('/xml/preview', handler((req) => nfeMatchService.preview(req.body.xml)));

// Vínculo código interno ↔ fornecedor — usado pra auto-preencher o item ao
// escolher material+fornecedor no lançamento da nota.
router.get('/vinculo/:materialId/:fornecedorId', handler((req) =>
  codigoNFRepo.buscarVinculo(Number(req.params.materialId), Number(req.params.fornecedorId))));

// Consulta e correção de vínculos já salvos — pra quando o time vincula um
// item errado durante o lançamento e precisa achar e corrigir depois.
router.get('/vinculos', handler(() => codigoNFRepo.listarTodos()));
router.put('/vinculos/:id', handler(async (req) => {
  const atualizado = await codigoNFRepo.atualizarVinculo(Number(req.params.id), {
    materialId: req.body.material_id,
    unidadeCompra: req.body.unidade_compra,
    m2PorUnidade: req.body.m2_por_unidade,
  });
  if (!atualizado) throw Object.assign(new Error('Vínculo não encontrado.'), { status: 404 });
  return atualizado;
}));
router.delete('/vinculos/:id', handler(async (req) => {
  const ok = await codigoNFRepo.excluirVinculo(Number(req.params.id));
  if (!ok) throw Object.assign(new Error('Vínculo não encontrado.'), { status: 404 });
  return { ok: true };
}));

module.exports = router;
