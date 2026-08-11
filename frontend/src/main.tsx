// ── Entry point da aplicação React ───────────────────────────────────────────
// Define a árvore de providers e todas as rotas do sistema.
//
// Como funciona o roteamento:
//   1. As rotas protegidas são geradas automaticamente a partir de ROUTE_ITEMS
//      (definido em config/appRoutes.ts) usando o PAGE_MAP abaixo.
//   2. O componente <ProtectedRoute> verifica se o usuário tem a permissão
//      correspondente ao caminho antes de renderizar a página.
//   3. Rotas de impressão (/impressao/*) são públicas e não têm layout.
//
// Para adicionar uma nova página:
//   1. Crie o componente em pages/
//   2. Importe abaixo
//   3. Adicione ao PAGE_MAP com a mesma permissionKey de appRoutes.ts

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { ComponentType } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { ROUTE_ITEMS } from "./config/appRoutes";

// ── Páginas fixas ─────────────────────────────────────────────────────────────
import { LoginPage } from "./pages/Login";
import { MenuPage } from "./pages/Menu";
import { NotFoundPage } from "./pages/NotFound";

// ── Pedidos ───────────────────────────────────────────────────────────────────
import { NovoProjetoPage } from "./pages/Pedidos/NovoProjeto";
import { EditaProjetoPage } from "./pages/Pedidos/EditaProjeto";
import { ExcluirProjetoPage } from "./pages/Pedidos/ExcluirProjeto";

// ── Compras ───────────────────────────────────────────────────────────────────
import { RelatorioComprasPage } from "./pages/Compras/Relatorio";
import { PendenciasPage } from "./pages/Compras/Pendencias";

// ── Fábrica ───────────────────────────────────────────────────────────────────
import { PcpPage } from "./pages/Fabrica/Painel";
import { ProducaoPage } from "./pages/Fabrica/Producao";
import { ApontamentoPage } from "./pages/Fabrica/Apontamento";
import { ExpedicaoPage } from "./pages/Fabrica/Expedicao";
import { RelatoriosPcpPage } from "./pages/Fabrica/Relatorios";
import { ParadasPage } from "./pages/Fabrica/Paradas";

// ── Logística ─────────────────────────────────────────────────────────────────
import { LogisticaStatusPage } from "./pages/Logistica/Status";
import { PlanejamentoPage } from "./pages/Logistica/Planejamento";

// ── Assistências ──────────────────────────────────────────────────────────────
import { AssistenciasNovaPage } from "./pages/Assistencias/Nova";
import { AssistenciasProducaoPage } from "./pages/Assistencias/Producao";
import { AssistenciasLogisticaPage } from "./pages/Assistencias/Logistica";
import { AssistenciasQualidadePage } from "./pages/Assistencias/Qualidade";

// ── Financeiro ────────────────────────────────────────────────────────────────
import { FinanceiroValoresPage } from "./pages/Financeiro/Valores";

// ── Dashboards ────────────────────────────────────────────────────────────────
import { DashboardsPrincipalPage } from "./pages/Dashboards";

// ── Configurações ─────────────────────────────────────────────────────────────
import { ConfigSenhaPage } from "./pages/Configuracoes/Senha";
import { ConfigAcessosPage } from "./pages/Configuracoes/Acessos";

// ── Cadastros ─────────────────────────────────────────────────────────────────
import { CadastrosPage } from "./pages/Cadastros";
import { CadastrosUsuariosPage } from "./pages/Cadastros/Usuarios";

// ── Impressão (iframe, sem layout) ────────────────────────────────────────────
import {
  CapaImpressaoPage,
  CapaPendenciasPage,
  CapaVerificacaoPage,
  CapaAssistenciaPage,
} from "./pages/CapaImpressao";

// ── Sandbox (desenvolvimento) ─────────────────────────────────────────────────
import { SandboxPage } from "./pages/Sandbox";

import "./index.css";

/**
 * Mapeamento de chave de permissão → componente de página.
 *
 * Ao adicionar uma nova rota em src/config/appRoutes.ts:
 *   1. Crie o componente de página.
 *   2. Importe-o acima.
 *   3. Adicione uma entrada abaixo com a mesma permissionKey.
 */
const PAGE_MAP: Record<string, ComponentType> = {
  pedidos_novo: NovoProjetoPage,
  pedidos_editar: EditaProjetoPage,
  pedidos_excluir: ExcluirProjetoPage,
  compras_lista: RelatorioComprasPage,
  compras_pendencias: PendenciasPage,
  pcp_painel: PcpPage,
  pcp_producao: ProducaoPage,
  pcp_apontamento: ApontamentoPage,
  pcp_expedicao: ExpedicaoPage,
  logistica_planejamento: PlanejamentoPage,
  pcp_relatorios: RelatoriosPcpPage,
  logistica_status: LogisticaStatusPage,
  assistencias_nova: AssistenciasNovaPage,
  assistencias_producao: AssistenciasProducaoPage,
  assistencias_logistica: AssistenciasLogisticaPage,
  assistencias_qualidade: AssistenciasQualidadePage,
  financeiro_valores: FinanceiroValoresPage,
  dashboards_principal: DashboardsPrincipalPage,
  config_senha: ConfigSenhaPage,
  config_acessos: ConfigAcessosPage,
  cadastros_equipe:    CadastrosPage,
  cadastros_qualidade: CadastrosPage,
  cadastros_comercial: CadastrosPage,
  cadastros_clientes:  CadastrosPage,
  cadastros_usuarios:  CadastrosUsuariosPage,
  paradas_maquina:     ParadasPage,
  paradas_admin:       ParadasPage,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota pública */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Page Inicial — sempre acessível para usuários autenticados */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              }
            />

            {/* Rotas protegidas — geradas automaticamente a partir de appRoutes.ts */}
            {ROUTE_ITEMS.map((route) => {
              const Page = PAGE_MAP[route.permissionKey];
              if (!Page) return null;
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      <Page />
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* Impressão — sem layout, mas requer autenticação */}
            <Route path="/impressao/capa" element={<ProtectedRoute><CapaImpressaoPage /></ProtectedRoute>} />
            <Route path="/impressao/capa-pendencias" element={<ProtectedRoute><CapaPendenciasPage /></ProtectedRoute>} />
            <Route path="/impressao/capa-verificacao" element={<ProtectedRoute><CapaVerificacaoPage /></ProtectedRoute>} />
            <Route path="/impressao/capa-assistencia" element={<ProtectedRoute><CapaAssistenciaPage /></ProtectedRoute>} />

            {/* Sandbox — apenas em desenvolvimento */}
            {import.meta.env.DEV && <Route path="/sandbox" element={<SandboxPage />} />}

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
