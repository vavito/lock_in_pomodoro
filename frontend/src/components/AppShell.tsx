import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Timer,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import type { PointerEvent, ReactNode } from "react";
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
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:translate-y-0"
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
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [focoFundo, setFocoFundo] = useState({ x: 0, y: 0, ativo: false });

  useEffect(() => {
    const valorSalvo = localStorage.getItem("lockin.sidebarAberta");
    if (valorSalvo) setSidebarAberta(valorSalvo === "true");
  }, []);

  const sair = async () => {
    await logout();
    router.navigate({ to: "/login" });
  };

  const alternarSidebar = () => {
    const novoValor = !sidebarAberta;
    setSidebarAberta(novoValor);
    localStorage.setItem("lockin.sidebarAberta", String(novoValor));
  };

  const atualizarFocoFundo = (evento: PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType === "touch") return;
    setFocoFundo({ x: evento.clientX, y: evento.clientY, ativo: true });
  };

  return (
    <div
      className="relative min-h-screen bg-background text-foreground"
      onPointerMove={atualizarFocoFundo}
      onPointerLeave={() => setFocoFundo((foco) => ({ ...foco, ativo: false }))}
    >
      <div
        className="animate-dots-drift pointer-events-none fixed inset-0 hidden opacity-[0.04] dark:block"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 hidden transition-opacity duration-200 dark:block"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 0)",
          backgroundSize: "24px 24px",
          opacity: focoFundo.ativo ? 0.18 : 0,
          WebkitMaskImage: `radial-gradient(170px circle at ${focoFundo.x}px ${focoFundo.y}px, black 0%, transparent 72%)`,
          maskImage: `radial-gradient(170px circle at ${focoFundo.x}px ${focoFundo.y}px, black 0%, transparent 72%)`,
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        <aside
          className={`hidden shrink-0 overflow-hidden border-r bg-background/80 py-5 backdrop-blur transition-[width,padding,opacity,border-color] duration-300 ease-out lg:flex lg:flex-col ${
            sidebarAberta
              ? "w-64 border-border px-4 opacity-100"
              : "w-0 border-transparent px-0 opacity-0"
          }`}
        >
          <div className="flex h-full w-56 min-w-56 flex-col">
            <div className="mb-8 flex items-center justify-between gap-3 px-2">
              <Link to="/" className="flex min-w-0 items-center gap-2">
                <div className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                <span className="truncate text-sm font-semibold tracking-tight">
                  LOCK IN <span className="text-muted-foreground">Pomodoro</span>
                </span>
              </Link>
              <button
                onClick={alternarSidebar}
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:translate-y-0"
                title="Fechar sidebar"
                aria-label="Fechar sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            </div>

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
                  className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 hover:shadow-md active:translate-y-0"
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </aside>

        {!sidebarAberta && (
          <button
            onClick={alternarSidebar}
            className="animate-soft-pop fixed left-5 top-5 z-30 hidden size-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-xl active:translate-y-0 lg:flex"
            title="Abrir sidebar"
            aria-label="Abrir sidebar"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        )}

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
                  className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-400 hover:shadow-md active:translate-y-0"
                  title="Sair"
                  aria-label="Sair"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="animate-page-enter mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
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
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:bg-secondary/70 hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
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
      className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
    >
      <Icone className="size-4" />
      <span>{rotulo}</span>
    </Link>
  );
}
