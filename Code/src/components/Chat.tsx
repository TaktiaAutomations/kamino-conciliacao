import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../agent";
import type { Persona } from "../personas";
import type { Balances, Approval } from "../store";
import { MessageView } from "./MessageView";

export function Chat({
  messages,
  persona,
  balances,
  resolvedSet,
  approvals,
  llmBusy,
  quickChips,
  onSend,
  onResolve,
}: {
  messages: ChatMessage[];
  persona: Persona;
  balances: Balances;
  resolvedSet: Set<string>;
  approvals: Approval[];
  llmBusy: boolean;
  quickChips: string[];
  onSend: (t: string) => void;
  onResolve: (k: string) => void;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (value?: string) => {
    const v = (value ?? text).trim();
    if (!v || llmBusy) return;
    onSend(v);
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 min-w-0">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-[760px] mx-auto space-y-4">
          {messages.map((m) => (
            <MessageView
              key={m.id}
              m={m}
              balances={balances}
              resolvedSet={resolvedSet}
              persona={persona.id}
              approvals={approvals}
              onResolve={onResolve}
              onChip={submit}
            />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div
        className="border-t border-gray-200 px-4 md:px-6 py-3"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)" }}
      >
        <div className="max-w-[760px] mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
            {quickChips.map((c) => (
              <button
                key={c}
                onClick={() => submit(c)}
                className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-navy-100 hover:bg-navy-50 hover:text-navy-600 transition-colors duration-120"
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder={
                persona.id === "dona"
                  ? "Pergunte em linguagem natural… ex.: “posso confiar no meu saldo?”"
                  : "Comande… ex.: “concilia tudo ≥ 90%” ou “zera a fila”"
              }
              className="focus-ring flex-1 resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 max-h-32"
            />
            <button
              onClick={() => submit()}
              disabled={llmBusy || !text.trim()}
              className="shrink-0 h-[42px] px-[18px] rounded-lg bg-navy-600 text-white text-sm font-semibold hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-120"
            >
              {llmBusy ? "…" : "Enviar"}
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-1.5 text-center">
            O agente concilia o exato, sugere o ambíguo e escala o que cria fato financeiro. Toda
            ação é reversível e auditável.
          </div>
        </div>
      </div>
    </div>
  );
}
