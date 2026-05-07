import type { RequestSituation } from '../types/assistencia';

export const REQUEST_TYPE_OPTIONS = [
  { value: 'montagem_finalizacao',      label: 'Montagem - Finalização'    },
  { value: 'asteca_garantia',           label: 'Asteca - Garantia'         },
  { value: 'itens_especiais_terceiro',  label: 'Itens Especiais - Terceiro'},
];

export const DESTINATION_OPTIONS = [
  { value: 'fabrica',   label: 'Fábrica'   },
  { value: 'logistica', label: 'Logística' },
];

export const URGENTE_OPTIONS = [
  { value: 'nao', label: 'Não' },
  { value: 'sim', label: 'Sim' },
];

export const PART_SIDE_OPTIONS = [
  { value: 'inferior_direito',  label: 'Inferior Direito'  },
  { value: 'superior_direito',  label: 'Superior Direito'  },
  { value: 'inferior_esquerdo', label: 'Inferior Esquerdo' },
  { value: 'superior_esquerdo', label: 'Superior Esquerdo' },
];

export const PART_TYPE_OPTIONS = [
  { value: 'estrutural',     label: 'Estrutural'     },
  { value: 'nao_estrutural', label: 'Não Estrutural' },
  { value: 'acessorio',      label: 'Acessório'      },
  { value: 'terceiros',      label: 'Terceiros'       },
];

export const FAILURE_OPTIONS = [
  'Fora de esquadro módulo / peça',
  'Faltando itens / peças',
  'Ferragem com defeito',
  'Ferragens trocadas ou misturadas',
  'Fita de borda descolando / ausente',
  'Peça danificada',
  'Fora de medida',
  'Furação invertida',
  'Cor errada',
  'Veio invertido',
  'Porta / gaveta / módulos desalinhados',
  'Tapa furo na cor errada',
  'Erro de montagem',
  'Folgas excessivas',
  'Furos feitos no local errado',
  'Incompatível com eletros',
  'Incompatível com elétrica',
  'Peça / material perdido',
  'Ambiente fora de esquadro',
  'Vidros / espelhos danificados',
  'Projetos com falhas técnicas',
  'Embalagem danificada / transporte',
  'Erro de lançamento da Asteca',
  'Peça não prevista em projeto',
  'Alterações solicitadas pelo cliente',
  'Falhas de terceiros',
  'Fita de borda com cor divergente do MDF',
].map((f) => ({ value: f, label: f }));

export const SITUATION_LABELS: Record<RequestSituation, string> = {
  em_aberto:    'Em Aberto',
  em_andamento: 'Em Andamento',
  concluida:    'Concluída',
  cancelada:    'Cancelada',
};

export const PART_SIDE_LABELS: Record<string, string> = {
  inferior_direito:  'Inf. Direito',
  superior_direito:  'Sup. Direito',
  inferior_esquerdo: 'Inf. Esquerdo',
  superior_esquerdo: 'Sup. Esquerdo',
};

export const PART_TYPE_LABELS: Record<string, string> = {
  estrutural:     'Estrutural',
  nao_estrutural: 'Não Estrutural',
  acessorio:      'Acessório',
  terceiros:      'Terceiros',
};