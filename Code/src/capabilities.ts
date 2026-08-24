/* ————————————————————————————————————————————————————————————————
   CAPACIDADES DO ASSISTENTE — a camada de intenção do ERP.
   O assistente detecta a intenção e abre a "task" certa. A Conciliação
   é o fluxo profundo (pronto); as demais são intros honestas ("em
   desenho") que mostram a visão generalista sem estourar o escopo.
———————————————————————————————————————————————————————————————— */
import {
  ScanLine,
  Barcode,
  HandCoins,
  Wallet,
  ChartColumn,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { PersonaId } from "./personas";

export type CapabilityId =
  | "conciliacao"
  | "pagar"
  | "receber"
  | "caixa"
  | "relatorios"
  | "aprovacoes"
  | "geral";

export interface Capability {
  id: CapabilityId;
  label: string;
  icon: LucideIcon;
  /** frase curta do que resolve — usada no card do launcher */
  blurb: string;
  /** fluxo pronto ponta a ponta? (só a conciliação, nesta versão) */
  ready: boolean;
  cor: string;
}

export const capabilities: Record<CapabilityId, Capability> = {
  conciliacao: {
    id: "conciliacao",
    label: "Conciliação bancária",
    icon: ScanLine,
    blurb: "Bater o extrato contra os títulos e chegar a um saldo confiável.",
    ready: true,
    cor: "#05508a",
  },
  pagar: {
    id: "pagar",
    label: "Contas a pagar · captura",
    icon: Barcode,
    blurb: "Capturar boletos (DDA, e-mail), extrair os dados e montar o lote.",
    ready: false,
    cor: "#b42318",
  },
  aprovacoes: {
    id: "aprovacoes",
    label: "Aprovações",
    icon: ShieldCheck,
    blurb: "Revisar e aprovar, no ponto de risco, o que o time preparou.",
    ready: true,
    cor: "#6941c6",
  },
  receber: {
    id: "receber",
    label: "Contas a receber",
    icon: HandCoins,
    blurb: "Baixar recebimentos, cobrar atrasos e antecipar o que vem.",
    ready: false,
    cor: "#079455",
  },
  caixa: {
    id: "caixa",
    label: "Fluxo de caixa & saldo",
    icon: Wallet,
    blurb: "Responder “quanto tenho hoje?” e projetar o caixa da semana.",
    ready: false,
    cor: "#0a5da0",
  },
  relatorios: {
    id: "relatorios",
    label: "Relatórios & fechamento",
    icon: ChartColumn,
    blurb: "Fechar o mês, montar a DRE simplificada e exportar.",
    ready: false,
    cor: "#6941c6",
  },
  geral: {
    id: "geral",
    label: "Assistente",
    icon: Sparkles,
    blurb: "Me diga o que precisa — eu encontro o caminho.",
    ready: false,
    cor: "#05508a",
  },
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** classifica a intenção do texto livre numa capacidade. */
export function classifyIntent(text: string): CapabilityId {
  const t = norm(text);
  const hit = (...ws: string[]) => ws.some((w) => t.includes(w));

  if (hit("concili", "extrato", "bater", "confiar", "confio", "saldo confiavel", "fechar o caixa", "conferir"))
    return "conciliacao";
  if (hit("aprovac", "aprovaç", "revisar aprov", "pendente de aprov", "aprovar o lote", "aprovar lote"))
    return "aprovacoes";
  if (hit("pagar", "pagamento", "boleto", "captur", "fornecedor", "pix", "ted", "lote de pag", "vence"))
    return "pagar";
  if (hit("receber", "recebiment", "cobrar", "cobranca", "cliente", "atraso", "inadimpl"))
    return "receber";
  if (hit("caixa", "saldo", "fluxo", "quanto tenho", "projec", "disponivel"))
    return "caixa";
  if (hit("relatorio", "relatório", "fechamento", "dre", "exportar", "balanco", "balanço"))
    return "relatorios";
  return "geral";
}

/** título curto para a task, a partir do texto do usuário. */
export function titleFor(cap: CapabilityId, userText: string): string {
  if (cap === "conciliacao") return "Conciliação · junho 2026";
  if (cap === "aprovacoes") return "Aprovações pendentes";
  if (cap === "pagar") return "Contas a pagar · captura";
  const trimmed = userText.trim();
  if (trimmed.length > 0 && trimmed.length <= 42) return trimmed;
  if (trimmed.length > 42) return trimmed.slice(0, 40) + "…";
  return capabilities[cap].label;
}

/* —— sugestões do launcher, por papel —— */
export interface Suggestion {
  cap: CapabilityId;
  phrase: string;
}

export const launcherSuggestions: Record<PersonaId, Suggestion[]> = {
  // dona = aprovadora (checker): confiança e decisão no ponto de risco
  dona: [
    { cap: "aprovacoes", phrase: "Revisar aprovações pendentes" },
    { cap: "conciliacao", phrase: "Posso confiar no meu saldo de junho?" },
    { cap: "caixa", phrase: "Como está meu caixa esta semana?" },
    { cap: "relatorios", phrase: "Fecha o mês pra mim" },
  ],
  // analista = executor (maker): captura, prepara, concilia
  analista: [
    { cap: "conciliacao", phrase: "Conciliar o extrato de junho" },
    { cap: "pagar", phrase: "Capturar e preparar os pagamentos" },
    { cap: "receber", phrase: "Baixar os recebimentos do dia" },
    { cap: "relatorios", phrase: "Gerar o relatório de fechamento" },
  ],
};

/* —— intro de cada capacidade (resposta de abertura da task) —— */
const IR_CONCIL = "Ir para a Conciliação";

export function capabilityIntro(
  cap: CapabilityId
): { text: string; chips: string[] } {
  switch (cap) {
    case "receber":
      return {
        text:
          "Seu **a receber** em aberto — inclusive o **CR-003 da Sigma (R$ 2.500)**, que venceu e não caiu. Posso **preparar a cobrança** dela agora.",
        chips: [ACTIONS.receber.preparar],
      };
    case "caixa":
      return {
        text:
          "Seu **caixa** numa olhada — saldo de hoje e a base da projeção. Posso abrir a **projeção da semana** dia a dia.",
        chips: [ACTIONS.caixa.projecao, NAV.conciliacao],
      };
    case "relatorios":
      return {
        text:
          "Um resumo do **fechamento de junho** — entradas, saídas e saldo final. Posso **exportar** ou rodar o **checklist de fechamento**.",
        chips: [ACTIONS.relatorios.exportar, ACTIONS.relatorios.fechar],
      };
    case "pagar":
    case "conciliacao":
      // tratados com openers próprios na App
      return { text: "", chips: [] };
    default:
      return {
        text:
          "Sou o assistente do Kamino — opero o ERP a partir do que você pede: **conciliação, contas a pagar, contas a receber, fluxo de caixa e relatórios**. Detecto a intenção e abro a tarefa certa. Nesta versão, o fluxo **pronto ponta a ponta** é a Conciliação.",
        chips: [NAV.conciliacao, NAV.pagar, NAV.caixa],
      };
  }
}

/* —————————————————————————————————————————————————————————————
   AÇÕES por capacidade — cada uma é um rótulo de botão E um gatilho
   por palavra-chave (digitar aciona a mesma coisa). O engine abaixo
   leva a jornada do "overview" ao "resultado".
————————————————————————————————————————————————————————————— */
export const ACTIONS = {
  pagar: {
    lancar: "Lançar despesas no contas a pagar",
    enviar: "Enviar para aprovação",
    agendar: "Aprovar e agendar",
  },
  receber: { preparar: "Preparar cobrança da Sigma", enviar: "Enviar cobrança" },
  caixa: { projecao: "Ver projeção completa" },
  relatorios: { exportar: "Exportar (PDF / Excel)", fechar: "Fechar o mês" },
} as const;

/** rótulos de navegação entre capacidades (chips que abrem outra task) */
export const NAV = {
  conciliacao: "Abrir a conciliação",
  receber: "Ver contas a receber",
  aprovacoes: "Ver aprovações",
  pagar: "Ir para pagamentos",
  caixa: "Projetar o caixa",
} as const;

/* —— Captura de documentos: boletos capturados (DDA/e-mail) já com os
      dados extraídos e classificados pela IA. Alçada do analista = R$ 5.000. —— */
export const ALCADA_ANALISTA = 5000;

export interface BoletoCaptura {
  id: string;
  fornecedor: string;
  categoria: string;
  origem: "DDA" | "e-mail";
  valor: number;
  vencimento: string;
}

export const capturaBoletos: BoletoCaptura[] = [
  { id: "CP-001", fornecedor: "Alfa Tecnologia Ltda", categoria: "Tecnologia / SaaS", origem: "DDA", valor: 3200, vencimento: "05/06" },
  { id: "CP-002", fornecedor: "Beta Serviços ME", categoria: "Serviços terceirizados", origem: "e-mail", valor: 1500, vencimento: "10/06" },
  { id: "CP-003", fornecedor: "Beta Serviços ME", categoria: "Serviços terceirizados", origem: "e-mail", valor: 1500, vencimento: "10/06" },
  { id: "CP-004", fornecedor: "Beta Serviços ME", categoria: "Serviços terceirizados", origem: "e-mail", valor: 1500, vencimento: "10/06" },
  { id: "CP-005", fornecedor: "Gama Consultoria S/A", categoria: "Consultoria", origem: "e-mail", valor: 10000, vencimento: "12/06" },
  { id: "CP-006", fornecedor: "Delta Aluguéis Ltda", categoria: "Aluguel", origem: "DDA", valor: 8000, vencimento: "15/06" },
];

export const acimaDaAlcada = capturaBoletos.filter((b) => b.valor > ALCADA_ANALISTA); // Gama, Delta

export interface CapMsg {
  text?: string;
  card?: { kind: "capCard"; cap: CapabilityId; view: string };
  chips?: string[];
}

/** engine das jornadas em desenho: botão ou palavra-chave → mesmo resultado. */
export function respondCapability(cap: CapabilityId, userText: string): CapMsg[] {
  const t = norm(userText);
  const has = (...ws: string[]) => ws.some((w) => t.includes(w));
  const card = (view: string) => ({ kind: "capCard" as const, cap, view });

  if (cap === "receber") {
    if (has("enviar", "manda", "confirmar envio", "pode enviar", "dispara")) {
      return [
        {
          text:
            "**Cobrança enviada ✓** — por e-mail e WhatsApp para a Sigma. Reagendei um lembrete automático para daqui a 7 dias caso não haja retorno.",
        },
        { card: card("sent") },
        { text: "Quando o valor cair, eu concilio e te aviso." },
      ];
    }
    if (has("prepar", "cobr", "sigma", "atras", "rascunho")) {
      return [
        {
          text:
            "Preparei um **rascunho de cobrança** para a Sigma (CR-003, R$ 2.500, vencido em 20/06). Revise a mensagem e confirme — **eu não disparo sozinho**.",
        },
        { card: card("cobranca") },
        { chips: [ACTIONS.receber.enviar] },
      ];
    }
    return [
      {
        text: "Este é o seu **a receber** em aberto — inclusive a Sigma, que venceu e não caiu.",
        card: card("overview"),
        chips: [ACTIONS.receber.preparar],
      },
    ];
  }

  if (cap === "caixa") {
    if (has("projec", "semana", "proxim", "completa", "dias", "futuro")) {
      return [
        {
          text: "Aqui está a **projeção da semana** — saldo corrente dia a dia, já considerando o que entra e o que sai.",
        },
        { card: card("projecao") },
        {
          text: "O maior risco é o recebimento da Sigma — e o saldo-base vem da conciliação.",
          chips: [NAV.receber, NAV.conciliacao],
        },
      ];
    }
    return [
      {
        text: "Seu **caixa** numa olhada — saldo de hoje e a base da projeção.",
        card: card("overview"),
        chips: [ACTIONS.caixa.projecao, NAV.conciliacao],
      },
    ];
  }

  if (cap === "relatorios") {
    if (has("export", "pdf", "excel", "baixar", "gerar arquivo", "download")) {
      return [
        { text: "**Relatório de fechamento de junho gerado.** Disponível em PDF e Excel." },
        { card: card("exported") },
        { chips: [ACTIONS.relatorios.fechar] },
      ];
    }
    if (has("fechar", "fechamento", "concluir", "encerrar")) {
      return [
        {
          text:
            "Rodei o **checklist de fechamento** de junho. O item “extrato conciliado” puxa direto da conciliação.",
        },
        { card: card("checklist") },
        { text: "Junho pronto para a contabilidade.", chips: [ACTIONS.relatorios.exportar, NAV.conciliacao] },
      ];
    }
    return [
      {
        text: "Um resumo do **fechamento de junho**. Posso exportar ou rodar o checklist de fechamento.",
        card: card("overview"),
        chips: [ACTIONS.relatorios.exportar, ACTIONS.relatorios.fechar],
      },
    ];
  }

  // geral / fallback
  return [
    {
      text:
        "Posso operar **conciliação, contas a pagar, contas a receber, fluxo de caixa e relatórios**. Me diga qual desses — ou peça algo como “o que vence essa semana?”.",
      chips: ["Conciliar o extrato de junho", "Capturar os pagamentos", "Como está meu caixa?"],
    },
  ];
}

export const GO_CONCILIACAO_CHIP = IR_CONCIL;
