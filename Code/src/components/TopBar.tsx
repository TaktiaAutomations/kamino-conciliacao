import { useState } from "react";
import { History, Search, Zap, HelpCircle, Bell, ChevronDown, LogOut } from "lucide-react";
import type { Persona } from "../personas";

export function TopBar({
  persona,
  org,
  onLogout,
}: {
  persona: Persona;
  org: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="shrink-0 bg-white border-b border-gray-200 h-[58px] flex items-center gap-3 px-4">
      <button
        className="w-9 h-9 rounded-md border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Histórico"
      >
        <History size={18} strokeWidth={2} />
      </button>

      <div className="relative w-full max-w-[320px]">
        <Search
          size={16}
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          placeholder="Ir para…"
          className="focus-ring w-full h-[42px] rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <button className="h-[42px] shrink-0 px-4 rounded-md bg-navy-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-navy-700 transition-colors">
        <Zap size={16} strokeWidth={2} className="fill-white" />
        Atalhos
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button
          className="w-9 h-9 rounded-md text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Ajuda"
        >
          <HelpCircle size={18} strokeWidth={2} />
        </button>
        <button
          className="relative w-9 h-9 rounded-md text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Notificações"
        >
          <Bell size={18} strokeWidth={2} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral-500 border-2 border-white" />
        </button>

        {/* conta — clique abre menu com Sair */}
        <div className="relative pl-1 ml-1">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-2 h-10 pl-1 pr-2 rounded-md transition-colors ${
              open ? "bg-gray-50" : "hover:bg-gray-50"
            }`}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: persona.cor }}
            >
              {persona.iniciais}
            </span>
            <span className="hidden md:inline text-sm font-semibold text-navy-600">
              {persona.nome}@{org}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-lg border border-gray-200 bg-white shadow-lg py-1.5">
                <div className="px-3 py-2 flex items-center gap-2.5 border-b border-gray-100">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ background: persona.cor }}
                  >
                    {persona.iniciais}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{persona.nome}</div>
                    <div className="text-[11px] text-muted truncate">{persona.cargo}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={16} strokeWidth={2} className="text-gray-500" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
