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
  { value: 'Não está na lista',                        label: 'Não está na lista'                        },
  { value: 'Fora de esquadro módulo / peça',           label: 'Fora de esquadro módulo / peça'           },
  { value: 'Faltando itens / peças',                   label: 'Faltando itens / peças'                   },
  { value: 'Ferragem com defeito',                     label: 'Ferragem com defeito'                     },
  { value: 'Ferragens trocadas ou misturadas',         label: 'Ferragens trocadas ou misturadas'         },
  { value: 'Fita de borda descolando / ausente',       label: 'Fita de borda descolando / ausente'       },
  { value: 'Peça danificada',                          label: 'Peça danificada'                          },
  { value: 'Fora de medida',                           label: 'Fora de medida'                           },
  { value: 'Furação invertida',                        label: 'Furação invertida'                        },
  { value: 'Cor errada',                               label: 'Cor errada'                               },
  { value: 'Veio invertido',                           label: 'Veio invertido'                           },
  { value: 'Porta / gaveta / módulos desalinhados',    label: 'Porta / gaveta / módulos desalinhados'    },
  { value: 'Tapa furo na cor errada',                  label: 'Tapa furo na cor errada'                  },
  { value: 'Erro de montagem',                         label: 'Erro de montagem'                         },
  { value: 'Folgas excessivas',                        label: 'Folgas excessivas'                        },
  { value: 'Furos feitos no local errado',             label: 'Furos feitos no local errado'             },
  { value: 'Incompatível com eletros',                 label: 'Incompatível com eletros'                 },
  { value: 'Incompatível com elétrica',                label: 'Incompatível com elétrica'                },
  { value: 'Peça / material perdido',                  label: 'Peça / material perdido'                  },
  { value: 'Ambiente fora de esquadro',                label: 'Ambiente fora de esquadro'                },
  { value: 'Vidros / espelhos danificados',            label: 'Vidros / espelhos danificados'            },
  { value: 'Projetos com falhas técnicas',             label: 'Projetos com falhas técnicas'             },
  { value: 'Embalagem danificada / transporte',        label: 'Embalagem danificada / transporte'        },
  { value: 'Erro de lançamento da Asteca',             label: 'Erro de lançamento da Asteca'             },
  { value: 'Peça não prevista em projeto',             label: 'Peça não prevista em projeto'             },
  { value: 'Alterações solicitadas pelo cliente',      label: 'Alterações solicitadas pelo cliente'      },
  { value: 'Falhas de terceiros',                      label: 'Falhas de terceiros'                      },
  { value: 'Fita de borda com cor divergente do MDF',  label: 'Fita de borda com cor divergente do MDF'  },
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