import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function ToggleTema() {
  const [escuro, setEscuro] = useState(true);

  useEffect(() => {
    const salvo = localStorage.getItem("lockin.tema");
    const ehEscuro = salvo ? salvo === "dark" : true;
    setEscuro(ehEscuro);
    document.documentElement.classList.toggle("dark", ehEscuro);
  }, []);

  const alternar = () => {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("lockin.tema", novo ? "dark" : "light");
  };

  return (
    <button
      onClick={alternar}
      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      title="Alternar tema"
    >
      {escuro ? "Claro" : "Escuro"}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  const sair = async () => {
    await logout();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 hidden opacity-[0.04] dark:block"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <header className="relative z-10 border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
            <span className="text-sm font-semibold tracking-tight">
              LOCK IN <span className="text-muted-foreground">Pomodoro</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/">Timer</NavLink>
            <NavLink to="/estatisticas">Estatísticas</NavLink>
            <NavLink to="/configuracoes">Configurações</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ToggleTema />
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {usuario?.nome ?? usuario?.email}
            </span>
            <button
              onClick={sair}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-1 border-t border-border px-6 py-2 sm:hidden">
          <NavLink to="/">Timer</NavLink>
          <NavLink to="/estatisticas">Estatísticas</NavLink>
          <NavLink to="/configuracoes">Configurações</NavLink>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 sm:py-12">{children}</main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
    >
      {children}
    </Link>
  );
}
