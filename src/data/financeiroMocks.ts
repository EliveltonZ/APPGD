import { buildProjectValue } from '../utils/financeiroUtils';
import type { ProjectValue } from '../types/financeiro';

type RawProject = Omit<ProjectValue, 'descPct' | 'lucroBruto' | 'margem' | 'marginStatus'>;

const RAW: RawProject[] = [
  { id:  1, numOC: 'OC-0842', contrato: '2401', data: '2024-01-10', cliente: 'Marcos Oliveira',          np: '01/01', loja: 'Loja Centro', ambiente: 'Cozinha Completa',      bruto: 45000,  negociado: 38000, material: 22000  },
  { id:  2, numOC: 'OC-0851', contrato: '2402', data: '2024-02-05', cliente: 'Fernanda Costa',            np: '01/01', loja: 'Loja Norte',  ambiente: 'Dormitório Casal',       bruto: 28000,  negociado: 21000, material: 17000  },
  { id:  3, numOC: 'OC-0863', contrato: '2403', data: '2024-03-15', cliente: 'João Carlos Silva',         np: '01/01', loja: 'Loja Sul',    ambiente: 'Home Office',            bruto: 12000,  negociado: 8500,  material: 8000   },
  { id:  4, numOC: 'OC-0874', contrato: '2404', data: '2024-04-20', cliente: 'Ana Beatriz Sousa',         np: '01/02', loja: 'Loja Centro', ambiente: 'Sala de Estar',          bruto: 67000,  negociado: 60000, material: 55200  },
  { id:  5, numOC: 'OC-0882', contrato: '2405', data: '2024-05-08', cliente: 'Roberto Lima',              np: '01/01', loja: 'Loja Norte',  ambiente: 'Closet',                 bruto: 35000,  negociado: 32000, material: 18000  },
  { id:  6, numOC: 'OC-0891', contrato: '2406', data: '2024-06-12', cliente: 'Carla Mendes Ferreira',     np: '01/01', loja: 'Loja Sul',    ambiente: 'Banheiro Social',        bruto: 9000,   negociado: 7500,  material: 8200   },
  { id:  7, numOC: 'OC-0903', contrato: '2407', data: '2024-07-03', cliente: 'Pedro Henrique Alves',      np: '01/01', loja: 'Loja Centro', ambiente: 'Sala de TV',             bruto: 52000,  negociado: 44000, material: 25000  },
  { id:  8, numOC: 'OC-0915', contrato: '2408', data: '2024-08-22', cliente: 'Juliana Ferreira Santos',   np: '02/02', loja: 'Loja Norte',  ambiente: 'Dormitório + Banheiro',  bruto: 38000,  negociado: 29000, material: 24000  },
  { id:  9, numOC: 'OC-0927', contrato: '2409', data: '2024-09-14', cliente: 'Gustavo Henrique Santos',   np: '01/01', loja: 'Loja Centro', ambiente: 'Cozinha Gourmet',        bruto: 89000,  negociado: 75000, material: 45000  },
  { id: 10, numOC: 'OC-0934', contrato: '2410', data: '2024-10-07', cliente: 'Patrícia Rocha',            np: '01/01', loja: 'Loja Sul',    ambiente: 'Lavanderia',             bruto: 14000,  negociado: 11000, material: 9500   },
  { id: 11, numOC: 'OC-0941', contrato: '2411', data: '2024-11-19', cliente: 'Daniel Moreira Cunha',      np: '01/03', loja: 'Loja Online', ambiente: 'Home Theater',           bruto: 125000, negociado: 98000, material: 72000  },
  { id: 12, numOC: 'OC-0952', contrato: '2412', data: '2024-12-02', cliente: 'Mariana Torres Barbosa',    np: '01/01', loja: 'Loja Sul',    ambiente: 'Escritório',             bruto: 22000,  negociado: 16000, material: 15500  },
  { id: 13, numOC: 'OC-0963', contrato: '2413', data: '2025-01-15', cliente: 'Ricardo Nunes',             np: '01/01', loja: 'Loja Norte',  ambiente: 'Sala de Jantar',         bruto: 43000,  negociado: 35000, material: 19000  },
  { id: 14, numOC: 'OC-0971', contrato: '2414', data: '2025-02-08', cliente: 'Isabela Cristina Martins',  np: '01/02', loja: 'Loja Centro', ambiente: 'Dormitório Infantil',    bruto: 18000,  negociado: 14000, material: 13800  },
  { id: 15, numOC: 'OC-0985', contrato: '2415', data: '2025-03-20', cliente: 'Felipe Cardoso',            np: '01/01', loja: 'Loja Online', ambiente: 'Área Gourmet',           bruto: 76000,  negociado: 62000, material: 30000  },
  { id: 16, numOC: 'OC-0993', contrato: '2416', data: '2025-04-11', cliente: 'Camila Aparecida Souza',    np: '01/02', loja: 'Loja Norte',  ambiente: 'Cozinha + Sala',         bruto: 95000,  negociado: 88000, material: 94000  },
  { id: 17, numOC: 'OC-1004', contrato: '2417', data: '2025-05-03', cliente: 'Thiago Augusto Pereira',    np: '01/01', loja: 'Loja Sul',    ambiente: 'Biblioteca',             bruto: 31000,  negociado: 24000, material: 13000  },
  { id: 18, numOC: 'OC-1012', contrato: '2418', data: '2025-05-06', cliente: 'Vanessa Cruz Rodrigues',    np: '02/02', loja: 'Loja Online', ambiente: 'Closet + Dormitório',    bruto: 58000,  negociado: 48000, material: 28000  },
];

export const mockProjectValues: ProjectValue[] = RAW.map(buildProjectValue);

export const MOCK_LOJAS = ['Loja Centro', 'Loja Norte', 'Loja Sul', 'Loja Online'];