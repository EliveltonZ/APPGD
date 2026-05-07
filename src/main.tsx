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
import { DashboardPage } from "./pages/Dashboard";
import { NotFoundPage } from "./pages/NotFound";

// ── Pedidos ───────────────────────────────────────────────────────────────────
import { NovoProjetoPage } from "./pages/Pedidos/NovoProjeto";
import { EditaProjetoPage } from "./pages/Pedidos/EditaProjeto";
import { ExcluirProjetoPage } from "./pages/Pedidos/ExcluirProjeto";

// ── Compras ───────────────────────────────────────────────────────────────────
import { RelatorioComprasPage } from "./pages/Compras/Relatorio";
import { PendenciasPage } from "./pages/Compras/Pendencias";

// ── PCP ───────────────────────────────────────────────────────────────────────
import { PcpPage } from "./pages/PCP/Painel";
import { ProducaoPage } from "./pages/PCP/Producao";
import { ExpedicaoPage } from "./pages/PCP/Expedicao";
import { RelatoriosPcpPage } from "./pages/PCP/Relatorios";

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
import { ConfigUsuarioPage } from "./pages/Configuracoes/Usuario";
import { ConfigSenhaPage } from "./pages/Configuracoes/Senha";
import { ConfigAcessosPage } from "./pages/Configuracoes/Acessos";

// ── Impressão (iframe, sem layout) ────────────────────────────────────────────
import { CapaImpressaoPage } from "./pages/CapaImpressao";

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
  config_usuario: ConfigUsuarioPage,
  config_senha: ConfigSenhaPage,
  config_acessos: ConfigAcessosPage,
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

          {/* Dashboard — sempre acessível para usuários autenticados */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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

          {/* Impressão — sem layout, sem autenticação */}
          <Route path="/impressao/capa" element={<CapaImpressaoPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
