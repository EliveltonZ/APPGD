import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import './index.css';

interface PcpActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function PcpActionCard({ icon: Icon, title, description, onClick }: PcpActionCardProps) {
  return (
    <button type="button" className="pcp-action-card" onClick={onClick}>
      <div className="pcp-action-card__icon">
        <Icon size={22} />
      </div>
      <div className="pcp-action-card__body">
        <p className="pcp-action-card__title">{title}</p>
        <p className="pcp-action-card__desc">{description}</p>
      </div>
      <ChevronRight size={16} className="pcp-action-card__arrow" />
    </button>
  );
}
