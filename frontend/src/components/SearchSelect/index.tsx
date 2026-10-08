import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import "./index.css";

export interface SearchSelectOption {
  value: number;
  label: string;
  /** Texto extra usado na busca (ex.: código), não aparece na lista */
  searchHint?: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  maxResults?: number;
}

/**
 * Combobox com busca — pensado pra listas grandes (centenas/milhares de
 * itens), onde um <select> nativo obriga a rolar tudo pra achar um item.
 * Filtra por substring (case/acento-insensível) contra label + searchHint.
 */
export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  maxResults = 50,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const normalized = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filtered = useMemo(() => {
    const q = normalized(query.trim());
    const base = q
      ? options.filter(
          (o) => normalized(o.label).includes(q) || (o.searchHint && normalized(o.searchHint).includes(q)),
        )
      : options;
    return base.slice(0, maxResults);
  }, [options, query, maxResults]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function openList() {
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function pick(option: SearchSelectOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) pick(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div className="ssel" ref={wrapperRef}>
      <div className="ssel__field" onClick={openList}>
        <input
          ref={inputRef}
          className="ssel__input"
          type="text"
          value={open ? query : (selected?.label ?? "")}
          placeholder={selected ? undefined : placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={openList}
          onKeyDown={handleKeyDown}
        />
        {selected && !open && (
          <button
            type="button"
            className="ssel__clear"
            title="Limpar seleção"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
          >
            <X size={13} />
          </button>
        )}
        <ChevronDown size={14} className="ssel__chevron" />
      </div>

      {open && (
        <ul className="ssel__list" role="listbox">
          {filtered.length === 0 && <li className="ssel__empty">Nenhum material encontrado.</li>}
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`ssel__option${i === highlight ? " ssel__option--active" : ""}${opt.value === value ? " ssel__option--selected" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(opt);
              }}
              onMouseEnter={() => setHighlight(i)}
            >
              {opt.label}
            </li>
          ))}
          {filtered.length === maxResults && (
            <li className="ssel__hint">Mostrando os {maxResults} primeiros — digite para refinar.</li>
          )}
        </ul>
      )}
    </div>
  );
}
