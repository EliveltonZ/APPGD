import type { TeamMember, ServiceRequest } from '../types/assistencia';

export const MOCK_MONTADORES: TeamMember[] = [
  { id: 1, nome: 'Carlos Eduardo Silva'   },
  { id: 2, nome: 'José Roberto Pereira'   },
  { id: 3, nome: 'Paulo Henrique Santos'  },
  { id: 4, nome: 'Antonio Ferreira Lima'  },
  { id: 5, nome: 'Marcos Vinícius Costa'  },
  { id: 6, nome: 'Lucas Almeida Rocha'    },
  { id: 7, nome: 'Diego Carvalho Nunes'   },
  { id: 8, nome: 'Rafael Souza Moreira'   },
];

export function buildInitialRequest(): ServiceRequest {
  return {
    numSolicitacao: 'SOL-001',
    numContrato: '',
    solicitante: 'ELIVELTON GONZAGA',
    dataHora: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    situacao: 'em_aberto',

    cliente: '',
    ambiente: '',
    bairro: '',

    supervisor: '',
    liberador: '',
    tipoSolicitacao: '',
    urgente: 'nao',
    tempo: '',
    destino: '',

    origemMontagem: false,
    origemPromob: false,
    origemEntrega: false,
    origemCobrada: false,

    observacoes: '',
    equipe: [],
    pecas: [],
  };
}