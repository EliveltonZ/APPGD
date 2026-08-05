interface SectionFieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  type?: 'text' | 'date';
}

function brToISO(v: string): string {
  const [d, m, y] = v.split('/');
  return d && m && y ? `${y}-${m}-${d}` : '';
}

function isoToBR(v: string): string {
  const [y, m, d] = v.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

export function SectionField({ label, value, onChange, readOnly, placeholder, type = 'text' }: SectionFieldProps) {
  if (readOnly) {
    return (
      <div className="ap-read">
        <span className="ap-read__label">{label}</span>
        <span className="ap-read__value">{value || '—'}</span>
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div className="ap-field">
        <label className="ap-field__label">{label}</label>
        <input
          className="ap-field__input"
          type="date"
          value={brToISO(value)}
          onChange={(e) => onChange?.(e.target.value ? isoToBR(e.target.value) : '')}
        />
      </div>
    );
  }

  return (
    <div className="ap-field">
      <label className="ap-field__label">{label}</label>
      <input
        className="ap-field__input"
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
