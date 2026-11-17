import { useState, useMemo, useEffect, type CSSProperties } from "react";
import { Printer } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { Barcode } from "../../../components/Barcode";
import { Button } from "../../../components/Button";
import { useToast } from "../../../context/ToastContext";
import { useApiData } from "../../../hooks/useApiData";
import { fetchAllUsers, gerarCracha } from "../../../services/usuarios";
import { fetchCoresSetor, salvarCorSetor, type CoresSetor } from "../../../services/corSetor";
import { getErrorMessage } from "../../../utils/errorMessage";
import logo from "../../../assets/gd-color.png";
import "./index.css";

const OPCOES_POR_FOLHA = [2, 4, 6, 8, 9, 10, 12, 15, 16];

// Cor neutra pra qualquer setor que ainda não teve uma cor definida —
// nunca fica sem faixa, mesmo um setor novo que acabou de surgir.
const COR_SETOR_PADRAO = "#475569";

// Paleta só pra sugerir um ponto de partida decente ao definir a cor de um
// setor novo — não é uma lista fixa de setores, é reciclada por índice.
const SUGESTOES_COR = [
  "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#dc2626",
  "#0891b2", "#52525b", "#be185d", "#059669", "#92400e",
  "#0d9488", "#ca8a04", "#4338ca",
];

function sugestaoCor(indice: number): string {
  return SUGESTOES_COR[indice % SUGESTOES_COR.length];
}

// Presets de colunas pra ficar com um grid arrumado nos casos comuns —
// cai pra raiz quadrada arredondada pra cima pra qualquer outro valor.
const COLUNAS_PRESET: Record<number, number> = {
  2: 1, 4: 2, 6: 2, 8: 2, 9: 3, 10: 2, 12: 3, 15: 3, 16: 4,
};

function colunasPara(n: number): number {
  return COLUNAS_PRESET[n] ?? Math.ceil(Math.sqrt(n));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normSetor(setor: string | null | undefined): string {
  return (setor ?? "").trim().toUpperCase();
}

export function ImpressaoCrachaPage() {
  const toast = useToast();
  const { data: rawUsers = [], loading, refetch } = useApiData(fetchAllUsers);
  const [soFabrica, setSoFabrica] = useState(true);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [porFolha, setPorFolha] = useState(8);
  const [gerandoId, setGerandoId] = useState<number | null>(null);
  const [cores, setCores] = useState<CoresSetor>({});
  const [coresCarregadas, setCoresCarregadas] = useState(false);

  useEffect(() => {
    fetchCoresSetor()
      .then((data) => {
        setCores(data);
        setCoresCarregadas(true);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Erro ao carregar cores dos setores.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lista = useMemo(
    () => rawUsers.filter((u) => u.ativo && (!soFabrica || (u.local ?? "").trim().toUpperCase() === "FABRICA")),
    [rawUsers, soFabrica],
  );

  const comCracha = useMemo(() => lista.filter((u) => u.crachaHash), [lista]);

  // Setores realmente presentes na lista atual, na ordem em que aparecem —
  // dinâmico de propósito: setor novo cadastrado em algum usuário já aparece
  // aqui pra receber uma cor, sem precisar editar código nenhum.
  const setoresDaLista = useMemo(() => {
    const vistos = new Set<string>();
    const out: string[] = [];
    for (const u of lista) {
      const s = normSetor(u.setor);
      if (s && !vistos.has(s)) {
        vistos.add(s);
        out.push(s);
      }
    }
    return out;
  }, [lista]);

  // Setor novo (nunca visto antes) ganha uma cor sugerida e já persiste no
  // banco — assim o seletor de cor e o próprio crachá nunca mostram cores
  // diferentes pro mesmo setor por estarem num "ainda sem cor" implícito.
  useEffect(() => {
    if (!coresCarregadas) return;
    setoresDaLista.forEach((setor, idx) => {
      if (!(setor in cores)) {
        handleCorChange(setor, sugestaoCor(idx));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coresCarregadas, setoresDaLista]);

  function corSetor(setor: string | null | undefined): string {
    const s = normSetor(setor);
    return cores[s] ?? COR_SETOR_PADRAO;
  }

  async function handleCorChange(setor: string, cor: string) {
    setCores((prev) => ({ ...prev, [setor]: cor }));
    try {
      await salvarCorSetor(setor, cor);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao salvar cor do setor."));
    }
  }

  // Ao trocar o filtro, reseleciona por padrão todo mundo que já tem
  // crachá na lista atual.
  useEffect(() => {
    setSelecionados(new Set(comCracha.map((u) => u.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soFabrica, rawUsers.length]);

  function toggle(id: number) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selecionados.size === comCracha.length) setSelecionados(new Set());
    else setSelecionados(new Set(comCracha.map((u) => u.id)));
  }

  async function handleGerar(id: number) {
    setGerandoId(id);
    try {
      await gerarCracha(id);
      await refetch();
      toast.success("Crachá gerado.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao gerar crachá."));
    } finally {
      setGerandoId(null);
    }
  }

  const paraImprimir = lista.filter((u) => selecionados.has(u.id) && u.crachaHash);
  const paginas = chunk(paraImprimir, porFolha);
  const cols = colunasPara(porFolha);
  const rows = Math.ceil(porFolha / cols);

  return (
    <AppLayout pageTitle="Imprimir Crachás">
      <div className="ic-page">
        <div className="ic-controls no-print">
          <div className="ic-controls__top">
            <div>
              <h1 className="ic-title">Imprimir Crachás</h1>
              <p className="ic-subtitle">
                Selecione os operadores e quantos crachás cabem por folha —
                depois é só imprimir e recortar.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              disabled={paraImprimir.length === 0}
            >
              <Printer size={14} />
              Imprimir ({paraImprimir.length})
            </Button>
          </div>

          <div className="ic-controls__row">
            <label className="ic-check">
              <input
                type="checkbox"
                checked={soFabrica}
                onChange={(e) => setSoFabrica(e.target.checked)}
              />
              Só setor Fábrica
            </label>

            <label className="ic-field">
              Crachás por folha
              <select value={porFolha} onChange={(e) => setPorFolha(Number(e.target.value))}>
                {OPCOES_POR_FOLHA.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          {setoresDaLista.length > 0 && (
            <div className="ic-cores">
              <span className="ic-cores__label">Cor por setor</span>
              <div className="ic-cores__list">
                {setoresDaLista.map((setor) => (
                  <label key={setor} className="ic-cores__item">
                    <input
                      type="color"
                      value={cores[setor] ?? COR_SETOR_PADRAO}
                      onChange={(e) => handleCorChange(setor, e.target.value)}
                    />
                    {setor}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="ic-list">
            <div className="ic-list__header">
              <label className="ic-check">
                <input
                  type="checkbox"
                  checked={comCracha.length > 0 && selecionados.size === comCracha.length}
                  onChange={toggleAll}
                />
                Selecionar todos com crachá ({comCracha.length})
              </label>
            </div>

            {loading ? (
              <p className="ic-list__empty">Carregando...</p>
            ) : lista.length === 0 ? (
              <p className="ic-list__empty">Nenhum usuário encontrado.</p>
            ) : (
              lista.map((u) => (
                <div key={u.id} className="ic-row">
                  <label className="ic-check ic-row__check">
                    <input
                      type="checkbox"
                      disabled={!u.crachaHash}
                      checked={selecionados.has(u.id)}
                      onChange={() => toggle(u.id)}
                    />
                    <span className="ic-row__nome">{u.login}</span>
                    <span className="ic-row__setor">{u.setor}</span>
                  </label>
                  {u.crachaHash ? (
                    <span className="ic-row__ok">Crachá pronto</span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleGerar(u.id)}
                      disabled={gerandoId === u.id}
                    >
                      {gerandoId === u.id ? "Gerando..." : "Gerar crachá"}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <p className="ic-preview-label no-print">Pré-visualização</p>

        <div className="ic-print-area">
          {paginas.length === 0 && (
            <p className="ic-print-area__empty no-print">
              Nenhum crachá selecionado pra imprimir.
            </p>
          )}
          {paginas.map((pagina, idx) => {
            const style: CSSProperties = {
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            };
            return (
              <div className="ic-sheet" key={idx} style={style}>
                {pagina.map((u) => (
                  <div
                    className="ic-badge"
                    key={u.id}
                    style={{ borderTopColor: corSetor(u.setor) }}
                  >
                    <span
                      className="ic-badge__furo"
                      title="Local sugerido pro furo do cordão"
                    />
                    <img src={logo} alt="" className="ic-badge__logo" />
                    <div className="ic-badge__nome">{u.login}</div>
                    <div className="ic-badge__setor-row">
                      <span
                        className="ic-badge__setor-dot"
                        style={{ background: corSetor(u.setor) }}
                      />
                      <span className="ic-badge__setor">{u.setor}</span>
                    </div>
                    <Barcode value={u.crachaHash ?? ""} className="ic-badge__barcode" />
                    <div className="ic-badge__id">Nº {u.id}</div>
                    <div className="ic-badge__codigo">{u.crachaHash}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
