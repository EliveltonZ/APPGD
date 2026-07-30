import { AlertTriangle, Minus } from 'lucide-react';

interface TableFlagProps {
  active: boolean;
}

export function TableFlag({ active }: TableFlagProps) {
  return active ? (
    <AlertTriangle size={13} className="tbl-flag tbl-flag--pendente" />
  ) : (
    <Minus size={12} className="tbl-flag tbl-flag--ok" />
  );
}
