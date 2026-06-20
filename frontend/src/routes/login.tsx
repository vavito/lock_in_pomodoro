import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Entrar — Lock In Pomodoro" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, logado } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (logado) router.navigate({ to: "/" });
  }, [logado, router]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        onSubmit={enviar}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-2xl"
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
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="voce@email.com"
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
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
