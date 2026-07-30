import type { ApontamentoProject, Operator } from './types';

export const MOCK_OPERATORS: Operator[] = [
  { id: '1', nome: 'João Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Carlos Ferreira' },
  { id: '4', nome: 'Ana Paula Ramos' },
  { id: '5', nome: 'Roberto Costa' },
];

function daysAgo(days: number, hour = 8): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}
function dateStr(daysOffset: number): string {
  return daysAgo(-daysOffset).slice(0, 10);
}

export const MOCK_PROJECT: ApontamentoProject = {
  ordemdecompra: 7234,
  pedido: 12345,
  contrato: 'CT-2024-0892',
  cliente: 'Construtora Horizonte Ltda.',
  ambiente: 'Sala de Jantar e Cozinha',
  codcc: '4892-SJ',
  numproj: 'PRJ-0892',
  lote: '2024-C',
  chegoufabrica: dateStr(-10),
  dataentrega: dateStr(-1),
  previsao: dateStr(1),
  iniciado: daysAgo(10),
  pronto: null,
  observacoes:
    'Cliente solicitou embalagem reforçada para transporte longo. Conferir medidas do ambiente antes do corte.\n' +
    'Atenção ao tampo de granito — coordenar entrega com montagem.\n' +
    'Contato na obra: Arq. Fernanda Lima (11) 99999-8888.',
  status: 'atrasado',
  etapas: {
    corte: {
      id: 'corte', label: 'Corte', order: 1, status: 'finalizado',
      inicio: daysAgo(9, 8), fim: daysAgo(9, 11),
      pausa: false, responsavelId: '1', responsavelNome: 'João Silva',
    },
    customizacao: {
      id: 'customizacao', label: 'Customização', order: 2, status: 'finalizado',
      inicio: daysAgo(8, 8), fim: daysAgo(8, 16),
      pausa: false, responsavelId: '2', responsavelNome: 'Maria Santos',
    },
    coladeira: {
      id: 'coladeira', label: 'Coladeira', order: 3, status: 'finalizado',
      inicio: daysAgo(7, 7), fim: daysAgo(7, 12),
      pausa: false, responsavelId: '3', responsavelNome: 'Carlos Ferreira',
    },
    usinagem: {
      id: 'usinagem', label: 'Usinagem', order: 4, status: 'em_andamento',
      inicio: daysAgo(0, 8), fim: null,
      pausa: false, responsavelId: '3', responsavelNome: 'Carlos Ferreira',
    },
    paineis: {
      id: 'paineis', label: 'Painéis', order: 5, status: 'nao_iniciado',
      inicio: null, fim: null, pausa: false, responsavelId: null, responsavelNome: null,
    },
    montagem: {
      id: 'montagem', label: 'Montagem', order: 6, status: 'nao_iniciado',
      inicio: null, fim: null, pausa: false, responsavelId: null, responsavelNome: null,
    },
    acabamento: {
      id: 'acabamento', label: 'Acabamento', order: 7, status: 'nao_iniciado',
      inicio: null, fim: null, pausa: false, responsavelId: null, responsavelNome: null,
    },
    embalagem: {
      id: 'embalagem', label: 'Embalagem', order: 8, status: 'nao_iniciado',
      inicio: null, fim: null, pausa: false, responsavelId: null, responsavelNome: null,
    },
  },
  materiais: [
    {
      id: '1', categoria: 'Ferragens',
      descricao: 'Dobradiça 35mm Alumínio', medida: 'UN', qtd: 24,
      datacompra: dateStr(-12), previsao: dateStr(-8), recebido: dateStr(-8),
    },
    {
      id: '2', categoria: 'Puxadores',
      descricao: 'Puxador Inox Escovado 128mm', medida: 'UN', qtd: 12,
      datacompra: dateStr(-10), previsao: dateStr(-4), recebido: null,
    },
    {
      id: '3', categoria: 'Vidros',
      descricao: 'Vidro Temperado 4mm 40×80cm', medida: 'M²', qtd: 3.2,
      datacompra: dateStr(-9), previsao: dateStr(-2), recebido: null,
    },
    {
      id: '4', categoria: 'Corrediças',
      descricao: 'Corrediça Telescópica 45cm', medida: 'PAR', qtd: 8,
      datacompra: dateStr(-14), previsao: dateStr(-10), recebido: dateStr(-11),
    },
    {
      id: '5', categoria: 'Parafusos',
      descricao: 'Parafuso Confirmat 6.3×50mm', medida: 'CX', qtd: 2,
      datacompra: dateStr(-5), previsao: dateStr(0), recebido: null,
    },
  ],
};
