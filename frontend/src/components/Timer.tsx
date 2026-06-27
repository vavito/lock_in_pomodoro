import { useTimer } from "@/contexts/TimerContext";
import { formatarMMSS } from "@/lib/data";
import type { TipoSessao } from "@/types";
import { ResumoDoDia } from "./ResumoDoDia";

const ABAS: { tipo: TipoSessao; rotulo: string }[] = [
  { tipo: "POMODORO", rotulo: "Pomodoro" },
  { tipo: "DESCANSO_CURTO", rotulo: "Curto" },
  { tipo: "DESCANSO_LONGO", rotulo: "Longo" },
];

export function Timer() {
  const {
    config,
    resumo,
    tipo,
    rodando,
    segundosRestantes,
    progresso,
    erro,
    iniciar,
    parar,
    pular,
    selecionarTipo,
    recarregarResumo,
  } = useTimer();

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="animate-soft-pop flex rounded-2xl bg-card p-1 ring-1 ring-border">
        {ABAS.map((a) => (
          <button
            key={a.tipo}
            onClick={() => selecionarTipo(a.tipo)}
            disabled={rodando && tipo !== a.tipo}
            className={
              "cursor-pointer rounded-xl px-5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 " +
              (tipo === a.tipo
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground")
            }
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="animate-page-enter flex flex-col items-center">
        <h1 className="font-mono-timer text-[6.5rem] font-extrabold leading-none tracking-tighter text-foreground sm:text-[8.5rem] md:text-[10rem] xl:text-[11rem]">
          {formatarMMSS(segundosRestantes)}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round(progresso * 100)}%` }}
            />
          </div>
          <span className="font-mono-timer text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {rodando ? "Ciclo em curso" : "Pronto"}
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-muted-foreground transition-all duration-500"
              style={{
                width: `${
                  resumo && config
                    ? Math.min(
                        100,
                        Math.round(
                          ((resumo.pomodorosRealizados % config.pomodorosParaDescansoLongo) /
                            config.pomodorosParaDescansoLongo) *
                            100,
                        ),
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div>
        {!rodando ? (
          <button
            onClick={iniciar}
            className="group relative cursor-pointer rounded-2xl bg-primary px-12 py-5 text-lg font-bold tracking-widest text-primary-foreground ring-primary ring-offset-4 ring-offset-background transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-2 active:translate-y-0 active:scale-95"
          >
            INICIAR
          </button>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => void parar()}
              className="cursor-pointer rounded-2xl border border-border bg-card px-10 py-5 text-lg font-bold tracking-widest text-foreground transition-all duration-200 hover:-translate-y-1 hover:bg-secondary hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              PARAR
            </button>
            <button
              onClick={() => void pular()}
              className="cursor-pointer rounded-2xl bg-primary px-10 py-5 text-lg font-bold tracking-widest text-primary-foreground transition-all duration-200 hover:-translate-y-1 hover:opacity-90 hover:shadow-lg active:translate-y-0 active:scale-95"
            >
              PULAR &gt;&gt;
            </button>
          </div>
        )}
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <ResumoDoDia resumo={resumo} aoAtualizar={recarregarResumo} />
    </div>
  );
}
