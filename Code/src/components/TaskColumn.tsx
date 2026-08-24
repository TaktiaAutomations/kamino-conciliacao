import { useState } from "react";
import { Plus, X, PanelLeftClose, History } from "lucide-react";
import type { Task } from "../store";
import { capabilities } from "../capabilities";

export function TaskColumn({
  tasks,
  activeTaskId,
  onNew,
  onOpen,
  onClose,
}: {
  tasks: Task[];
  activeTaskId: string | null;
  onNew: () => void;
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-[56px] shrink-0 border-r border-gray-200 bg-white hidden md:flex flex-col items-center py-3 gap-1.5 h-full">
        <button
          onClick={onNew}
          title="Nova conversa"
          className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
            activeTaskId === null
              ? "bg-navy-600 text-white"
              : "text-navy-600 hover:bg-navy-50"
          }`}
        >
          <Plus size={18} strokeWidth={2.4} />
        </button>
        <button
          onClick={() => setCollapsed(false)}
          title="Histórico de conversas"
          className="w-9 h-9 rounded-md text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <History size={18} strokeWidth={2} />
        </button>

        {tasks.length > 0 && <div className="w-7 h-px bg-gray-200 my-1" />}

        <div className="flex flex-col items-center gap-1 overflow-y-auto">
          {tasks.map((t) => {
            const cap = capabilities[t.capability];
            const Icon = cap.icon;
            const active = t.id === activeTaskId;
            return (
              <button
                key={t.id}
                onClick={() => onOpen(t.id)}
                title={t.title}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                  active ? "bg-navy-50" : "hover:bg-gray-50"
                }`}
                style={{ color: cap.cor }}
              >
                <Icon size={17} strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[248px] shrink-0 border-r border-gray-200 bg-white hidden md:flex flex-col h-full">
      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onNew}
          className={`flex-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            activeTaskId === null
              ? "bg-navy-600 text-white"
              : "border border-gray-300 text-navy-600 hover:bg-navy-50"
          }`}
        >
          <Plus size={16} strokeWidth={2.4} />
          Nova task
        </button>
        <button
          onClick={() => setCollapsed(true)}
          title="Recolher conversas"
          className="shrink-0 w-9 h-9 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
        >
          <PanelLeftClose size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-400">
          Conversas
        </div>
        {tasks.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-gray-400 leading-relaxed">
            Nenhuma conversa ainda.
            <br />
            Diga ao assistente o que você precisa para começar.
          </div>
        ) : (
          <div className="space-y-0.5">
            {tasks.map((t) => {
              const cap = capabilities[t.capability];
              const Icon = cap.icon;
              const active = t.id === activeTaskId;
              return (
                <div
                  key={t.id}
                  onClick={() => onOpen(t.id)}
                  className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 cursor-pointer transition-colors ${
                    active ? "bg-navy-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${cap.cor}14`, color: cap.cor }}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-semibold leading-tight truncate ${
                        active ? "text-navy-700" : "text-ink"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[10px] text-muted truncate">{cap.label}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(t.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-coral-500 transition shrink-0"
                    title="Fechar conversa"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed">
        Uma conversa por assunto. O assistente mantém o contexto de cada uma.
      </div>
    </aside>
  );
}
