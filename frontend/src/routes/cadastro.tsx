import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { emailValido, senhaValida, validarCamposAuth, type ErrosAuth } from "@/lib/validacoes-auth";

type ErrosCadastro = ErrosAuth & {
  nome?: string;
};

export const Route = createFileRoute("/cadastro")({
  ssr: false,
  head: () => ({ meta: [{ title: "Cadastro - Lock In Pomodoro" }] }),
  component: CadastroPage,
});

function CadastroPage() {
  const { cadastro, logado } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<ErrosCadastro>({});
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  useEffect(() => {
    if (logado) router.navigate({ to: "/" });
  }, [logado, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const erros: ErrosCadastro = validarCamposAuth(email, senha);

    if (!nome.trim()) {
      erros.nome = "Informe seu nome.";
    }

    if (Object.keys(erros).length > 0) {
      setErrosCampos(erros);
      return;
    }

    setCarregando(true);
    try {
      await cadastro(nome, email, senha);
      router.navigate({ to: "/" });
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  const alterarNome = (valor: string) => {
    setNome(valor);

    if (errosCampos.nome) {
      setErrosCampos((errosAtuais) => ({
        ...errosAtuais,
        nome: valor.trim() ? undefined : "Informe seu nome.",
      }));
    }
  };

  const alterarEmail = (valor: string) => {
    setEmail(valor);

    if (errosCampos.email) {
      setErrosCampos((errosAtuais) => ({
        ...errosAtuais,
        email: emailValido(valor) ? undefined : "Informe um e-mail valido.",
      }));
    }
  };

  const alterarSenha = (valor: string) => {
    setSenha(valor);

    if (errosCampos.senha) {
      setErrosCampos((errosAtuais) => ({
        ...errosAtuais,
        senha: senhaValida(valor) ? undefined : "A senha deve ter no minimo 8 caracteres.",
      }));
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5 py-8">
      <form
        onSubmit={enviar}
        noValidate
        className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl sm:p-8 lg:max-w-lg lg:p-10"
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
          <h1 className="text-sm font-semibold tracking-tight">
            LOCK IN <span className="text-muted-foreground">Pomodoro</span>
          </h1>
        </div>

        <h2 className="mb-1 text-2xl font-semibold">Criar conta</h2>
        <p className="mb-6 text-sm text-muted-foreground">Comece a manter o foco hoje.</p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Nome</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => alterarNome(e.target.value)}
              required
              aria-invalid={!!errosCampos.nome}
              aria-describedby={errosCampos.nome ? "cadastro-nome-erro" : undefined}
              className={
                "rounded-lg border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 sm:text-sm " +
                (errosCampos.nome
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary")
              }
            />
            {errosCampos.nome && (
              <span id="cadastro-nome-erro" className="text-xs text-destructive">
                {errosCampos.nome}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => alterarEmail(e.target.value)}
              required
              aria-invalid={!!errosCampos.email}
              aria-describedby={errosCampos.email ? "cadastro-email-erro" : undefined}
              className={
                "rounded-lg border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 sm:text-sm " +
                (errosCampos.email
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary")
              }
            />
            {errosCampos.email && (
              <span id="cadastro-email-erro" className="text-xs text-destructive">
                {errosCampos.email}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Senha</span>
            <div className="relative">
              <input
                type={senhaVisivel ? "text" : "password"}
                value={senha}
                onChange={(e) => alterarSenha(e.target.value)}
                required
                minLength={8}
                aria-invalid={!!errosCampos.senha}
                aria-describedby={errosCampos.senha ? "cadastro-senha-erro" : undefined}
                className={
                  "w-full rounded-lg border bg-background px-3 py-2.5 pr-11 text-base text-foreground outline-none focus:ring-2 sm:text-sm " +
                  (errosCampos.senha
                    ? "border-destructive focus:ring-destructive"
                    : "border-border focus:ring-primary")
                }
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel((visivel) => !visivel)}
                aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                title={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {senhaVisivel ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errosCampos.senha && (
              <span id="cadastro-senha-erro" className="text-xs text-destructive">
                {errosCampos.senha}
              </span>
            )}
          </label>
        </div>

        {erro && <p className="mt-4 text-sm text-destructive">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-6 w-full cursor-pointer rounded-2xl bg-primary px-6 py-3 text-sm font-bold tracking-widest text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          {carregando ? "CRIANDO..." : "CRIAR CONTA"}
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ja tem conta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
