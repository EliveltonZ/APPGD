import { useState } from "react";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Modal } from "../../components/Modal";
import { SummaryCard } from "../../components/SummaryCard";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import "./index.css";

// ── Seções disponíveis ──────────────────────────────────────
const SECTIONS = [
  "Button",
  "Input",
  "Select",
  "Modal",
  "SummaryCard",
  "Toast",
] as const;
type Section = (typeof SECTIONS)[number];

// ── Componente principal ────────────────────────────────────
export function SandboxPage() {
  const toast = useToast();
  const [active, setActive] = useState<Section>("Button");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [selectVal, setSelectVal] = useState("");

  return (
    <div className="sb-layout">
      {/* ── Sidebar de navegação ── */}
      <aside className="sb-nav">
        <div className="sb-nav__title">🧪 Sandbox</div>
        {SECTIONS.map((s) => (
          <button
            key={s}
            className={`sb-nav__item${active === s ? " sb-nav__item--active" : ""}`}
            onClick={() => setActive(s)}
          >
            {s}
          </button>
        ))}
      </aside>

      {/* ── Área principal ── */}
      <main className="sb-main">
        <h2 className="sb-section-title">{active}</h2>

        {/* ── Button ── */}
        {active === "Button" && (
          <div className="sb-group">
            <Row label="Variantes">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </Row>
            <Row label="Tamanhos">
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="primary" size="md">
                Medium
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
            </Row>
            <Row label="Estados">
              <Button variant="primary" disabled>
                Disabled
              </Button>
              <Button variant="primary" loading>
                Loading
              </Button>
            </Row>
            <Row label="Com ícone">
              <Button variant="primary">
                <Package size={14} /> Com ícone
              </Button>
            </Row>
          </div>
        )}

        {/* ── Input ── */}
        {active === "Input" && (
          <div className="sb-group">
            <Row label="Padrão">
              <Input
                label="Nome"
                placeholder="Digite seu nome"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
            </Row>
            <Row label="Com erro">
              <Input
                label="E-mail"
                placeholder="email@exemplo.com"
                error="E-mail inválido"
                value=""
                onChange={() => {}}
              />
            </Row>
            <Row label="Desabilitado">
              <Input
                label="Campo bloqueado"
                value="Valor fixo"
                disabled
                onChange={() => {}}
              />
            </Row>
          </div>
        )}

        {/* ── Select ── */}
        {active === "Select" && (
          <div className="sb-group">
            <Row label="Padrão">
              <Select
                label="Status"
                placeholder="Selecionar..."
                value={selectVal}
                onChange={(e) => setSelectVal(e.target.value)}
                options={[
                  { value: "ativo", label: "Ativo" },
                  { value: "inativo", label: "Inativo" },
                  { value: "pendente", label: "Pendente" },
                ]}
              />
            </Row>
            <Row label="Com erro">
              <Select
                label="Categoria"
                placeholder="Selecionar..."
                value=""
                onChange={() => {}}
                options={[{ value: "a", label: "Opção A" }]}
                error="Campo obrigatório"
              />
            </Row>
          </div>
        )}

        {/* ── Modal ── */}
        {active === "Modal" && (
          <div className="sb-group">
            <Row label="Modal padrão">
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                Abrir Modal
              </Button>
            </Row>
            <Row label="Confirm Modal">
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Abrir Confirm
              </Button>
            </Row>

            <Modal
              title="Exemplo de Modal"
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              maxWidth={480}
              footer={
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    padding: "10px 20px",
                  }}
                >
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>
                    Fechar
                  </Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>
                    Confirmar
                  </Button>
                </div>
              }
            >
              <div style={{ padding: 20 }}>
                <p>Conteúdo do modal. Pode colocar qualquer componente aqui.</p>
              </div>
            </Modal>

            <ConfirmModal
              isOpen={confirmOpen}
              message="Deseja realmente executar esta ação?"
              confirmLabel="Sim, executar"
              cancelLabel="Cancelar"
              onConfirm={() => {
                setConfirmOpen(false);
                toast.success("Ação confirmada!");
              }}
              onCancel={() => setConfirmOpen(false)}
            />
          </div>
        )}

        {/* ── SummaryCard ── */}
        {active === "SummaryCard" && (
          <div className="sb-group">
            <Row label="Variantes">
              <SummaryCard
                label="Total"
                value={42}
                accent="var(--accent)"
                icon={<Package size={13} />}
                loading={false}
              />
              <SummaryCard
                label="Alerta"
                value={7}
                accent="#dc2626"
                icon={<AlertTriangle size={13} />}
                loading={false}
              />
              <SummaryCard
                label="Concluído"
                value={128}
                accent="#16a34a"
                icon={<CheckCircle size={13} />}
                loading={false}
              />
              <SummaryCard
                label="Em Lote"
                value={3}
                accent="#2080c5"
                icon={<Package size={13} />}
                loading={false}
              />
            </Row>
            <Row label="Loading">
              <SummaryCard
                label="Carregando"
                value={0}
                accent="var(--accent)"
                icon={<Package size={13} />}
                loading
              />
            </Row>
          </div>
        )}

        {/* ── Toast ── */}
        {active === "Toast" && (
          <div className="sb-group">
            <Row label="Tipos">
              <Button
                variant="primary"
                onClick={() => toast.success("Operação realizada com sucesso!")}
              >
                Success
              </Button>
              <Button
                variant="danger"
                onClick={() => toast.error("Ocorreu um erro inesperado.")}
              >
                Error
              </Button>
            </Row>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sb-row">
      <span className="sb-row__label">{label}</span>
      <div className="sb-row__content">{children}</div>
    </div>
  );
}
