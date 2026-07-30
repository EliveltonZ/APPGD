import type { SelectOption } from '../components/Select'

export const SUPERVISORES: SelectOption[] = [
  { value: 'ana_lima',        label: 'Ana Lima'        },
  { value: 'carlos_mendes',   label: 'Carlos Mendes'   },
  { value: 'julia_costa',     label: 'Júlia Costa'     },
  { value: 'roberto_silva',   label: 'Roberto Silva'   },
]

export const LIBERADORES: SelectOption[] = [
  { value: 'paulo_souza',     label: 'Paulo Souza'     },
  { value: 'marcia_ferreira', label: 'Márcia Ferreira' },
  { value: 'andre_oliveira',  label: 'André Oliveira'  },
  { value: 'fernanda_lima',   label: 'Fernanda Lima'   },
]

export const MONTADORES: SelectOption[] = [
  { value: 'joao_silva',       label: 'João Silva'       },
  { value: 'pedro_santos',     label: 'Pedro Santos'     },
  { value: 'lucas_almeida',    label: 'Lucas Almeida'    },
  { value: 'marcos_pereira',   label: 'Marcos Pereira'   },
  { value: 'thiago_rodrigues', label: 'Thiago Rodrigues' },
  { value: 'gabriel_costa',    label: 'Gabriel Costa'    },
]

export const PECAS_OPCOES: SelectOption[] = [
  { value: 'painel_lateral',  label: 'Painel Lateral'    },
  { value: 'porta_vidro',     label: 'Porta com Vidro'   },
  { value: 'gaveta',          label: 'Gaveta'            },
  { value: 'prateleira',      label: 'Prateleira'        },
  { value: 'perfil_aluminio', label: 'Perfil de Alumínio'},
  { value: 'dobradica',       label: 'Dobradiça'         },
  { value: 'corredica',       label: 'Corrediça'         },
  { value: 'tampo',           label: 'Tampo'             },
  { value: 'rodape',          label: 'Rodapé'            },
  { value: 'painel_fundo',    label: 'Painel de Fundo'   },
  { value: 'painel_porta',    label: 'Painel de Porta'   },
  { value: 'suporte',         label: 'Suporte'           },
]

export const CORES: SelectOption[] = [
  { value: 'branco',    label: 'Branco'    },
  { value: 'preto',     label: 'Preto'     },
  { value: 'cinza',     label: 'Cinza'     },
  { value: 'carvalho',  label: 'Carvalho'  },
  { value: 'nogal',     label: 'Nogal'     },
  { value: 'natural',   label: 'Natural'   },
  { value: 'offwhite',  label: 'Off White' },
]

export const TIPOS_PECA: SelectOption[] = [
  { value: 'padrao',    label: 'Padrão'     },
  { value: 'especial',  label: 'Especial'   },
  { value: 'reposicao', label: 'Reposição'  },
]

export const FALHAS: SelectOption[] = [
  { value: 'corte',          label: 'Corte'     },
  { value: 'pintura',        label: 'Pintura'   },
  { value: 'montagem',       label: 'Montagem'  },
  { value: 'transporte',     label: 'Transporte'},
  { value: 'nao_se_aplica',  label: 'N/A'       },
]

export const LADOS: SelectOption[] = [
  { value: 'esquerdo',       label: 'Esquerdo'  },
  { value: 'direito',        label: 'Direito'   },
  { value: 'nao_se_aplica',  label: 'N/A'       },
]

export function nextNumSolicitacao(): string {
  const num = (Date.now() % 9000) + 1000
  const year = new Date().getFullYear()
  return `${String(num).padStart(4, '0')}/${year}`
}
