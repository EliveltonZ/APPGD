import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { useApiData } from "../../../../hooks/useApiData";
import { fetchClients, saveClient } from "../../../../services/project";
import type { Client } from "../../../../types/project";
import "./index.css";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

type Tab = "search" | "new";

export function ClientModal({ isOpen, onClose, onSelect }: ClientModalProps) {
  const { data: clients = [], loading, refetch } = useApiData(fetchClients);
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [newNome, setNewNome] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(query.toLowerCase()) ||
      c.id.includes(query),
  );

  function handleSelect(client: Client) {
    onSelect(client);
    onClose();
    setQuery("");
  }

  async function handleSaveNew() {
    if (!newNome.trim()) return;
    setSaving(true);
    try {
      await saveClient(newNome.trim());
      setQuery(newNome.trim());
      setNewNome("");
      setTab("search");
      refetch();
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    onClose();
    setQuery("");
    setTab("search");
  }

  return (
    <Modal title="Clientes" isOpen={isOpen} onClose={handleClose} maxWidth={680}>
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
              placeholder="Buscar por nome ou ID..."
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
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="client-table__empty">
                        Carregando...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="client-table__empty">
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
            <div className="frow frow--1">
              <Input
                label="Nome"
                value={newNome}
                onChange={(e) => setNewNome(e.target.value)}
                placeholder="Nome completo ou razão social"
              />
            </div>
            <div className="client-modal__new-footer">
              <Button
                variant="primary"
                loading={saving}
                disabled={!newNome.trim()}
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
