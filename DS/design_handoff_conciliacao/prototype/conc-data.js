/* ————————————————————————————————————————————————————————————————
   Conciliação assistida por agente — DADOS DO CASE (Apêndice A)
   Portado de Code/src/data.ts. Todos fictícios. Valores em R$, junho/2026.
   CP = conta a pagar · CR = conta a receber
   Exposto em window.ConcData.
———————————————————————————————————————————————————————————————— */
(function () {
  const SALDO_INICIAL = 24200;

  const titulosSeed = [
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

  const extratoSeed = [
    { id: "EX-1", data: "2026-06-05", tipo: "debito", valor: -3200, historico: "PAG FORNEC ALFA TEC", conciliadoCom: [], status: "pendente" },
    { id: "EX-2", data: "2026-06-08", tipo: "credito", valor: 6000, historico: "TED RECEBIDA - JOAO P DA SILVA", conciliadoCom: [], status: "pendente" },
    { id: "EX-3", data: "2026-06-09", tipo: "credito", valor: 4200, historico: "PIX RECEBIDO - OMEGA VAREJO", conciliadoCom: [], status: "pendente" },
    { id: "EX-4", data: "2026-06-10", tipo: "debito", valor: -4500, historico: "PAG BOLETOS LOTE 3382", conciliadoCom: [], status: "pendente" },
    { id: "EX-5", data: "2026-06-12", tipo: "debito", valor: -9350, historico: "TED ENVIADA - GAMA CONSULTORIA", conciliadoCom: [], status: "pendente" },
    { id: "EX-6", data: "2026-06-14", tipo: "debito", valor: -45, historico: "TAR PACOTE DE SERVICOS", conciliadoCom: [], status: "pendente" },
    { id: "EX-7", data: "2026-06-15", tipo: "debito", valor: -5000, historico: "PIX ENVIADO - DELTA ALUGUEIS", conciliadoCom: [], status: "pendente" },
  ];

  /* AS 7 SITUAÇÕES — a espinha dorsal do case. */
  const cases = [
    {
      key: "alfa", kind: "exato", extratoId: "EX-1", titulos: ["CP-001"],
      autonomia: "age", confianca: 99,
      titulo: "Pagamento à Alfa — correspondência exata",
      resumo: "Débito de R$ 3.200,00 em 05/06 bate 1:1 com o CP-001 (Alfa Tecnologia). Mesmo valor, mesma data, contraparte compatível. Concilio sozinho e deixo a evidência anexada.",
      evidencias: [
        { label: "Valor idêntico: R$ 3.200,00", ok: true },
        { label: "Data casa: 05/06 vence 05/06", ok: true },
        { label: "Contraparte: “ALFA TEC” ≈ Alfa Tecnologia Ltda", ok: true },
      ],
      acaoLabel: "Ver evidência",
    },
    {
      key: "omega", kind: "exato", extratoId: "EX-3", titulos: ["CR-002"],
      autonomia: "age", confianca: 99,
      titulo: "Recebimento da Ômega — correspondência exata",
      resumo: "Crédito de R$ 4.200,00 em 09/06 (PIX) bate 1:1 com o CR-002 (Ômega Varejo). Concilio sozinho.",
      evidencias: [
        { label: "Valor idêntico: R$ 4.200,00", ok: true },
        { label: "Data casa: 09/06 vence 09/06", ok: true },
        { label: "Contraparte: “OMEGA VAREJO” ≈ Ômega Varejo Ltda", ok: true },
      ],
      acaoLabel: "Ver evidência",
    },
    {
      key: "silva", kind: "nome", extratoId: "EX-2", titulos: ["CR-001"],
      autonomia: "sugere", confianca: 86,
      titulo: "Divergência de nome — João P. da Silva",
      resumo: "Crédito de R$ 6.000,00 em 08/06 bate em valor e data com o CR-001 (Consultoria Silva ME), mas o pagador no extrato é “JOAO P DA SILVA” — provável sócio/pessoa física por trás da ME. Valor e data batem exatos; só o nome diverge. Sugiro conciliar — confirma?",
      evidencias: [
        { label: "Valor idêntico: R$ 6.000,00", ok: true },
        { label: "Data casa: 08/06 vence 08/06", ok: true },
        { label: "Nome diverge: “João P da Silva” × Consultoria Silva ME", ok: false },
      ],
      acaoLabel: "Confirmar conciliação",
    },
    {
      key: "lote", kind: "lote", extratoId: "EX-4", titulos: ["CP-002", "CP-003", "CP-004"],
      autonomia: "sugere", confianca: 92,
      titulo: "Pagamento em lote — 3.382",
      resumo: "Débito único de R$ 4.500,00 (“LOTE 3382”) corresponde a 3 títulos da Beta Serviços de R$ 1.500,00 cada. A soma é exata e a contraparte é a mesma. Sugiro agrupar e baixar os três — confirma?",
      evidencias: [
        { label: "Soma exata: 3 × 1.500 = 4.500", ok: true },
        { label: "Mesma contraparte: Beta Serviços ME", ok: true },
        { label: "Histórico “LOTE 3382” indica pagamento agrupado", ok: true },
      ],
      acaoLabel: "Conciliar o lote (3 títulos)",
    },
    {
      key: "gama", kind: "retencao", extratoId: "EX-5", titulos: ["CP-005"],
      autonomia: "sugere", confianca: 88,
      titulo: "Retenção de imposto — Gama Consultoria",
      resumo: "Débito de R$ 9.350,00 para a Gama, contra um título de R$ 10.000,00. A diferença de R$ 650,00 corresponde a ISS 5% (R$ 500) + IRRF 1,5% (R$ 150) — padrão para consultoria. Sugiro baixar o título integralmente e lançar R$ 650 como impostos retidos. Como isso cria um fato contábil, peço sua confirmação antes de lançar.",
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
      key: "delta", kind: "parcial", extratoId: "EX-7", titulos: ["CP-006"],
      autonomia: "sugere", confianca: 84,
      titulo: "Pagamento parcial — Delta Aluguéis",
      resumo: "PIX de R$ 5.000,00 para a Delta, contra um título de R$ 8.000,00. Parece pagamento parcial: sugiro baixar R$ 5.000 e manter R$ 3.000 em aberto no CP-006. Confirma a baixa parcial?",
      evidencias: [
        { label: "Pago R$ 5.000 × título R$ 8.000", ok: true },
        { label: "Contraparte: “DELTA ALUGUEIS” ≈ Delta Aluguéis Ltda", ok: true },
        { label: "Resta R$ 3.000 em aberto após a baixa", ok: false },
      ],
      acaoLabel: "Baixar parcial (mantém R$ 3.000)",
      baixaParcial: { "CP-006": 5000 },
    },
    {
      key: "tarifa", kind: "tarifa", extratoId: "EX-6", titulos: [],
      autonomia: "escala", confianca: 70,
      titulo: "Tarifa bancária — sem lançamento interno",
      resumo: "Débito de R$ 45,00 (“TAR PACOTE DE SERVICOS”) não tem título interno correspondente — é uma tarifa do banco. Não crio despesa sozinho: proponho criar um lançamento de “Tarifa bancária” e escalo para você aprovar. É o tipo de fato financeiro que a IA prepara, mas não cria sem humano.",
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
      key: "sigma", kind: "ausente", extratoId: null, titulos: ["CR-003"],
      autonomia: "escala", confianca: 0,
      titulo: "Recebimento em atraso — Sigma Ltda",
      resumo: "O CR-003 (Sigma, R$ 2.500,00, venc. 20/06) não tem nenhuma linha no extrato. Não é erro de conciliação — é um recebimento que ainda não caiu. Destaco porque afeta o seu saldo previsto: o dinheiro esperado não entrou. Vale uma cobrança.",
      evidencias: [
        { label: "Título CR-003 em aberto: R$ 2.500,00", ok: true },
        { label: "Nenhuma movimentação no extrato de junho", ok: false },
        { label: "Impacto: saldo previsto R$ 2.500 acima do realizado", ok: false },
      ],
      acaoLabel: "Marcar para cobrança",
    },
  ];

  const personas = {
    dona: {
      id: "dona", nome: "Bia Garcia", iniciais: "BG",
      cargo: "Sócia-fundadora · Acme Serviços", cor: "#05508a",
      objetivo: "Abrir e confiar no saldo em 30 segundos.",
      saudacao: "Bom dia, Bia. Já olhei o extrato de junho e adiantei o que era seguro. **Conciliei 2 de 7 lançamentos automaticamente** — os que batem exato. Sobraram **5 pontos que precisam de um olhar** e **1 recebimento que não caiu**. Seu saldo conciliado hoje está em **29%**. Quer que eu te explique o que falta para chegar a 100%?",
      chipsIniciais: ["Posso confiar no meu saldo?", "O que falta para 100%?", "Tem algo que eu preciso decidir?"],
      podeAgirEmLote: false, focoAprovacao: true,
    },
    analista: {
      id: "analista", nome: "Rafael Dias", iniciais: "RD",
      cargo: "Analista financeiro · Acme Serviços", cor: "#079455",
      objetivo: "Zerar a fila de pendências do dia.",
      saudacao: "E aí, Rafael. Extrato de junho carregado. **2 conciliados automaticamente** (Alfa e Ômega). Tem **5 pendências na fila** + o CR-003 da Sigma sem movimento. Posso resolver várias de uma vez: quer que eu **concilie tudo que estiver acima de 90% de confiança** e deixe só o que precisa de decisão contábil pra você?",
      chipsIniciais: ["Concilia tudo ≥ 90%", "Mostra o lote 3382", "Zera a fila"],
      podeAgirEmLote: true, focoAprovacao: false,
    },
  };

  const chipForCase = {
    alfa: "Mostra os que bateram exato",
    omega: "Mostra os que bateram exato",
    silva: "O nome do pagador diverge?",
    lote: "Mostra o lote 3382",
    gama: "Por que a Gama veio menor?",
    delta: "E o pagamento parcial da Delta?",
    tarifa: "E a tarifa de R$ 45?",
    sigma: "E a Sigma que não caiu?",
  };

  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const dataBR = (iso) => { const p = iso.split("-"); return `${p[2]}/${p[1]}`; };
  const caseByKey = (k) => cases.find((c) => c.key === k);
  const caseByExtrato = (exId) => cases.find((c) => c.extratoId === exId);
  const tituloById = (id) => titulosSeed.find((t) => t.id === id);
  const extratoById = (id) => extratoSeed.find((e) => e.id === id);

  window.ConcData = {
    SALDO_INICIAL, titulosSeed, extratoSeed, cases, personas, chipForCase,
    brl, dataBR, caseByKey, caseByExtrato, tituloById, extratoById,
  };
})();
