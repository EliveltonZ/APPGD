import {
  ShoppingBag,
  Factory,
  Truck,
  DollarSign,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "../../components/Layout/AppLayout";
import { SummaryCard } from "../../components/SummaryCard";
import "./index.css";

interface StatCard {
  id: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string;
}

const valuesBase = ["-", "-", "-", "-"];

const stats: StatCard[] = [
  {
    id: "pedidos",
    label: "Pedidos Abertos",
    value: valuesBase[0],
    icon: ShoppingBag,
    accent: "var(--accent)",
  },
  {
    id: "producao",
    label: "Em Produção",
    value: valuesBase[1],
    icon: Factory,
    accent: "#f97316",
  },
  {
    id: "expedicao",
    label: "Em Expedição",
    value: valuesBase[2],
    icon: Truck,
    accent: "#16a34a",
  },
  {
    id: "financeiro",
    label: "Valores Pendentes",
    value: valuesBase[3],
    icon: DollarSign,
    accent: "var(--accent2)",
  },
];

export function MenuPage() {
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
