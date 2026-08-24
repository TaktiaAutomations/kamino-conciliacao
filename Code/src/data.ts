/* ————————————————————————————————————————————————————————————————
   DADOS DO CASE — Apêndice A (Dados_Case_Conciliacao.xlsx)
   Todos fictícios. Valores em R$, referentes a junho.
   CP = conta a pagar · CR = conta a receber
———————————————————————————————————————————————————————————————— */

export type TituloTipo = "pagar" | "receber";

export interface Titulo {
  id: string;
  tipo: TituloTipo;
  contraparte: string;
  valor: number;
  vencimento: string; // ISO
  /** quanto já foi baixado (para pagamento parcial) */
  baixado: number;
  status: "aberto" | "parcial" | "conciliado";
}

export interface LancamentoExtrato {
  id: string;
  data: string; // ISO
  tipo: "debito" | "credito";
  valor: number; // negativo p/ débito
  historico: string;
  /** título(s) conciliado(s) a esta linha */
  conciliadoCom: string[];
  status: "pendente" | "conciliado";
}

/** Saldo inicial escolhido para que o saldo do banco feche em 12.305,00
    (24.200 + movimento líquido de junho de -11.895 = 12.305) — coerente com a tese. */
export const SALDO_INICIAL = 24200;

export const titulosSeed: Titulo[] = [
  { id: "CP-001", tipo: "pagar", contraparte: "Alfa Tecnologia Ltda", valor: 3200, vencimento: "2026-06-05", baixado: 0, status: "aberto" },
  { id: "CP-002", tipo: "pagar", contraparte: "Beta Serviços ME", valor: 1500, vencimento: "2026-06-10", baixado: 0, status: "aberto" },
  { id: "CP-003", tipo: "pagar", contraparte: "Beta Serviços ME", valor: 1500, vencimento: "2026-06-10", baixado: 0, status: "aberto" },
  { id: "CP-004", tipo: "pagar", contraparte: "Beta Serviços ME", valor: 1500, vencimento: "2026-06-10", baixado: 0, status: "aberto" },
  { id: "CP-005", tipo: "pagar", contraparte: "Gama Consultoria S/A", valor: 10000, vencimento: "2026-06-12", baixado: 0, status: "aberto" },
  { id: "CP-006", tipo: "pagar", contraparte: "Delta Aluguéis Ltda", valor: 8000, vencimento: "2026-06-15", baixado: 0, status: "aberto" },
  { id: "CR-001", tipo: "receber", contraparte: "Consultoria Silva ME", valor: 6000, vencimento: "2026-06-08", baixado: 0, status: "aberto" },
  { id: "CR-002", tipo: "receber", contraparte: "Ômega Varejo Ltda", valor: 4200, vencimento: "2026-06-09", baixado: 0, status: "aberto" },
  { id: "CR-003", tipo: "receber", contraparte: "Sigma Ltda", valor: 2500, vencimento: "2026-06-20", baixado: 0, status: "aberto" },
];

export const extratoSeed: LancamentoExtrato[] = [
  { id: "EX-1", data: "2026-06-05", tipo: "debito", valor: -3200, historico: "PAG FORNEC ALFA TEC", conciliadoCom: [], status: "pendente" },
  { id: "EX-2", data: "2026-06-08", tipo: "credito", valor: 6000, historico: "TED RECEBIDA - JOAO P DA SILVA", conciliadoCom: [], status: "pendente" },
  { id: "EX-3", data: "2026-06-09", tipo: "credito", valor: 4200, historico: "PIX RECEBIDO - OMEGA VAREJO", conciliadoCom: [], status: "pendente" },
  { id: "EX-4", data: "2026-06-10", tipo: "debito", valor: -4500, historico: "PAG BOLETOS LOTE 3382", conciliadoCom: [], status: "pendente" },
  { id: "EX-5", data: "2026-06-12", tipo: "debito", valor: -9350, historico: "TED ENVIADA - GAMA CONSULTORIA", conciliadoCom: [], status: "pendente" },
  { id: "EX-6", data: "2026-06-14", tipo: "debito", valor: -45, historico: "TAR PACOTE DE SERVICOS", conciliadoCom: [], status: "pendente" },
  { id: "EX-7", data: "2026-06-15", tipo: "debito", valor: -5000, historico: "PIX ENVIADO - DELTA ALUGUEIS", conciliadoCom: [], status: "pendente" },
];

/* ————————————————————————————————————————————————————————————————
   AS 7 SITUAÇÕES — a espinha dorsal do case.
   Cada uma carrega: nível de autonomia, evidência, e a ação que resolve.
———————————————————————————————————————————————————————————————— */

export type Autonomia = "age" | "sugere" | "escala";

export type CaseKind =
  | "exato"
  | "nome"
  | "lote"
  | "retencao"
  | "parcial"
  | "tarifa"
  | "ausente";

export interface Evidencia {
  label: string;
  ok: boolean; // bate ✓ ou é ponto de atenção
}

export interface CaseSpec {
  key: string;
  kind: CaseKind;
  extratoId: string | null; // null p/ o caso Sigma (sem linha no extrato)
  titulos: string[];
  autonomia: Autonomia;
  confianca: number; // 0-100
  titulo: string; // headline curta
  resumo: string; // o que o agente diz
  evidencias: Evidencia[];
  /** rótulo do botão de ação principal */
  acaoLabel: string;
  /** para retenção/tarifa: detalhamento do lançamento a criar */
  lancamento?: { descricao: string; linhas: { label: string; valor: number }[] };
  /** quando resolvido, quanto de cada título é baixado (parcial) */
  baixaParcial?: Record<string, number>;
}

export const cases: CaseSpec[] = [
  {
    key: "alfa",
    kind: "exato",
    extratoId: "EX-1",
    titulos: ["CP-001"],
    autonomia: "age",
    confianca: 99,
    titulo: "Pagamento à Alfa — correspondência exata",
    resumo:
      "Débito de R$ 3.200,00 em 05/06 bate 1:1 com o CP-001 (Alfa Tecnologia). Mesmo valor, mesma data, contraparte compatível. Concilio sozinho e deixo a evidência anexada.",
    evidencias: [
      { label: "Valor idêntico: R$ 3.200,00", ok: true },
      { label: "Data casa: 05/06 vence 05/06", ok: true },
      { label: "Contraparte: “ALFA TEC” ≈ Alfa Tecnologia Ltda", ok: true },
    ],
    acaoLabel: "Ver evidência",
  },
  {
    key: "omega",
    kind: "exato",
    extratoId: "EX-3",
    titulos: ["CR-002"],
    autonomia: "age",
    confianca: 99,
    titulo: "Recebimento da Ômega — correspondência exata",
    resumo:
      "Crédito de R$ 4.200,00 em 09/06 (PIX) bate 1:1 com o CR-002 (Ômega Varejo). Concilio sozinho.",
    evidencias: [
      { label: "Valor idêntico: R$ 4.200,00", ok: true },
      { label: "Data casa: 09/06 vence 09/06", ok: true },
      { label: "Contraparte: “OMEGA VAREJO” ≈ Ômega Varejo Ltda", ok: true },
    ],
    acaoLabel: "Ver evidência",
  },
  {
    key: "silva",
    kind: "nome",
    extratoId: "EX-2",
    titulos: ["CR-001"],
    autonomia: "sugere",
    confianca: 86,
    titulo: "Divergência de nome — João P. da Silva",
    resumo:
      "Crédito de R$ 6.000,00 em 08/06 bate em valor e data com o CR-001 (Consultoria Silva ME), mas o pagador no extrato é “JOAO P DA SILVA” — provável sócio/pessoa física por trás da ME. Valor e data batem exatos; só o nome diverge. Sugiro conciliar — confirma?",
    evidencias: [
      { label: "Valor idêntico: R$ 6.000,00", ok: true },
      { label: "Data casa: 08/06 vence 08/06", ok: true },
      { label: "Nome diverge: “João P da Silva” × Consultoria Silva ME", ok: false },
    ],
    acaoLabel: "Confirmar conciliação",
  },
  {
    key: "lote",
    kind: "lote",
    extratoId: "EX-4",
    titulos: ["CP-002", "CP-003", "CP-004"],
    autonomia: "sugere",
    confianca: 92,
    titulo: "Pagamento em lote — 3.382",
    resumo:
      "Débito único de R$ 4.500,00 (“LOTE 3382”) corresponde a 3 títulos da Beta Serviços de R$ 1.500,00 cada. A soma é exata e a contraparte é a mesma. Sugiro agrupar e baixar os três — confirma?",
    evidencias: [
      { label: "Soma exata: 3 × 1.500 = 4.500", ok: true },
      { label: "Mesma contraparte: Beta Serviços ME", ok: true },
      { label: "Histórico “LOTE 3382” indica pagamento agrupado", ok: true },
    ],
    acaoLabel: "Conciliar o lote (3 títulos)",
  },
  {
    key: "gama",
    kind: "retencao",
    extratoId: "EX-5",
    titulos: ["CP-005"],
    autonomia: "sugere",
    confianca: 88,
    titulo: "Retenção de imposto — Gama Consultoria",
    resumo:
      "Débito de R$ 9.350,00 para a Gama, contra um título de R$ 10.000,00. A diferença de R$ 650,00 corresponde a ISS 5% (R$ 500) + IRRF 1,5% (R$ 150) — padrão para consultoria. Sugiro baixar o título integralmente e lançar R$ 650 como impostos retidos. Como isso cria um fato contábil, peço sua confirmação antes de lançar.",
    evidencias: [
      { label: "Pago R$ 9.350 × título R$ 10.000", ok: true },
      { label: "Diferença R$ 650 = ISS 5% + IRRF 1,5%", ok: true },
      { label: "Cria lançamento de imposto → exige confirmação", ok: false },
    ],
    acaoLabel: "Confirmar baixa + lançar retenção",
    lancamento: {
      descricao: "Impostos retidos — CP-005 Gama Consultoria",
      linhas: [
        { label: "ISS retido (5%)", valor: 500 },
        { label: "IRRF retido (1,5%)", valor: 150 },
      ],
    },
  },
  {
    key: "delta",
    kind: "parcial",
    extratoId: "EX-7",
    titulos: ["CP-006"],
    autonomia: "sugere",
    confianca: 84,
    titulo: "Pagamento parcial — Delta Aluguéis",
    resumo:
      "PIX de R$ 5.000,00 para a Delta, contra um título de R$ 8.000,00. Parece pagamento parcial: sugiro baixar R$ 5.000 e manter R$ 3.000 em aberto no CP-006. Confirma a baixa parcial?",
    evidencias: [
      { label: "Pago R$ 5.000 × título R$ 8.000", ok: true },
      { label: "Contraparte: “DELTA ALUGUEIS” ≈ Delta Aluguéis Ltda", ok: true },
      { label: "Resta R$ 3.000 em aberto após a baixa", ok: false },
    ],
    acaoLabel: "Baixar parcial (mantém R$ 3.000)",
    baixaParcial: { "CP-006": 5000 },
  },
  {
    key: "tarifa",
    kind: "tarifa",
    extratoId: "EX-6",
    titulos: [],
    autonomia: "escala",
    confianca: 70,
    titulo: "Tarifa bancária — sem lançamento interno",
    resumo:
      "Débito de R$ 45,00 (“TAR PACOTE DE SERVICOS”) não tem título interno correspondente — é uma tarifa do banco. Não crio despesa sozinho: proponho criar um lançamento de “Tarifa bancária” e escalo para você aprovar. É o tipo de fato financeiro que a IA prepara, mas não cria sem humano.",
    evidencias: [
      { label: "Sem título correspondente na plataforma", ok: false },
      { label: "Histórico indica tarifa de pacote de serviços", ok: true },
      { label: "Criação de despesa → decisão humana", ok: false },
    ],
    acaoLabel: "Criar despesa de tarifa (R$ 45)",
    lancamento: {
      descricao: "Tarifa bancária — pacote de serviços",
      linhas: [{ label: "Tarifa bancária", valor: 45 }],
    },
  },
  {
    key: "sigma",
    kind: "ausente",
    extratoId: null,
    titulos: ["CR-003"],
    autonomia: "escala",
    confianca: 0,
    titulo: "Recebimento em atraso — Sigma Ltda",
    resumo:
      "O CR-003 (Sigma, R$ 2.500,00, venc. 20/06) não tem nenhuma linha no extrato. Não é erro de conciliação — é um recebimento que ainda não caiu. Destaco porque afeta o seu saldo previsto: o dinheiro esperado não entrou. Vale uma cobrança.",
    evidencias: [
      { label: "Título CR-003 em aberto: R$ 2.500,00", ok: true },
      { label: "Nenhuma movimentação no extrato de junho", ok: false },
      { label: "Impacto: saldo previsto R$ 2.500 acima do realizado", ok: false },
    ],
    acaoLabel: "Marcar para cobrança",
  },
];

export const caseByExtrato = (exId: string) => cases.find((c) => c.extratoId === exId);
export const caseByKey = (k: string) => cases.find((c) => c.key === k)!;

/** frase natural que, ao ser enviada ao chat, aciona o card do caso */
export const chipForCase: Record<string, string> = {
  alfa: "Mostra os que bateram exato",
  omega: "Mostra os que bateram exato",
  silva: "O nome do pagador diverge?",
  lote: "Mostra o lote 3382",
  gama: "Por que a Gama veio menor?",
  delta: "E o pagamento parcial da Delta?",
  tarifa: "E a tarifa de R$ 45?",
  sigma: "E a Sigma que não caiu?",
};

/* helpers de formatação */
export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const brlShort = (v: number) =>
  Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const dataBR = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};
