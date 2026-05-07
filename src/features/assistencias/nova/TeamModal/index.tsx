import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '../../../../components/Modal';
import { Select } from '../../../../components/Select';
import type { TeamMember } from '../../../../types/assistencia';
import { MOCK_MONTADORES } from '../../../../data/assistenciaMocks';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipeAtual: TeamMember[];
  onAdd: (member: TeamMember) => void;
}

export function TeamModal({ isOpen, onClose, equipeAtual, onAdd }: TeamModalProps) {
  const [selectedId, setSelectedId] = useState('');

  const disponíveis = MOCK_MONTADORES.filter(
    (m) => !equipeAtual.some((e) => e.id === m.id),
  );

  function handleInsert() {
    const member = MOCK_MONTADORES.find((m) => String(m.id) === selectedId);
    if (!member) return;
    onAdd(member);
    setSelectedId('');
  }

  function handleClose() {
    setSelectedId('');
    onClose();
  }

  return (
    <Modal title="Equipe de Montagem" isOpen={isOpen} onClose={handleClose} maxWidth={440}>
      {disponíveis.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text)', margin: '0 0 16px' }}>
          Todos os montadores disponíveis já foram adicionados à equipe.
        </p>
      ) : (
        <Select
          label="Montador"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          options={disponíveis.map((m) => ({ value: m.id, label: m.nome }))}
          placeholder="Selecionar montador..."
        />
      )}

      <div className="as-modal-actions">
        <button className="as-btn as-btn--secondary" onClick={handleClose} type="button">
          Fechar
        </button>
        <button
          className="as-btn as-btn--primary"
          onClick={handleInsert}
          disabled={!selectedId || disponíveis.length === 0}
          type="button"
        >
          <UserPlus size={14} />
          Inserir Montador
        </button>
      </div>
    </Modal>
  );
}