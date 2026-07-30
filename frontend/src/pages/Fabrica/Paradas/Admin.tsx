import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { useToast } from '../../../context/ToastContext';
import {
  fetchMaquinas, fetchTodasParadas, editarParada, fetchHistorico,
  type Maquina, type ParadaRow, type HistoricoRow, type EditarParadaPayload,
} from '../../../services/paradas';
import './Paradas.css';

function fmtDt(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function toInputDt(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}

const CAMPO_LABEL: Record<string, string> = {
  pedido:      'Pedido',
  data_inicio: 'Início',
  data_fim:    'Fim',
  id_maquina:  'Máquina',
};

export function ParadasAdminPage() {
  const toast = useToast();

  const [maquinas,  setMaquinas]  = useState<Maquina[]>([]);
  const [paradas,   setParadas]   = useState<ParadaRow[]>([]);
  const [loading,   setLoading]   = useState(false);

  // Filtros
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const [filtroDe,      setFiltroDe]      = useState('');
  const [filtroAte,     setFiltroAte]     = useState('');

  // Modal de edição
  const [editando,   setEditando]   = useState<ParadaRow | null>(null);
  const [editForm,   setEditForm]   = useState<EditarParadaPayload>({});
  const [saving,     setSaving]     = useState(false);

  // Modal de histórico
  const [historico,     setHistorico]     = useState<HistoricoRow[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [histParada,    setHistParada]    = useState<ParadaRow | null>(null);

  useEffect(() => {
    fetchMaquinas().then(setMaquinas);
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchTodasParadas({
        id_maquina:      filtroMaquina ? Number(filtroMaquina) : undefined,
        data_inicio_de:  filtroDe  ? `${filtroDe}T00:00:00` : undefined,
        data_inicio_ate: filtroAte ? `${filtroAte}T23:59:59` : undefined,
      });
      setParadas(rows);
    } finally {
      setLoading(false);
    }
  }, [filtroMaquina, filtroDe, filtroAte]);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirEdicao(p: ParadaRow) {
    setEditando(p);
    setEditForm({
      pedido:      p.pedido,
      data_inicio: p.data_inicio ?? undefined,
      data_fim:    p.data_fim ?? undefined,
      id_maquina:  p.id_maquina,
    });
  }

  async function salvarEdicao() {
    if (!editando) return;
    setSaving(true);
    try {
      await editarParada(editando.id, editForm);
      toast.success('Parada atualizada');
      setEditando(null);
      carregar();
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function abrirHistorico(p: ParadaRow) {
    setHistParada(p);
    const rows = await fetchHistorico(p.id);
    setHistorico(rows);
    setShowHistorico(true);
  }

  return (
    <AppLayout pageTitle="Admin — Paradas de Máquina">
      <div className="paradas-admin">

        {/* Filtros */}
        <div className="paradas-card paradas-filtros">
          <div className="paradas-field">
            <label>Máquina</label>
            <select value={filtroMaquina} onChange={e => setFiltroMaquina(e.target.value)}>
              <option value="">Todas</option>
              {maquinas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div className="paradas-field">
            <label>Início de</label>
            <input type="date" value={filtroDe} onChange={e => setFiltroDe(e.target.value)} />
          </div>
          <div className="paradas-field">
            <label>Início até</label>
            <input type="date" value={filtroAte} onChange={e => setFiltroAte(e.target.value)} />
          </div>
        </div>

        {/* Tabela */}
        <div className="paradas-card">
          {loading ? (
            <p className="paradas-empty">Carregando...</p>
          ) : paradas.length === 0 ? (
            <p className="paradas-empty">Nenhuma parada encontrada.</p>
          ) : (
            <div className="paradas-table-wrap">
              <table className="paradas-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Tipo</th><th>Pedido</th><th>Máquina</th>
                    <th>Início</th><th>Fim</th><th>Duração</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {paradas.map(p => {
                    const dur = p.data_inicio && p.data_fim
                      ? Math.round((new Date(p.data_fim).getTime() - new Date(p.data_inicio).getTime()) / 60000)
                      : null;
                    return (
                      <tr key={p.id} className={!p.data_fim ? 'paradas-table__row--aberta' : ''}>
                        <td>{p.id}</td>
                        <td>{p.tipo}</td>
                        <td>{p.pedido}</td>
                        <td>{p.maquina}</td>
                        <td>{fmtDt(p.data_inicio)}</td>
                        <td>{fmtDt(p.data_fim)}</td>
                        <td>{dur != null ? `${dur} min` : !p.data_fim ? '⚠ Em aberto' : '—'}</td>
                        <td className="paradas-table__actions">
                          <button onClick={() => abrirEdicao(p)}>Editar</button>
                          <button onClick={() => abrirHistorico(p)}>Histórico</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal edição */}
      {editando && (
        <div className="paradas-modal-overlay" onClick={() => setEditando(null)}>
          <div className="paradas-modal" onClick={e => e.stopPropagation()}>
            <h3>Editar Parada #{editando.id}</h3>

            <div className="paradas-form">
              <div className="paradas-field">
                <label>Pedido</label>
                <input type="number" value={editForm.pedido ?? ''} onChange={e =>
                  setEditForm(f => ({ ...f, pedido: Number(e.target.value) }))} />
              </div>
              <div className="paradas-field">
                <label>Máquina</label>
                <select value={editForm.id_maquina ?? ''} onChange={e =>
                  setEditForm(f => ({ ...f, id_maquina: Number(e.target.value) }))}>
                  {maquinas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div className="paradas-field">
                <label>Data/Hora Início</label>
                <input type="datetime-local" value={toInputDt(editForm.data_inicio)} onChange={e =>
                  setEditForm(f => ({ ...f, data_inicio: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
              </div>
              <div className="paradas-field">
                <label>Data/Hora Fim</label>
                <input type="datetime-local" value={toInputDt(editForm.data_fim)} onChange={e =>
                  setEditForm(f => ({ ...f, data_fim: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
              </div>
            </div>

            <div className="paradas-actions">
              <button className="paradas-btn paradas-btn--finalizar" onClick={salvarEdicao} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button className="paradas-btn" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal histórico */}
      {showHistorico && (
        <div className="paradas-modal-overlay" onClick={() => setShowHistorico(false)}>
          <div className="paradas-modal paradas-modal--large" onClick={e => e.stopPropagation()}>
            <h3>Histórico — Parada #{histParada?.id}</h3>
            {historico.length === 0 ? (
              <p className="paradas-empty">Nenhuma alteração registrada.</p>
            ) : (
              <div className="paradas-table-wrap">
                <table className="paradas-table">
                  <thead>
                    <tr><th>Campo</th><th>Anterior</th><th>Novo</th><th>Alterado por</th><th>Data</th></tr>
                  </thead>
                  <tbody>
                    {historico.map(h => (
                      <tr key={h.id}>
                        <td>{CAMPO_LABEL[h.campo] ?? h.campo}</td>
                        <td>{h.valor_anterior ?? '—'}</td>
                        <td>{h.valor_novo ?? '—'}</td>
                        <td>{h.alterado_por_nome ?? '—'}</td>
                        <td>{fmtDt(h.alterado_em)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="paradas-actions">
              <button className="paradas-btn" onClick={() => setShowHistorico(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
