import { useState } from "react";
import { SendHorizontal, ShieldCheck, TrendingUp } from "lucide-react";
import type { Persona } from "../personas";
import { brl } from "../data";
import { capabilities, launcherSuggestions, type CapabilityId } from "../capabilities";

const SALDO_CONCILIADO = 12305;

export function Launcher({
  persona,
  pendingApprovals = 0,
  onSubmit,
}: {
  persona: Persona;
  pendingApprovals?: number;
  onSubmit: (text: string, cap?: CapabilityId) => void;
}) {
  const [text, setText] = useState("");
  const firstName = persona.nome.split(" ")[0];
  const suggestions = launcherSuggestions[persona.id];

  const submit = (value?: string, cap?: CapabilityId) => {
    const v = (value ?? text).trim();
    if (!v) return;
    onSubmit(v, cap);
    setText("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <img src="/kamino-icon.png" alt="" width={40} height={40} style={{ borderRadius: 8 }} />
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-navy-600">
            Assistente Kamino
          </div>
        </div>
        <h1 className="text-[28px] font-bold text-ink leading-tight">
          Como posso ajudar, {firstName}?
        </h1>
        <p className="text-muted mt-1">
          Descreva o que precisa em linguagem natural — eu detecto a intenção e abro a tarefa
          certa. Uma conversa por assunto; alterne quando quiser.
        </p>

        {/* home da dona — parte do saldo JÁ CONCILIADO (a base confiável) */}
        {persona.id === "dona" && (
          <div className="mt-6 rounded-xl border border-gray-300 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[11px] uppercase tracking-[0.04em] text-muted">
                  Saldo conciliado · junho
                </div>
                <div className="text-[28px] font-bold text-navy-600 tabular-nums leading-tight">
                  {brl(SALDO_CONCILIADO)}
                </div>
                <div className="text-[11px] font-semibold text-kgreen-700 flex items-center gap-1.5 mt-0.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-kgreen-50 text-kgreen-700 flex items-center justify-center text-[9px]">
                    ✓
                  </span>
                  conciliado · 7 de 7 linhas do extrato
                </div>
              </div>
              <button
                onClick={() =>
                  onSubmit("Projetar o fluxo de caixa a partir do saldo conciliado", "caixa")
                }
                className="inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2.5 rounded-lg bg-navy-600 text-white hover:bg-navy-700 transition-colors"
              >
                <TrendingUp size={16} strokeWidth={2} />
                Projetar meu fluxo de caixa
              </button>
            </div>
            <p className="text-[11px] text-muted mt-2.5">
              Base confiável para as suas decisões — o time conciliou o extrato de junho e o saldo
              interno bate com o banco.
            </p>
          </div>
        )}

        {/* banner de aprovações pendentes — dona (checker) */}
        {persona.id === "dona" && pendingApprovals > 0 && (
          <button
            onClick={() => onSubmit("Revisar aprovações pendentes", "aprovacoes")}
            className="mt-5 w-full flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-50 px-4 py-3 text-left hover:brightness-[0.98] transition"
          >
            <span className="w-9 h-9 rounded-lg bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">
                {pendingApprovals} {pendingApprovals > 1 ? "itens aguardam" : "item aguarda"} sua aprovação
              </div>
              <div className="text-[11px] text-orange-700">
                O time preparou e enviou — decida no ponto de risco. →
              </div>
            </div>
          </button>
        )}

        {/* caixa de intenção */}
        <div className="mt-6 rounded-xl border border-gray-300 bg-white shadow-sm p-2 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ex.: “concilie o extrato de junho”, “o que vence essa semana?”, “como está meu caixa?”"
            className="focus:outline-none flex-1 resize-none px-3 py-2 text-sm text-gray-900 bg-transparent max-h-40"
          />
          <button
            onClick={() => submit()}
            disabled={!text.trim()}
            className="shrink-0 h-10 w-10 rounded-lg bg-navy-600 text-white flex items-center justify-center hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Enviar"
          >
            <SendHorizontal size={18} strokeWidth={2} />
          </button>
        </div>

        {/* sugestões por papel */}
        <div className="mt-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted mb-3">
            Sugestões para o seu dia
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {suggestions.map((s, i) => {
              const cap = capabilities[s.cap];
              const Icon = cap.icon;
              return (
                <button
                  key={i}
                  onClick={() => submit(s.phrase, s.cap)}
                  className="group text-left rounded-xl border border-gray-300 bg-white hover:border-navy-600 hover:shadow-sm transition p-4 flex gap-3"
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${cap.cor}14`, color: cap.cor }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink leading-snug">
                      “{s.phrase}”
                    </div>
                    <div className="text-[11px] text-muted mt-1">{cap.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
