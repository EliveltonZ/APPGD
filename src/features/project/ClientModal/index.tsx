import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { Button } from "../../../components/Button";
import { mockClients } from "../../../data/projectMocks";
import { CLIENT_TYPE_OPTIONS } from "../../../data/projectConfig";
import type { Client } from "../../../types/project";
import "./index.css";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

type Tab = "search" | "new";

interface NewClientForm {
  nome: string;
  tipo: "";
}

const CLIENT_TYPE_LABELS: Record<string, string> = {
  pf: "P. Física",
  pj: "P. Jurídica",
};

function emptyNewClient(): NewClientForm {
  return { nome: "", tipo: "" };
}

export function ClientModal({ isOpen, onClose, onSelect }: ClientModalProps) {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [newClient, setNewClient] = useState<NewClientForm>(emptyNewClient);
  const [saving, setSaving] = useState(false);

  const filtered = mockClients.filter(
    (c) =>
      c.nome.toLowerCase().includes(query.toLowerCase()) ||
      c.id.includes(query),
  );

  function handleSelect(client: Client) {
    onSelect(client);
    onClose();
    setQuery("");
  }

  function handleNewChange(field: keyof NewClientForm, value: string) {
    setNewClient((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveNew() {
    if (!newClient.nome.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const created: Client = {
      id: String(mockClients.length + 1).padStart(3, "0"),
      nome: newClient.nome,
      tipo: newClient.tipo,
    };
    setSaving(false);
    setNewClient(emptyNewClient());
    handleSelect(created);
  }

  function handleClose() {
    onClose();
    setQuery("");
    setTab("search");
  }

  return (
    <Modal
      title="Clientes"
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth={680}
    >
      <div className="client-modal">
        <div className="client-modal__tabs">
          <button
            className={`client-modal__tab${tab === "search" ? " client-modal__tab--active" : ""}`}
            type="button"
            onClick={() => setTab("search")}
          >
            <Search size={13} />
            Buscar Cliente
          </button>
          <button
            className={`client-modal__tab${tab === "new" ? " client-modal__tab--active" : ""}`}
            type="button"
            onClick={() => setTab("new")}
          >
            <UserPlus size={13} />
            Novo Cliente
          </button>
        </div>

        {tab === "search" && (
          <div className="client-modal__search">
            <Input
              placeholder="Buscar por nome, ID ou documento..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="client-table-wrapper">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="client-table__empty">
                        Nenhum cliente encontrado.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="client-table__row"
                        onClick={() => handleSelect(c)}
                      >
                        <td className="client-table__id">{c.id}</td>
                        <td>{c.nome}</td>
                        <td>
                          <span
                            className={`client-type-badge client-type-badge--${c.tipo}`}
                          >
                            {CLIENT_TYPE_LABELS[c.tipo]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "new" && (
          <div className="client-modal__new">
            <div className="frow frow--2">
              <Input
                label="Nome"
                value={newClient.nome}
                onChange={(e) => handleNewChange("nome", e.target.value)}
                placeholder="Nome completo ou razão social"
              />
              <Select
                label="Tipo"
                value={newClient.tipo}
                onChange={(e) => handleNewChange("tipo", e.target.value)}
                options={CLIENT_TYPE_OPTIONS}
              />
            </div>
            <div className="client-modal__new-footer">
              <Button
                variant="primary"
                loading={saving}
                disabled={!newClient.nome.trim()}
                onClick={handleSaveNew}
              >
                <UserPlus size={14} />
                Cadastrar e Selecionar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
