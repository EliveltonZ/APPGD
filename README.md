# APPGD — Sistema de Gestão Geração Design

Sistema interno de gestão da Geração Design. Cobre o ciclo completo de produção: pedidos, PCP, produção, expedição, compras, assistências técnicas, logística, qualidade e financeiro.

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Como Executar](#4-como-executar)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Padrões e Convenções](#6-padrões-e-convenções)
7. [Autenticação e Permissões](#7-autenticação-e-permissões)
8. [Módulos do Sistema](#8-módulos-do-sistema)
9. [Como Adicionar uma Nova Rota/Feature](#9-como-adicionar-uma-nova-rotafeature)
10. [Build e Deploy](#10-build-e-deploy)

---

## 1. Visão Geral da Arquitetura

O projeto é um **monorepo** com dois pacotes:

```
APP/
├── frontend/   → React + TypeScript + Vite (SPA)
└── backend/    → Node.js + Express (API REST + serve o frontend compilado)
```

**Banco de dados:** Supabase (PostgreSQL). Toda a lógica de negócio fica em **funções RPC** no Supabase. O backend Node.js funciona como uma camada de proxy autenticada: recebe a requisição do frontend, valida o JWT, repassa os parâmetros para a função RPC correspondente e devolve o resultado.

```
[Navegador]
    │  HTTP + JWT
    ▼
[Express :3001]
    │  supabase.rpc("nome_da_funcao", params)
    ▼
[Supabase / PostgreSQL]
```

O frontend compilado (`vite build`) é colocado em `backend/public` e servido pelo próprio Express, então **não há servidor web separado em produção**.

---

## 2. Stack Tecnológico

### Frontend

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Tipagem |
| Vite | 8 | Bundler / dev server |
| React Router DOM | 6 | Roteamento SPA |
| Lucide React | — | Ícones |
| Recharts | — | Gráficos (dashboards) |
| xlsx | — | Exportação de planilhas |
| vite-plugin-pwa | — | PWA / offline |

### Backend

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | 4.18 | Framework HTTP |
| Supabase JS Client | 2 | Acesso ao banco via RPC |
| jsonwebtoken | 9 | Geração e validação de JWT |
| dotenv | — | Variáveis de ambiente |
| nodemon | — | Recarregamento automático (dev) |

---

## 3. Estrutura de Pastas

### 3.1 Frontend — `frontend/src/`

```
src/
│
├── main.tsx                    ← Entry point: providers + todas as rotas
├── index.css                   ← Estilos globais
│
├── config/
│   └── appRoutes.ts            ← FONTE ÚNICA DE VERDADE: rotas, permissões e menu
│
├── context/
│   ├── AuthContext.tsx         ← Estado global de autenticação (JWT, usuário)
│   └── ToastContext.tsx        ← Notificações toast globais
│
├── types/                      ← Todas as interfaces TypeScript do sistema
│   ├── auth.ts                 ← AuthUser, UserPermissions, hasPermission()
│   ├── pcp.ts                  ← ProductionProject, ProjectStatus, BatchForm
│   ├── assistencia.ts          ← ServiceRequest, ServicePart, TeamMember
│   ├── assistenciaProducao.ts  ← AssistanceProduction (modal de produção)
│   ├── purchases.ts            ← Purchase, PurchaseStatus, PurchaseCategory
│   ├── expedition.ts           ← ExpeditionOrder, ExpeditionDetail
│   ├── project.ts              ← ProjectFormData, ContractLookupResult
│   ├── financeiro.ts           ← ProjectValue, FinancialSummary
│   ├── production.ts           ← ProductionOrder, Employee, SectorConfig
│   ├── qualityControl.ts       ← QualityItem, OccurrenceType, CauseType
│   └── ...
│
├── services/                   ← Integração com a API (uma função por endpoint)
│   ├── api.ts                  ← Base: apiGet(), apiPost(), apiPut() + JWT automático
│   ├── assistencia.ts
│   ├── assistenciaProducao.ts
│   ├── pcp.ts
│   ├── expedition.ts
│   ├── purchases.ts
│   └── ...
│
├── hooks/
│   ├── useApiData.ts           ← Hook genérico para fetch com loading/error/refetch
│   └── useTableFilterSort.ts   ← Filtro e ordenação de tabelas
│
├── data/                       ← Constantes de configuração de UI e mocks
│   ├── *Config.ts              ← Labels, opções de select, constantes de status
│   └── *Mocks.ts               ← Dados falsos para desenvolvimento/prototipagem
│
├── components/                 ← Componentes reutilizáveis globais
│   ├── Layout/AppLayout.tsx    ← Layout principal (header + sidebar + conteúdo)
│   ├── Sidebar/                ← Navegação lateral
│   ├── DataTable/              ← Tabela genérica com filtro por coluna
│   ├── Modal/                  ← Container de modal
│   ├── ConfirmModal/           ← Confirmação de ação genérica
│   ├── Charts/                 ← Bar, Pie, Area, Metrics (todos com Recharts)
│   ├── Input/, Select/         ← Campos de formulário estilizados
│   ├── SummaryCard/            ← Card de KPI (número + ícone + cor)
│   ├── Toast/                  ← Notificação flutuante
│   ├── ProtectedRoute/         ← Guard de rota por permissão
│   └── ...
│
├── features/                   ← Componentes específicos por módulo
│   ├── assistencias/
│   │   ├── common/             ← Modal principal, tabela, badges (reutilizados nas 4 visões)
│   │   ├── nova/               ← Seleção de peças, equipe
│   │   ├── producao/
│   │   ├── logistica/
│   │   └── qualidade/
│   ├── pcp/                    ← Cards de ação, modais de lote, release, exportação
│   ├── expedition/             ← Tabela e modal de expedição
│   ├── purchases/              ← Modal de compra (Identificação, Fornecedor, Datas, etc.)
│   ├── production/             ← Setores, materiais, colaboradores
│   ├── pending/                ← Controle de pendências
│   ├── forecast/               ← Previsão e filtros
│   ├── status/                 ← Filtros e modal de detalhes de status
│   └── financeiro/             ← Resumo financeiro e valores
│
└── pages/                      ← Uma pasta por rota protegida
    ├── Login/
    ├── Menu/                   ← Tela inicial (home)
    ├── Pedidos/                ← NovoProjeto, EditaProjeto, ExcluirProjeto
    ├── PCP/                    ← Painel, Producao, Expedicao, Relatorios
    ├── Compras/                ← Relatorio, Pendencias
    ├── Logistica/              ← Status, Planejamento
    ├── Assistencias/           ← Nova, Producao, Logistica, Qualidade
    ├── Financeiro/             ← Valores
    ├── Configuracoes/          ← Usuario, Senha, Acessos
    ├── Dashboards/             ← Principal (projetos + produção com charts)
    └── CapaImpressao/          ← Páginas de impressão (sem layout, abertas em iframe)
        ├── index.tsx           ← Capa do projeto
        ├── CapaPendencias/
        ├── CapaVerificacao/
        └── CapaAssistencia/    ← Capa de controle de assistência técnica
```

### 3.2 Backend — `backend/src/`

```
src/
│
├── server.js                       ← Entry point: Express, rotas, SPA fallback
│
├── client/
│   └── clientSupabase.js           ← Instância do cliente Supabase (singleton)
│
├── middlewares/
│   ├── auth.js                     ← Valida JWT em todas as rotas protegidas
│   ├── errorHandler.js             ← Tratamento centralizado de erros Express
│   └── requirePermission.js        ← Verifica permissão específica via RPC
│
├── routes/
│   ├── index.js                    ← Router raiz: une todas as sub-rotas
│   ├── auth.js                     ← POST /api/auth/login
│   ├── assistencias.js             ← GET /api/assistencias, /api/assistencias/projeto
│   ├── pcp.js                      ← GET/POST /api/pcp/*
│   ├── producao.js                 ← GET/PUT /api/producao/*
│   ├── expedicao.js
│   ├── compras.js
│   ├── pendencias.js
│   ├── pecas.js                    ← GET /api/pecas (peças de assistência)
│   ├── qualidade.js
│   ├── valores.js
│   ├── projetos.js
│   ├── usuarios.js
│   ├── solicitacao.js
│   ├── previsao.js
│   ├── status.js
│   ├── menu.js
│   └── senha.js
│
└── controllers/
    ├── rpcHandlerFactory.js        ← PADRÃO CENTRAL: fábrica de handlers RPC
    ├── assistenciasController.js
    ├── pcpController.js
    ├── projetosProdController.js   ← Produção
    ├── projetosExpController.js    ← Expedição
    ├── projetosPrevController.js   ← Previsão
    ├── projetosSttsController.js   ← Status
    ├── addProjetosController.js    ← Criação de projetos
    ├── editProjetosController.js   ← Edição de projetos
    ├── deleteController.js
    ├── capaController.js           ← Dados para capas de impressão
    ├── usuariosController.js
    ├── valoresController.js
    ├── comprasController.js
    ├── qualidadeController.js
    ├── pecasController.js
    ├── pendenciasController.js
    └── ...
```

---

## 4. Como Executar

### Pré-requisitos

- Node.js 18+
- npm 9+ (ou Yarn)

### Instalação

```bash
# Na raiz do projeto
npm install
```

### Desenvolvimento

```bash
# Iniciar o backend (porta 3001)
npm run dev -w backend

# Iniciar o frontend (porta 5173, com proxy para :3001)
npm run dev -w frontend
```

Acesse `http://localhost:5173`. O Vite já está configurado para redirecionar `/api/*` ao backend.

### URLs de Impressão (sem autenticação)

Essas rotas abrem em iframe e disparam `window.print()` automaticamente:

| Rota | Descrição |
|---|---|
| `/impressao/capa?id=<OC>` | Capa do projeto |
| `/impressao/capa-pendencias?id=<OC>` | Capa de pendências |
| `/impressao/capa-verificacao?id=<OC>` | Verificação volumétrica |
| `/impressao/capa-assistencia?id=<NUM_SOLICITACAO>` | Controle de assistência técnica |

---

## 5. Variáveis de Ambiente

### `backend/src/client/.env`

```env
SUPABASE_URL=https://<projeto>.supabase.co
SUPABASE_ANON_KEY=<chave-anon>
JWT_SECRET=<segredo-forte>
JWT_EXPIRES_IN=3d
PORT=3001
```

### `frontend/.env` (opcional, para dev)

```env
VITE_API_URL=http://localhost:3001
```

Em produção, `VITE_API_URL` é vazio — o frontend usa o mesmo host do backend.

---

## 6. Padrões e Convenções

### 6.1 Integração com API no Frontend

Toda comunicação com o backend segue três camadas:

```
[Componente / Hook]
      ↓  chama
[services/*.ts]        ← converte tipos do domínio, chama apiGet/apiPost
      ↓  chama
[services/api.ts]      ← injeta JWT, lida com 401, parse JSON
      ↓  HTTP
[backend /api/*]
```

**Exemplo prático:**

```typescript
// services/assistencia.ts
export async function fetchAssistencias(): Promise<Assistencia[]> {
  const raw = await apiGet<RawRow[]>('/assistencias');
  return raw.map(toAssistencia); // transforma colunas do DB → tipo TypeScript
}

// Em qualquer componente ou página:
const { data, loading, error, refetch } = useApiData(fetchAssistencias);
```

### 6.2 Hook `useApiData`

Hook genérico para qualquer fetch. Gerencia os estados `data`, `loading`, `error` e expõe `refetch()` para recarregar manualmente.

```typescript
const { data: projetos, loading, refetch } = useApiData(fetchProductionProjects);
```

> **Importante:** o `useApiData` usa um `ref` interno para guardar `fetchFn`, então alterar a referência da função não causa refetch desnecessário.

### 6.3 Padrão RPC no Backend — `rpcHandlerFactory`

Quase todos os endpoints seguem o mesmo padrão:

```javascript
// controllers/assistenciasController.js
const { createRpcHandler } = require('./rpcHandlerFactory');

const getAssistencias = createRpcHandler('listar_assistencias', 'query');
module.exports = { getAssistencias };

// routes/assistencias.js
router.get('/', getAssistencias);
```

O factory `createRpcHandler(nomeFuncao, origem, opcoes)`:
1. Extrai parâmetros de `req.query` ou `req.body`
2. Sanitiza (remove caracteres perigosos)
3. Renomeia campos quando o frontend usa nomes diferentes das stored procedures
4. Chama `supabase.rpc(nomeFuncao, params)`
5. Aplica transformação opcional (`opts.transform`)
6. Retorna JSON ou erro HTTP 500

### 6.4 Fonte Única de Verdade — `appRoutes.ts`

O arquivo `frontend/src/config/appRoutes.ts` é o único lugar que define rotas. A partir dele são derivados automaticamente:

- O menu lateral (`data/menuConfig.ts`)
- Os guards de rota (`ProtectedRoute`)
- O mapeamento de páginas (`main.tsx` → `PAGE_MAP`)
- As chaves de permissão do JWT (`types/auth.ts` → `PermissionKey`)

**Nunca edite menu, permissões ou rotas em outros arquivos.**

### 6.5 Estrutura de Componente de Página

```
pages/NomePagina/
├── index.tsx       ← Componente da página (usa AppLayout + features)
└── index.css       ← Estilos exclusivos dessa página
```

### 6.6 Estrutura de Feature

```
features/modulo/
├── ComponenteXModal/
│   ├── index.tsx
│   └── sections/         ← Seções internas do modal
│       ├── SecaoA.tsx
│       └── SecaoB.tsx
└── ComponenteYTable/
    ├── index.tsx
    └── index.css
```

---

## 7. Autenticação e Permissões

### Fluxo de login

```
1. Usuário envia login/senha → POST /api/auth/login
2. Backend valida no Supabase (RPC check_password)
3. Backend gera JWT com { sub: id, nome, permissoes: { chave: bool } }
4. Frontend salva JWT em localStorage (chave: gd_auth_token)
5. AuthContext decodifica o payload e popula o estado global `user`
6. Cada requisição enviada pelo frontend inclui: Authorization: Bearer <token>
7. Middleware auth.js do backend valida a assinatura do token
```

### Permissões

As permissões são booleanos no payload do JWT:

```json
{
  "sub": "42",
  "nome": "João",
  "permissoes": {
    "pcp_painel": true,
    "pcp_producao": true,
    "assistencias_nova": false
  }
}
```

No frontend, `hasPermission(user, 'pcp_painel')` retorna `true/false`. O componente `<ProtectedRoute>` usa essa função para bloquear rotas sem permissão e redirecionar para `/`.

### Expiração automática

Se qualquer requisição retorna **HTTP 401**, `api.ts` limpa o localStorage e redireciona para `/login` automaticamente.

---

## 8. Módulos do Sistema

| Módulo | Rota Frontend | Endpoint Backend | Descrição |
|---|---|---|---|
| **Pedidos** | `/pedidos/*` | `/api/projetos` | Criação, edição e exclusão de projetos/OC |
| **PCP** | `/fabrica/pcp` | `/api/pcp` | Painel de controle: liberação, lotes, iniciar produção, exportação |
| **Produção** | `/fabrica/producao` | `/api/producao` | Estágios de produção por setor, materiais |
| **Expedição** | `/fabrica/expedicao` | `/api/expedicao` | Conferência de volumes, acessórios, embalagem |
| **Relatórios PCP** | `/fabrica/relatorios` | `/api/previsao` + `/api/status` | Previsão de entrega, status por projeto |
| **Compras** | `/compras/*` | `/api/compras` + `/api/pendencias` | Registro e controle de compras e pendências |
| **Logística** | `/logistica/*` | `/api/status` + `/api/previsao` | Status dos projetos, planejamento de entrega |
| **Assistências** | `/assistencias/*` | `/api/assistencias` + `/api/pecas` | 4 visões: Nova solicitação, Produção, Logística, Qualidade |
| **Financeiro** | `/financeiro/valores` | `/api/valores` | Valores e margens por projeto/período |
| **Dashboards** | `/dashboards/principal` | `/api/pcp` + outros | Gráficos de projetos e produção |
| **Configurações** | `/configuracoes/*` | `/api/usuarios` + `/api/senha` | Usuários, senhas, controle de acessos |

### Módulo de Assistências (4 visões independentes)

O módulo de assistências reutiliza um **Modal comum** (`features/assistencias/common/Modal`) com permissões diferentes por visão:

| Visão | Permissão | readOnly | logisticsMode | producaoMode |
|---|---|---|---|---|
| Nova Solicitação | `assistencias_nova` | false | false | false |
| Produção | `assistencias_producao` | false | false | true |
| Logística | `assistencias_logistica` | false | true | false |
| Qualidade | `assistencias_qualidade` | true | false | false |

---

## 9. Como Adicionar uma Nova Rota/Feature

### Passo 1 — Registrar a rota em `appRoutes.ts`

```typescript
// frontend/src/config/appRoutes.ts
{ permissionKey: 'nome_do_modulo', path: '/grupo/subrota', groupId: 'grupo', menuLabel: 'Rótulo no menu' },
```

### Passo 2 — Criar a página

```
frontend/src/pages/Grupo/NomePagina/
├── index.tsx
└── index.css
```

### Passo 3 — Registrar em `main.tsx`

```typescript
// Importe a página
import { NomePaginaPage } from "./pages/Grupo/NomePagina";

// Adicione ao PAGE_MAP
const PAGE_MAP = {
  // ...
  nome_do_modulo: NomePaginaPage,
};
```

### Passo 4 — Criar o serviço

```typescript
// frontend/src/services/nomeModulo.ts
import { apiGet } from './api';
import type { MinhaInterface } from '../types/nomeModulo';

export async function fetchMeusDados(): Promise<MinhaInterface[]> {
  return apiGet<MinhaInterface[]>('/meu-endpoint');
}
```

### Passo 5 — Criar a rota e o controller no backend

```javascript
// backend/src/controllers/meuController.js
const { createRpcHandler } = require('./rpcHandlerFactory');
const getMeusDados = createRpcHandler('nome_da_funcao_supabase', 'query');
module.exports = { getMeusDados };

// backend/src/routes/meuModulo.js
const router = require('express').Router();
const { getMeusDados } = require('../controllers/meuController');
router.get('/', getMeusDados);
module.exports = router;

// backend/src/routes/index.js — adicione:
router.use('/meu-endpoint', require('./meuModulo'));
```

### Passo 6 — Criar a função RPC no Supabase

Crie a stored procedure PostgreSQL no painel do Supabase (`Database > Functions`).

---

## 10. Build e Deploy

```bash
# 1. Compilar o frontend para backend/public
npm run build -w frontend

# 2. Iniciar o servidor (serve frontend + API)
npm start -w backend
# ou: node backend/src/server.js
```

O Express serve `backend/public` como arquivos estáticos. Qualquer rota não reconhecida como `/api/*` devolve `index.html` (SPA fallback), permitindo que o React Router gerencie a navegação no lado do cliente.

**Resultado:** Um único processo Node.js na porta 3001 serve tanto a aplicação quanto a API.

---

## Notas para Novos Desenvolvedores

- **Nunca altere nomes de colunas em TypeScript** sem verificar o nome correspondente no banco e no backend — o mapeamento é feito manualmente no `rpcHandlerFactory.js`.
- **Mocks** (`data/*Mocks.ts`) são apenas para desenvolvimento local. Verifique se o serviço real existe antes de usar dados mockados em produção.
- **Permissões** são verificadas tanto no frontend (via `hasPermission`) quanto no backend (middleware `auth.js`). Se uma rota não aparece no menu, verifique `appRoutes.ts` e o JWT do usuário.
- **Impressão** funciona via iframe oculto: o modal abre a URL `/impressao/*` em um `<iframe>`, aguarda a mensagem `"capa-ready"` via `postMessage` e então chama `iframeWin.print()`.
