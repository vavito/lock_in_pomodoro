import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { estatisticasApi } from "@/services/api";
import { formatarTempoMinutos, hojeYYYYMMDD } from "@/lib/data";
import type { Estatisticas } from "@/types";

type Periodo = "dia" | "semana" | "mes" | "ano";

const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "dia", rotulo: "Dia" },
  { valor: "semana", rotulo: "Semana" },
  { valor: "mes", rotulo: "Mês" },
  { valor: "ano", rotulo: "Ano" },
];

export const Route = createFileRoute("/estatisticas")({
  ssr: false,
  head: () => ({ meta: [{ title: "Estatísticas — Lock In Pomodoro" }] }),
  component: EstatisticasPage,
});

function EstatisticasPage() {
  const { logado, carregando } = useAuth();
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [data, setData] = useState<string>(hojeYYYYMMDD());
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [carregandoStats, setCarregandoStats] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!carregando && !logado) router.navigate({ to: "/login" });
  }, [logado, carregando, router]);

  useEffect(() => {
    if (!logado) return;
    let ativo = true;
    setCarregandoStats(true);
    setErro(null);
    (async () => {
      try {
        const s = await estatisticasApi.obter(periodo, data);
        if (ativo) setStats(s);
      } catch (e) {
        if (ativo) setErro((e as Error).message);
      } finally {
        if (ativo) setCarregandoStats(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [logado, periodo, data]);

  if (carregando || !logado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-semibold">Estatísticas</h1>
        <p className="mb-8 text-sm text-muted-foreground">Acompanhe seu foco ao longo do tempo.</p>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-2xl bg-card p-1 ring-1 ring-border">
            {PERIODOS.map((p) => (
              <button
                key={p.valor}
                onClick={() => setPeriodo(p.valor)}
                className={
                  "cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors " +
                  (periodo === p.valor
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {p.rotulo}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {carregandoStats && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {erro && <p className="text-sm text-destructive">{erro}</p>}

        {stats && !carregandoStats && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Card rotulo="Pomodoros" valor={String(stats.pomodorosRealizados)} destaque />
              <Card rotulo="Descansos Curtos" valor={String(stats.descansosCurtosRealizados)} />
              <Card rotulo="Descansos Longos" valor={String(stats.descansosLongosRealizados)} />
              <Card
                rotulo="Tempo Focado"
                valor={formatarTempoMinutos(stats.tempoEstudandoMinutos)}
              />
              <Card
                rotulo="Tempo Descanso"
                valor={formatarTempoMinutos(stats.tempoDescansoMinutos)}
              />
              <Card rotulo="Dias Usados" valor={String(stats.diasUsados)} />
            </div>

            <div className="mt-8 rounded-3xl border border-border bg-card p-6">
              <h2 className="mb-4 font-mono-timer text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Dias no período
              </h2>
              {stats.dias.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum dia registrado neste período.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.dias.map((d) => (
                    <li key={d.id} className="grid grid-cols-2 gap-2 py-3 text-sm sm:grid-cols-5">
                      <span className="font-mono-timer text-foreground">{d.data}</span>
                      <span className="text-muted-foreground">{d.pomodorosRealizados} pomos</span>
                      <span className="text-muted-foreground">
                        {d.descansosCurtosRealizados} curtos
                      </span>
                      <span className="text-muted-foreground">
                        {d.descansosLongosRealizados} longos
                      </span>
                      <span className="text-primary">
                        {formatarTempoMinutos(d.tempoEstudandoMinutos)} focado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Card({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-mono-timer text-[10px] uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </p>
      <p
        className={
          "mt-2 font-mono-timer text-3xl " + (destaque ? "text-primary" : "text-foreground")
        }
      >
        {valor}
      </p>
    </div>
  );
}
