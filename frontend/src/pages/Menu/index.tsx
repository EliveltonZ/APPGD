import { useState } from "react";
import {
  FileText,
  ShoppingBag,
  Factory,
  Truck,
  DollarSign,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "../../components/Layout/AppLayout";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { SummaryCard } from "../../components/SummaryCard";
import "./index.css";

interface StatCard {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}

const stats: StatCard[] = [
  {
    id: "pedidos",
    label: "Pedidos Abertos",
    value: "—",
    icon: ShoppingBag,
    accent: "var(--accent)",
  },
  {
    id: "producao",
    label: "Em Produção",
    value: "—",
    icon: Factory,
    accent: "#f97316",
  },
  {
    id: "expedicao",
    label: "Em Expedição",
    value: "—",
    icon: Truck,
    accent: "#16a34a",
  },
  {
    id: "financeiro",
    label: "Valores Pendentes",
    value: "—",
    icon: DollarSign,
    accent: "var(--accent2)",
  },
];

const reportItems = [
  "Relatório de Pedidos",
  "Relatório de Produção",
  "Relatório Financeiro",
  "Relatório de Expedição",
  "Relatório de Assistências",
];

export function MenuPage() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <AppLayout pageTitle="Painel Principal">
      <div className="dashboard">
        <div className="dashboard__top">
          <div className="dashboard__heading">
            <h1 className="dashboard__title">Painel Principal</h1>
            <p className="dashboard__subtitle">Bem-vindo ao sistema GD</p>
          </div>
        </div>

        <div className="dashboard__stats">
          {stats.map(({ id, label, value, icon: Icon, accent }) => (
            <SummaryCard
              key={id}
              label={label}
              value={value}
              accent={accent}
              icon={<Icon size={13} />}
            />
          ))}
        </div>

        <div className="dashboard__area">
          <div className="dashboard__placeholder">
            <LayoutDashboard
              size={36}
              className="dashboard__placeholder-icon"
            />
            <p className="dashboard__placeholder-title">Área de conteúdo</p>
            <span className="dashboard__placeholder-desc">
              Selecione um item no menu lateral para navegar
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
