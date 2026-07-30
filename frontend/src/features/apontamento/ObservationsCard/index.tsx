import { MessageSquare } from 'lucide-react';
import './index.css';

interface Props {
  observacoes: string | null;
}

export function ObservationsCard({ observacoes }: Props) {
  return (
    <div className="apt-obs">
      <div className="apt-obs__header">
        <MessageSquare size={15} />
        <h3 className="apt-obs__title">Observações</h3>
      </div>
      <div className="apt-obs__body">
        {observacoes
          ? <p className="apt-obs__text">{observacoes}</p>
          : <p className="apt-obs__empty">Sem observações.</p>
        }
      </div>
    </div>
  );
}
