import type { ChatMessage } from "../agent";
import { md } from "../lib/md";
import { CaseCard, ResolvedNote } from "./CaseCard";
import { CapabilityCard } from "./CapabilityCard";
import { MiniBalances } from "./TopBalances";
import type { Balances, Approval } from "../store";
import type { PersonaId } from "../personas";

export function MessageView({
  m,
  balances,
  resolvedSet,
  persona,
  approvals,
  onResolve,
  onChip,
}: {
  m: ChatMessage;
  balances: Balances;
  resolvedSet: Set<string>;
  persona: PersonaId;
  approvals: Approval[];
  onResolve: (k: string) => void;
  onChip: (t: string) => void;
}) {
  const isUser = m.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-msg-in">
        <div
          className="max-w-[78%] bg-navy-600 text-white px-3.5 py-2.5 text-sm shadow-xs"
          style={{ borderRadius: "16px 16px 4px 16px" }}
        >
          {m.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-msg-in">
      <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
        <img src="/kamino-icon.png" alt="" width={20} height={20} style={{ objectFit: "contain" }} />
      </div>
      <div className="max-w-[82%] space-y-2 min-w-0">
        {m.pending ? (
          <div
            className="inline-flex items-center gap-1 bg-white border border-gray-300 px-4 py-3 shadow-xs w-fit"
            style={{ borderRadius: "16px 16px 16px 4px" }}
          >
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span
              className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        ) : (
          <>
            {m.text && (
              <div
                className="bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-700 shadow-xs"
                style={{ borderRadius: "16px 16px 16px 4px", lineHeight: 1.55 }}
              >
                {md(m.text)}
              </div>
            )}

            {m.card?.kind === "case" && (
              <CaseCard
                caseKey={m.card.caseKey}
                resolved={resolvedSet.has(m.card.caseKey)}
                onResolve={onResolve}
              />
            )}
            {m.card?.kind === "resolvedNote" && <ResolvedNote caseKey={m.card.caseKey} />}
            {m.card?.kind === "balances" && <MiniBalances b={balances} />}
            {m.card?.kind === "capCard" && (
              <CapabilityCard
                cap={m.card.cap}
                view={m.card.view}
                persona={persona}
                approvals={approvals}
                onAction={onChip}
              />
            )}

            {m.chips && m.chips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {m.chips.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onChip(c)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-navy-100 bg-navy-50 text-navy-600 hover:bg-navy-100 transition-colors duration-120"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
