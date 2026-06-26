import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { emailValido, senhaValida } from "@/lib/validacoes-auth";

export const Route = createFileRoute("/perfil")({
  ssr: false,
  head: () => ({ meta: [{ title: "Perfil - Lock In Pomodoro" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const { usuario, logado, carregando, atualizarPerfil, alterarSenha } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [senhaAtualVisivel, setSenhaAtualVisivel] = useState(false);
  const [novaSenhaVisivel, setNovaSenhaVisivel] = useState(false);

  useEffect(() => {
    if (!carregando && !logado) router.navigate({ to: "/login" });
  }, [logado, carregando, router]);

  useEffect(() => {
    if (!usuario) return;

    setNome(usuario.nome ?? "");
    setEmail(usuario.email);
  }, [usuario]);

  if (carregando || !logado || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const salvarPerfil = async (e: FormEvent) => {
    e.preventDefault();
    setErroPerfil(null);

    if (!nome.trim()) {
      setErroPerfil("Informe seu nome.");
      return;
    }

    if (!emailValido(email)) {
      setErroPerfil("Informe um e-mail valido.");
      return;
    }

    setSalvandoPerfil(true);
    try {
      await atualizarPerfil({ nome, email });
      toast.success("Perfil atualizado com sucesso.");
    } catch (erro) {
      const mensagem = (erro as Error).message;
      setErroPerfil(mensagem);
      toast.error(mensagem);
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const salvarSenha = async (e: FormEvent) => {
    e.preventDefault();
    setErroSenha(null);

    if (!senhaAtual.trim()) {
      setErroSenha("Informe sua senha atual.");
      return;
    }

    if (!senhaValida(novaSenha)) {
      setErroSenha("A nova senha deve ter no minimo 8 caracteres.");
      return;
    }

    setSalvandoSenha(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      toast.success("Senha alterada com sucesso.");
    } catch (erro) {
      const mensagem = (erro as Error).message;
      setErroSenha(mensagem);
      toast.error(mensagem);
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-semibold">Perfil</h1>
        <p className="mb-8 text-sm text-muted-foreground">Atualize seus dados de acesso.</p>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
          <form
            onSubmit={salvarPerfil}
            noValidate
            className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10"
          >
            <h2 className="mb-5 font-mono-timer text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Dados da conta
            </h2>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Nome</span>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">E-mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                />
              </label>
            </div>

            {erroPerfil && <p className="mt-4 text-sm text-destructive">{erroPerfil}</p>}

            <button
              type="submit"
              disabled={salvandoPerfil}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold tracking-widest text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Save className="size-4" />
              {salvandoPerfil ? "SALVANDO..." : "SALVAR"}
            </button>
          </form>

          <form
            onSubmit={salvarSenha}
            noValidate
            className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10"
          >
            <h2 className="mb-5 font-mono-timer text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Alterar senha
            </h2>

            <div className="flex flex-col gap-4">
              <CampoSenha
                rotulo="Senha atual"
                valor={senhaAtual}
                visivel={senhaAtualVisivel}
                onToggleVisivel={() => setSenhaAtualVisivel((visivel) => !visivel)}
                onChange={setSenhaAtual}
              />
              <CampoSenha
                rotulo="Nova senha"
                valor={novaSenha}
                visivel={novaSenhaVisivel}
                onToggleVisivel={() => setNovaSenhaVisivel((visivel) => !visivel)}
                onChange={setNovaSenha}
              />
            </div>

            {erroSenha && <p className="mt-4 text-sm text-destructive">{erroSenha}</p>}

            <button
              type="submit"
              disabled={salvandoSenha}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold tracking-widest text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Save className="size-4" />
              {salvandoSenha ? "SALVANDO..." : "ALTERAR SENHA"}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function CampoSenha({
  rotulo,
  valor,
  visivel,
  onToggleVisivel,
  onChange,
}: {
  rotulo: string;
  valor: string;
  visivel: boolean;
  onToggleVisivel: () => void;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{rotulo}</span>
      <div className="relative">
        <input
          type={visivel ? "text" : "password"}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-11 text-base text-foreground outline-none focus:ring-2 focus:ring-primary sm:text-sm"
        />
        <button
          type="button"
          onClick={onToggleVisivel}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          title={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          {visivel ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </label>
  );
}
