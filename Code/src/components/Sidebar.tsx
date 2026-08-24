import { useState } from "react";
import {
  Sparkles,
  LayoutGrid,
  Barcode,
  HandCoins,
  Landmark,
  CreditCard,
  ChartColumn,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { KaminoLogo } from "./Logo";

interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  novelty?: boolean;
}

/** O item agêntico é o PRIMEIRO — a novidade — e convive com o menu do sistema. */
const agentItem: NavItem = { icon: Sparkles, label: "Assistente", active: true, novelty: true };

const systemNav: NavItem[] = [
  { icon: LayoutGrid, label: "Painel" },
  { icon: Barcode, label: "Pagar" },
  { icon: HandCoins, label: "Receber" },
  { icon: Landmark, label: "Contas" },
  { icon: CreditCard, label: "Cartões" },
  { icon: ChartColumn, label: "Relatórios" },
  { icon: MoreHorizontal, label: "Mais" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);

  if (collapsed) return <CollapsedRail onExpand={() => setCollapsed(false)} />;

  return (
    <nav className="w-[232px] shrink-0 bg-white border-r border-gray-200 hidden lg:flex flex-col py-4 h-full">
      <div className="flex items-center gap-2.5 px-5 pb-4 mb-2 border-b border-gray-100">
        <KaminoLogo size={34} />
        <div className="leading-tight min-w-0">
          <div className="font-bold text-sm text-ink truncate">acme</div>
          <div className="text-[11px] text-muted truncate">acme.kamino.pro</div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Recolher menu"
          className="ml-auto shrink-0 w-7 h-7 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <PanelLeftClose size={18} strokeWidth={2} />
        </button>
      </div>

      {/* item agêntico — a novidade */}
      <div className="px-3">
        <ExpandedItem item={agentItem} />
      </div>

      {/* menu atual do sistema */}
      <div className="px-3 mt-4">
        <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-400">
          Sistema
        </div>
        <div className="space-y-0.5">
          {systemNav.map((n) => (
            <ExpandedItem key={n.label} item={n} />
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 text-[10px] text-gray-400">Protótipo · case PM</div>
    </nav>
  );
}

function ExpandedItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <div
      className={`group flex items-center gap-3 rounded-md cursor-pointer transition-colors duration-120 ${
        item.active
          ? "bg-lime-brand text-navy-900 font-semibold"
          : "text-gray-600 font-medium hover:bg-lime-brand hover:text-navy-900"
      }`}
      style={{ padding: "10px 14px", fontSize: 14 }}
    >
      <Icon
        size={18}
        strokeWidth={2}
        className={item.active ? "text-navy-900" : "text-gray-500 group-hover:text-navy-900"}
      />
      <span>{item.label}</span>
      {item.novelty && (
        <span className="ml-auto text-[9px] font-bold tracking-wide bg-navy-900 text-white px-1.5 py-0.5 rounded-full">
          IA
        </span>
      )}
    </div>
  );
}

/* —————————————— rail colapsado: barra azul-escura da logo —————————————— */
function CollapsedRail({ onExpand }: { onExpand: () => void }) {
  return (
    <nav
      className="w-[64px] shrink-0 hidden lg:flex flex-col items-center py-4 h-full"
      style={{ background: "#001e36" }}
    >
      <KaminoLogo size={32} />

      <button
        onClick={onExpand}
        title="Expandir menu"
        className="mt-3 w-9 h-9 rounded-md text-gray-300 hover:text-white flex items-center justify-center transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <PanelLeftOpen size={18} strokeWidth={2} />
      </button>

      <div className="mt-3 w-8 h-px bg-white/10" />

      {/* item agêntico */}
      <div className="mt-3">
        <RailItem item={agentItem} />
      </div>

      <div className="mt-3 w-8 h-px bg-white/10" />

      {/* menu do sistema */}
      <div className="mt-3 flex flex-col items-center gap-1.5">
        {systemNav.map((n) => (
          <RailItem key={n.label} item={n} />
        ))}
      </div>
    </nav>
  );
}

function RailItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <button
      title={item.label}
      className={`group relative w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-120 cursor-pointer ${
        item.active ? "bg-lime-brand" : "hover:bg-lime-brand"
      }`}
    >
      <Icon
        size={20}
        strokeWidth={2}
        className={item.active ? "text-navy-900" : "text-gray-300 group-hover:text-navy-900"}
      />
      {item.novelty && !item.active && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-lime-brand" />
      )}
    </button>
  );
}
