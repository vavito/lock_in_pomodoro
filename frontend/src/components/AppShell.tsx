import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  LogOut,
  Moon,
  Settings,
  Sun,
  Timer,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ITENS_NAVEGACAO: { to: string; rotulo: string; Icone: LucideIcon }[] = [
  { to: "/", rotulo: "Timer", Icone: Timer },
  { to: "/estatisticas", rotulo: "Estatisticas", Icone: BarChart3 },
  { to: "/configuracoes", rotulo: "Configuracoes", Icone: Settings },
  { to: "/perfil", rotulo: "Perfil", Icone: UserCircle },
];

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
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      title={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {escuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
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

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-background/80 px-4 py-5 backdrop-blur lg:flex lg:flex-col">
          <Link to="/" className="mb-8 flex items-center gap-2 px-2">
            <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
            <span className="text-sm font-semibold tracking-tight">
              LOCK IN <span className="text-muted-foreground">Pomodoro</span>
            </span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {ITENS_NAVEGACAO.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
              <UserCircle className="size-4" />
              <span className="truncate">{usuario?.nome ?? usuario?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <ToggleTema />
              <button
                onClick={sair}
                className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <header className="border-b border-border lg:hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                <span className="text-sm font-semibold tracking-tight">
                  LOCK IN <span className="text-muted-foreground">Pomodoro</span>
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ToggleTema />
                <button
                  onClick={sair}
                  className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                  title="Sair"
                  aria-label="Sair"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-12">{children}</main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
          {ITENS_NAVEGACAO.map((item) => (
            <MobileNavLink key={item.to} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavLink({ to, rotulo, Icone }: { to: string; rotulo: string; Icone: LucideIcon }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
    >
      <Icone className="size-4" />
      {rotulo}
    </Link>
  );
}

function MobileNavLink({ to, rotulo, Icone }: { to: string; rotulo: string; Icone: LucideIcon }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/" }}
      className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
    >
      <Icone className="size-4" />
      <span>{rotulo}</span>
    </Link>
  );
}
