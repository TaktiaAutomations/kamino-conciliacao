/* ————————————————————————————————————————————————————————————————
   PONTE OPCIONAL COM A CLAUDE (modo híbrido)
   Só é usada quando o usuário cola uma chave de API e o motor
   determinístico não reconhece a intenção. A demo NUNCA depende disto.

   Usa acesso direto do browser à API da Anthropic (header
   anthropic-dangerous-direct-browser-access). Em produção isso ficaria
   atrás de um backend — aqui é conveniência de protótipo.
———————————————————————————————————————————————————————————————— */
import { titulosSeed, extratoSeed, cases } from "./data";

const MODEL = "claude-opus-4-8";

function contexto(): string {
  return [
    "Você é o agente de conciliação da plataforma Kamino, falando em português do Brasil.",
    "Seja conciso, use tom de copiloto financeiro, e SEMPRE respeite a fronteira: você concilia correspondências exatas sozinho, sugere nas ambíguas e ESCALA para o humano qualquer criação de lançamento (tarifa/imposto). Nunca invente números.",
    "",
    "TÍTULOS EM ABERTO:",
    ...titulosSeed.map(
      (t) => `- ${t.id} | ${t.tipo} | ${t.contraparte} | R$ ${t.valor} | vence ${t.vencimento}`
    ),
    "",
    "EXTRATO DE JUNHO:",
    ...extratoSeed.map((e) => `- ${e.data} | ${e.valor} | ${e.historico}`),
    "",
    "SITUAÇÕES CONHECIDAS (não repita a explicação inteira, seja direto):",
    ...cases.map((c) => `- ${c.titulo} [${c.autonomia}] conf.${c.confianca}%`),
  ].join("\n");
}

export async function askClaude(apiKey: string, userText: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: contexto(),
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude respondeu ${res.status}. ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  return text || "Não consegui formular uma resposta agora.";
}
