import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { configuracoesApi } from "@/services/api";
import type { Configuracao } from "@/types";

export const Route = createFileRoute("/configuracoes")({
  ssr: false,
  head: () => ({ meta: [{ title: "Configurações — Lock In Pomodoro" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { logado, carregando } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [carregandoConfig, setCarregandoConfig] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!carregando && !logado) router.navigate({ to: "/login" });
  }, [logado, carregando, router]);

  useEffect(() => {
    if (!logado) return;
    (async () => {
      try {
        const c = await configuracoesApi.obter();
        setConfig(c);
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setCarregandoConfig(false);
      }
    })();
  }, [logado]);

  if (carregando || !logado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const atualizarCampo = <K extends keyof Configuracao>(chave: K, valor: Configuracao[K]) => {
    setConfig((c) => (c ? { ...c, [chave]: valor } : c));
  };

  const limitarTempo = (n: number) => Math.max(1, Math.min(59, Math.floor(n || 0)));
  const limitarPoms = (n: number) => Math.max(1, Math.min(99, Math.floor(n || 0)));

  const salvar = async () => {
    if (!config) return;
    setSalvando(true);
    setMensagem(null);
    setErro(null);
    try {
      const atualizado = await configuracoesApi.atualizar({
        tempoPomodoroMinutos: limitarTempo(config.tempoPomodoroMinutos),
        tempoDescansoCurtoMinutos: limitarTempo(config.tempoDescansoCurtoMinutos),
        tempoDescansoLongoMinutos: limitarTempo(config.tempoDescansoLongoMinutos),
        pomodorosParaDescansoLongo: limitarPoms(config.pomodorosParaDescansoLongo),
        iniciarDescansoAutomaticamente: config.iniciarDescansoAutomaticamente,
        iniciarPomodoroAutomaticamente: config.iniciarPomodoroAutomaticamente,
      });
      setConfig(atualizado);
      setMensagem("Configurações salvas.");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-semibold">Configurações</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Ajuste os tempos do seu ciclo Pomodoro.
        </p>

        {carregandoConfig || !config ? (
          <p className="text-sm text-muted-foreground">Carregando configurações...</p>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoNumero
                rotulo="Pomodoro (min)"
                valor={config.tempoPomodoroMinutos}
                min={1}
                max={59}
                onChange={(v) => atualizarCampo("tempoPomodoroMinutos", v)}
              />
              <CampoNumero
                rotulo="Descanso curto (min)"
                valor={config.tempoDescansoCurtoMinutos}
                min={1}
                max={59}
                onChange={(v) => atualizarCampo("tempoDescansoCurtoMinutos", v)}
              />
              <CampoNumero
                rotulo="Descanso longo (min)"
                valor={config.tempoDescansoLongoMinutos}
                min={1}
                max={59}
                onChange={(v) => atualizarCampo("tempoDescansoLongoMinutos", v)}
              />
              <CampoNumero
                rotulo="Pomodoros até descanso longo"
                valor={config.pomodorosParaDescansoLongo}
                min={1}
                max={99}
                onChange={(v) => atualizarCampo("pomodorosParaDescansoLongo", v)}
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
              <CampoCheck
                rotulo="Iniciar descanso automaticamente"
                valor={config.iniciarDescansoAutomaticamente}
                onChange={(v) => atualizarCampo("iniciarDescansoAutomaticamente", v)}
              />
              <CampoCheck
                rotulo="Iniciar pomodoro automaticamente"
                valor={config.iniciarPomodoroAutomaticamente}
                onChange={(v) => atualizarCampo("iniciarPomodoroAutomaticamente", v)}
              />
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {mensagem ?? (erro ? erro : "Tempos: 1 a 59 min. Pomodoros: 1 a 99.")}
              </p>
              <button
                onClick={salvar}
                disabled={salvando}
                className="cursor-pointer rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold tracking-widest text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {salvando ? "SALVANDO..." : "SALVAR"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CampoNumero({
  rotulo,
  valor,
  min,
  max,
  onChange,
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{rotulo}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

function CampoCheck({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string;
  valor: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <span className="text-sm text-foreground">{rotulo}</span>
      <input
        type="checkbox"
        checked={valor}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-primary)]"
      />
    </label>
  );
}
