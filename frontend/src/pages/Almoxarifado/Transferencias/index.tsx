import { useState, useCallback } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { DataTable } from '../../../components/DataTable';
import type { TableColumn } from '../../../components/DataTable';
import { Button } from '../../../components/Button';
import { Select } from '../../../components/Select';
import { Input } from '../../../components/Input';
import { useApiData } from '../../../hooks/useApiData';
import { useToast } from '../../../context/ToastContext';
import { fetchMateriais } from '../../../services/materiais';
import { fetchLocalizacoes } from '../../../services/localizacoes';
import {
  fetchSaldoMaterial,
  fetchTransferencias,
  criarTransferencia,
} from '../../../services/transferencias';
import type { Transferencia } from '../../../services/transferencias';
import './index.css';

function fmtQtd(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const HIST_COLUMNS: TableColumn<Transferencia>[] = [
  { key: 'data',               label: 'Data/Hora',  type: 'text', sortable: true, minWidth: 130, render: (v) => fmtDate(String(v)) },
  { key: 'codigo_interno',     label: 'Código',     type: 'text', sortable: true, filterable: true, minWidth: 90  },
  { key: 'material_descricao', label: 'Material',   type: 'text', sortable: true, filterable: true, minWidth: 200 },
  {
    key: 'qtd_un',
    label: 'Qtd (UN)',
    type: 'number',
    sortable: true,
    align: 'right',
    minWidth: 90,
    render: (v) => fmtQtd(Number(v)),
  },
  {
    key: 'origem_codigo',
    label: 'Movimento',
    type: 'text',
    sortable: false,
    minWidth: 160,
    render: (_v, row) => (
      <span className="transf-mov">
        {row.origem_codigo}{row.origem_descricao ? ` — ${row.origem_descricao}` : ''}
        <ArrowRight size={12} />
        {row.destino_codigo}{row.destino_descricao ? ` — ${row.destino_descricao}` : ''}
      </span>
    ),
  },
  { key: 'usuario_login', label: 'Usuário', type: 'text', sortable: true, filterable: true, minWidth: 100 },
];

const today = new Date().toISOString().slice(0, 10);

interface FormState {
  materialId:  string;
  origemId:    string;
  destinoId:   string;
  qtd:         string;
  data:        string;
  observacoes: string;
}

const emptyForm = (): FormState => ({
  materialId:  '',
  origemId:    '',
  destinoId:   '',
  qtd:         '',
  data:        today,
  observacoes: '',
});

export function AlmoxarifadoTransferenciasPage() {
  const toast = useToast();

  const { data: materiais  = [] } = useApiData(fetchMateriais);
  const { data: localizacoes = [] } = useApiData(fetchLocalizacoes);
  const { data: historico  = [], loading: loadingHist, refetch: recarregarHist } = useApiData(fetchTransferencias);

  const [form, setForm]   = useState<FormState>(emptyForm);
  const [saldo, setSaldo] = useState<{ localizacao_id: number; codigo: string; descricao: string | null; saldo: number }[]>([]);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const materiaisAtivos = materiais.filter((m) => m.ativo);

  const materialOptions = materiaisAtivos.map((m) => ({
    value: m.id,
    label: `${m.codigoInterno} — ${m.descricao}`,
  }));

  const origemOptions = saldo.map((s) => ({
    value: s.localizacao_id,
    label: `${s.codigo}${s.descricao ? ` — ${s.descricao}` : ''} (${fmtQtd(s.saldo)} UN)`,
  }));

  const destinoOptions = localizacoes
    .filter((l) => l.ativo && String(l.id) !== form.origemId)
    .map((l) => ({
      value: l.id,
      label: `${l.codigo}${l.descricao ? ` — ${l.descricao}` : ''}`,
    }));

  const saldoOrigem = saldo.find((s) => String(s.localizacao_id) === form.origemId)?.saldo ?? null;

  const fetchSaldo = useCallback(async (materialId: string) => {
    if (!materialId) { setSaldo([]); return; }
    setLoadingSaldo(true);
    try {
      const rows = await fetchSaldoMaterial(Number(materialId));
      setSaldo(rows);
    } catch {
      setSaldo([]);
    } finally {
      setLoadingSaldo(false);
    }
  }, []);

  function handleMaterialChange(materialId: string) {
    setForm((p) => ({ ...p, materialId, origemId: '', destinoId: '', qtd: '' }));
    setSaldo([]);
    fetchSaldo(materialId);
    setErrors({});
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.materialId) errs.materialId = 'Obrigatório';
    if (!form.origemId)   errs.origemId   = 'Obrigatório';
    if (!form.destinoId)  errs.destinoId  = 'Obrigatório';
    if (!form.qtd || isNaN(Number(form.qtd)) || Number(form.qtd) <= 0) {
      errs.qtd = 'Informe uma quantidade válida';
    } else if (saldoOrigem !== null && Number(form.qtd) > saldoOrigem) {
      errs.qtd = `Máximo disponível: ${fmtQtd(saldoOrigem)} UN`;
    }
    if (!form.data) errs.data = 'Obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await criarTransferencia({
        material_id:            Number(form.materialId),
        localizacao_origem_id:  Number(form.origemId),
        localizacao_destino_id: Number(form.destinoId),
        qtd_un:                 Number(form.qtd),
        data:                   form.data,
        observacoes:            form.observacoes || null,
      });
      toast.success('Transferência registrada com sucesso.');
      const mat = form.materialId;
      setForm({ ...emptyForm(), materialId: mat });
      setSaldo([]);
      fetchSaldo(mat);
      recarregarHist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao registrar transferência.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout pageTitle="Transferências">
      <div className="transf-page">
        {/* ── Formulário ─── */}
        <aside className="transf-form-panel">
          <h2 className="transf-panel-title">Nova Transferência</h2>
          <form className="transf-form" onSubmit={handleSubmit}>
            <Select
              label="Material *"
              options={materialOptions}
              value={form.materialId}
              onChange={(e) => handleMaterialChange(e.target.value)}
              error={errors.materialId}
              placeholder="Selecione o material..."
            />

            {/* Saldo por localização */}
            {form.materialId && (
              <div className="transf-saldo-wrap">
                <span className="transf-saldo-label">Saldo por localização</span>
                {loadingSaldo ? (
                  <p className="transf-saldo-loading">Carregando...</p>
                ) : saldo.length === 0 ? (
                  <p className="transf-saldo-vazio">Sem estoque neste material.</p>
                ) : (
                  <table className="transf-saldo-table">
                    <thead>
                      <tr>
                        <th>Localização</th>
                        <th className="transf-saldo-table__num">Saldo (UN)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saldo.map((s) => (
                        <tr key={s.localizacao_id}>
                          <td>{s.codigo}{s.descricao ? ` — ${s.descricao}` : ''}</td>
                          <td className="transf-saldo-table__num">{fmtQtd(s.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <Select
              label="Origem *"
              options={origemOptions}
              value={form.origemId}
              onChange={(e) => handleChange('origemId', e.target.value)}
              error={errors.origemId}
              placeholder="Localização de saída..."
              disabled={saldo.length === 0}
            />

            <div className="frow frow--2">
              <Input
                label="Quantidade (UN) *"
                type="number"
                min="0.001"
                step="0.001"
                value={form.qtd}
                onChange={(e) => handleChange('qtd', e.target.value)}
                error={errors.qtd}
                placeholder="0.000"
              />
              <Input
                label="Data *"
                type="date"
                value={form.data}
                onChange={(e) => handleChange('data', e.target.value)}
                error={errors.data}
              />
            </div>

            <Select
              label="Destino *"
              options={destinoOptions}
              value={form.destinoId}
              onChange={(e) => handleChange('destinoId', e.target.value)}
              error={errors.destinoId}
              placeholder="Localização de entrada..."
            />

            <Input
              label="Observações"
              value={form.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Opcional..."
            />

            <Button type="submit" variant="primary" loading={saving} style={{ width: '100%', marginTop: 4 }}>
              <Send size={14} />
              Registrar Transferência
            </Button>
          </form>
        </aside>

        {/* ── Histórico ─── */}
        <section className="transf-hist-panel">
          <h2 className="transf-panel-title">Histórico</h2>
          <DataTable
            columns={HIST_COLUMNS}
            data={historico}
            rowKey="id"
            loading={loadingHist}
            storageKey="transferencias-hist"
            emptyMessage="Nenhuma transferência registrada."
          />
        </section>
      </div>
    </AppLayout>
  );
}
