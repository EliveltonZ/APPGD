'use strict';

const router = require('express').Router();
const repo   = require('../repositories/notaFiscalRepository');
const codigoNFRepo = require('../repositories/materiaisCodigoNFRepository');
const nfeMatchService = require('../services/nfeMatchService');

// Permissões reais da feature de estoque ainda não foram desenhadas (mesma
// decisão já tomada pra /estoque — ver comentário lá). Por enquanto, liberado
// pra qualquer usuário autenticado (o middleware `auth` global já exige
// token válido antes de chegar aqui).

function handler(fn) {
  return async (req, res) => {
    try {
      res.json(await fn(req));
    } catch (err) {
      const msg = err.message || '';
      const validacao = /selecione|informe|adicione|inválid|configurad/i.test(msg);
      res.status(validacao ? 422 : 500).json({ error: msg || 'Erro interno.' });
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

module.exports = router;
