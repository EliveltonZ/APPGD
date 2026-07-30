import type { OccurrenceType, CauseType } from '../types/qualityControl';

export const OCCURRENCE_LABELS: Record<OccurrenceType, string> = {
  estrutural:     'Estrutural',
  nao_estrutural: 'Não Estrutural',
  acessorio:      'Acessório',
  terceiros:      'Terceiros',
};

export const OCCURRENCE_OPTIONS = [
  { value: 'estrutural',     label: 'Estrutural'      },
  { value: 'nao_estrutural', label: 'Não Estrutural'  },
  { value: 'acessorio',      label: 'Acessório'       },
  { value: 'terceiros',      label: 'Terceiros'       },
];

export const OCCURRENCE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as Ocorrências' },
  ...OCCURRENCE_OPTIONS,
];

export const FAILURE_OPTIONS = [
  { value: '1',  label: 'Não está na lista'                        },
  { value: '2',  label: 'Fora de esquadro módulo / peça'           },
  { value: '3',  label: 'Faltando itens / peças'                   },
  { value: '4',  label: 'Ferragem com defeito'                     },
  { value: '5',  label: 'Ferragens trocadas ou misturadas'         },
  { value: '6',  label: 'Fita de borda descolando / ausente'       },
  { value: '7',  label: 'Peça danificada'                          },
  { value: '8',  label: 'Fora de medida'                           },
  { value: '9',  label: 'Furação invertida'                        },
  { value: '10', label: 'Cor errada'                               },
  { value: '11', label: 'Veio invertido'                           },
  { value: '12', label: 'Porta / gaveta / módulos desalinhados'    },
  { value: '13', label: 'Tapa furo na cor errada'                  },
  { value: '14', label: 'Erro de montagem'                         },
  { value: '15', label: 'Folgas excessivas'                        },
  { value: '16', label: 'Furos feitos no local errado'             },
  { value: '17', label: 'Incompatível com eletros'                 },
  { value: '18', label: 'Incompatível com elétrica'                },
  { value: '19', label: 'Peça / material perdido'                  },
  { value: '20', label: 'Ambiente fora de esquadro'                },
  { value: '21', label: 'Vidros / espelhos danificados'            },
  { value: '22', label: 'Projetos com falhas técnicas'             },
  { value: '23', label: 'Embalagem danificada / transporte'        },
  { value: '24', label: 'Erro de lançamento da Asteca'             },
  { value: '25', label: 'Peça não prevista em projeto'             },
  { value: '26', label: 'Alterações solicitadas pelo cliente'      },
  { value: '27', label: 'Falhas de terceiros'                      },
  { value: '28', label: 'Fita de borda com cor divergente do MDF'  },
];

export const FAILURE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as Falhas' },
  ...FAILURE_OPTIONS,
];


export const CAUSE_LABELS: Record<CauseType, string> = {
  projeto:          'Projeto',
  producao:         'Produção',
  montagem:         'Montagem',
  transporte:       'Transporte',
  cliente:          'Cliente',
  fornecedor:       'Fornecedor',
  terceiros:        'Terceiros',
  nao_identificado: 'Não identificado',
};

export const CAUSE_OPTIONS = [
  { value: 'projeto',          label: 'Projeto'          },
  { value: 'producao',         label: 'Produção'         },
  { value: 'montagem',         label: 'Montagem'         },
  { value: 'transporte',       label: 'Transporte'       },
  { value: 'cliente',          label: 'Cliente'          },
  { value: 'fornecedor',       label: 'Fornecedor'       },
  { value: 'terceiros',        label: 'Terceiros'        },
  { value: 'nao_identificado', label: 'Não identificado' },
];

export const CAUSE_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas as Causas' },
  ...CAUSE_OPTIONS,
];

export const QC_STATUS_FILTER_OPTIONS = [
  { value: 'all',       label: 'Todos os Status' },
  { value: 'pendente',  label: 'Pendente'        },
  { value: 'analisado', label: 'Analisado'       },
];