interface NotesSectionProps {
  value: string;
  onChange: (v: string) => void;
}

export function NotesSection({ value, onChange }: NotesSectionProps) {
  return (
    <div className="pfield pfield--full">
      <label className="pfield__label">Observações</label>
      <textarea
        className="pfield__textarea"
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Adicione observações sobre o pedido..."
      />
    </div>
  );
}
