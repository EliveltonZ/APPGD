// Serviço TEMPORÁRIO — só dá suporte à tela de análise do XML "LISTING"
// (pasta "xml logistica"). Remover junto com a tela e a rota de backend
// quando a decisão sobre aproveitar essa fonte estiver tomada.
import { apiPost } from "./api";

export interface ItemAnaliseXmlLogistica {
  ambiente: string | null;
  categoria: string | null;
  nivel: number;
  parentUniqueId: string | null;
  uniqueId: string | null;
  id: string | null;
  descricao: string | null;
  referencia: string | null;
  unidade: string | null;
  quantidade: number | null;
  repeticao: number | null;
  largura: number | null;
  altura: number | null;
  profundidade: number | null;
  textDimension: string | null;
  componente: boolean;
  estrutura: boolean;
  estruturaChave: string | null;
  familia: string | null;
  grupo: string | null;
  itemBase: string | null;
}

export interface ResultadoAnaliseXmlLogistica {
  totalNos: number;
  totalComponentes: number;
  itens: ItemAnaliseXmlLogistica[];
}

export const analisarXmlLogisticaTemp = (xml: string): Promise<ResultadoAnaliseXmlLogistica> =>
  apiPost("/xml-logistica-analise-temp/parse", { xml });
