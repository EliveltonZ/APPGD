import { Modal as BaseModal } from '../../common/Modal';
import type { AssistanceProduction } from '../../../../types/assistenciaProducao';

interface Props {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSaved?: (updated: AssistanceProduction) => void;
}

export function Modal({ isOpen, id, onClose, onSaved }: Props) {
  return (
    <BaseModal isOpen={isOpen} id={id} onClose={onClose} onSaved={onSaved} logisticsMode />
  );
}
