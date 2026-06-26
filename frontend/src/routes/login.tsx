import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { emailValido, senhaValida, validarCamposAuth, type ErrosAuth } from "@/lib/validacoes-auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Entrar - Lock In Pomodoro" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, logado } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<ErrosAuth>({});
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  useEffect(() => {
    if (logado) router.navigate({ to: "/" });
  }, [logado, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const erros = validarCamposAuth(email, senha);

    if (Object.keys(erros).length > 0) {
      setErrosCampos(erros);
      return;
    }

    setCarregando(true);
    try {
      await login(email, senha);
      router.navigate({ to: "/" });
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
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
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={enviar}
        noValidate
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl sm:max-w-md lg:max-w-lg lg:p-10"
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
          <h1 className="text-sm font-semibold tracking-tight">
            LOCK IN <span className="text-muted-foreground">Pomodoro</span>
          </h1>
        </div>

        <h2 className="mb-1 text-2xl font-semibold">Entrar</h2>
        <p className="mb-6 text-sm text-muted-foreground">Acesse para continuar focando.</p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => alterarEmail(e.target.value)}
              required
              placeholder="voce@email.com"
              aria-invalid={!!errosCampos.email}
              aria-describedby={errosCampos.email ? "login-email-erro" : undefined}
              className={
                "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 " +
                (errosCampos.email
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-primary")
              }
            />
            {errosCampos.email && (
              <span id="login-email-erro" className="text-xs text-destructive">
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
                placeholder="********"
                aria-invalid={!!errosCampos.senha}
                aria-describedby={errosCampos.senha ? "login-senha-erro" : undefined}
                className={
                  "w-full rounded-lg border bg-background px-3 py-2.5 pr-11 text-sm text-foreground outline-none focus:ring-2 " +
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
              <span id="login-senha-erro" className="text-xs text-destructive">
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
          {carregando ? "ENTRANDO..." : "ENTRAR"}
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sem conta?{" "}
          <Link to="/cadastro" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
