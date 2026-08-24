import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { personas, type PersonaId } from "../personas";

export function Login({ onPick }: { onPick: (p: PersonaId) => void }) {
  const [selected, setSelected] = useState<PersonaId | "">("");
  const [showPass, setShowPass] = useState(false);

  const enter = () => {
    onPick((selected || "dona") as PersonaId);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ————— coluna esquerda: formulário ————— */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[380px]">
          {/* marca */}
          <div className="flex items-center gap-2 mb-9">
            <img src="/kamino-mark.png" alt="" width={26} height={24} style={{ objectFit: "contain" }} />
            <span className="text-lg font-bold tracking-[0.14em] text-ink">KAMINO</span>
          </div>

          <h1 className="text-[28px] font-bold text-ink mb-7">Acessar a conta</h1>

          {/* SSO */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={enter}
              className="h-[52px] rounded-md border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Entrar com Google"
            >
              <GoogleIcon />
            </button>
            <button
              onClick={enter}
              className="h-[52px] rounded-md border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Entrar com Microsoft"
            >
              <MicrosoftIcon />
            </button>
          </div>

          {/* divisor */}
          <div className="flex items-center gap-3 mb-5">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-muted">ou</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* usuário — dropdown de usuários salvos (mock) */}
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Login ou E-mail</label>
          <div className="relative mb-4">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value as PersonaId | "")}
              className={`focus-ring w-full h-[46px] rounded-md border border-gray-300 bg-white pl-3 pr-9 text-sm appearance-none cursor-pointer ${
                selected ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <option value="" disabled>
                Selecione um usuário salvo
              </option>
              {(Object.keys(personas) as PersonaId[]).map((id) => {
                const p = personas[id];
                const login = p.nome
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[̀-ͯ]/g, "")
                  .replace(/\s+/g, ".");
                return (
                  <option key={id} value={id} className="text-gray-900">
                    {login}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={18}
              strokeWidth={2}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* senha */}
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha</label>
          <div className="relative mb-2">
            <input
              type={showPass ? "text" : "password"}
              defaultValue="senha-demo"
              placeholder="Digite sua senha"
              className="focus-ring w-full h-[46px] rounded-md border border-gray-300 bg-white pl-3 pr-10 text-sm text-gray-900"
            />
            <button
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title={showPass ? "Ocultar senha" : "Mostrar senha"}
              type="button"
            >
              {showPass ? <Eye size={18} strokeWidth={2} /> : <EyeOff size={18} strokeWidth={2} />}
            </button>
          </div>

          <div className="flex justify-end mb-6">
            <button className="text-sm font-semibold text-navy-600 hover:underline">
              Esqueceu a senha?
            </button>
          </div>

          <button
            onClick={enter}
            disabled={!selected}
            className={`w-full h-[46px] rounded-md text-sm font-semibold transition-colors ${
              selected
                ? "bg-navy-600 text-white hover:bg-navy-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continuar
          </button>

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            Mock do case — escolha um usuário salvo para entrar. O usuário define o seu papel e as
            ações disponíveis dentro do assistente.
          </p>
        </div>
      </div>

      {/* ————— coluna direita: promo (imagem real, com link) ————— */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#ececec]">
        <a
          href="https://kamino.com.br/cartao-de-credito-empresas/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 block group"
          title="Cartão de crédito para empresas — Kamino"
          aria-label="Saiba mais sobre o Cartão Kamino"
        >
          <img
            src="/home.png"
            alt="Cartão Kamino — controle seus gastos com mais facilidade"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 group-hover:opacity-95"
          />
        </a>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M0 0h11.4v11.4H0z" />
      <path fill="#7FBA00" d="M12.6 0H24v11.4H12.6z" />
      <path fill="#00A4EF" d="M0 12.6h11.4V24H0z" />
      <path fill="#FFB900" d="M12.6 12.6H24V24H12.6z" />
    </svg>
  );
}
