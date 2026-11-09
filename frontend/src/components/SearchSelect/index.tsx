import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
 * Filtra por palavra (case/acento-insensível) contra label + searchHint —
 * cada palavra digitada precisa aparecer em algum lugar do texto, em
 * qualquer ordem (ex.: "35 branco" acha "FITA ... 35MM BRANCO TX" mesmo
 * sem as palavras estarem coladas uma na outra no cadastro).
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
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const normalized = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const filtered = useMemo(() => {
    const tokens = normalized(query.trim()).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return options.slice(0, maxResults);
    const base = options.filter((o) => {
      const texto = `${normalized(o.label)} ${o.searchHint ? normalized(o.searchHint) : ""}`;
      return tokens.every((t) => texto.includes(t));
    });
    return base.slice(0, maxResults);
  }, [options, query, maxResults]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      // A lista é renderizada via portal (fora da árvore de .ssel), pra não
      // ficar presa no scroll/clip de um ancestral (ex.: o corpo de um
      // modal) — por isso precisa checar os dois containers separadamente.
      if (
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Reposiciona a lista (portal) pra acompanhar o campo quando a página
  // rola ou a janela muda de tamanho, já que position:fixed não segue o
  // elemento sozinho.
  useLayoutEffect(() => {
    if (!open) return;
    function updateCoords() {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open]);

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
      <input
        ref={inputRef}
        className="ssel__input"
        type="text"
        value={open ? query : (selected?.label ?? "")}
        placeholder={selected ? undefined : placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={openList}
        onClick={openList}
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

      {open && coords &&
        createPortal(
          <ul
            ref={listRef}
            className="ssel__list"
            role="listbox"
            style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width }}
          >
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
          </ul>,
          document.body,
        )}
    </div>
  );
}
