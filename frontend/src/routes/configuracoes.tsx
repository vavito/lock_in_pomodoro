import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { configuracoesApi } from "@/services/api";
import type { Configuracao } from "@/types";

type CamposNumericos = {
  tempoPomodoroMinutos: string;
  tempoDescansoCurtoMinutos: string;
  tempoDescansoLongoMinutos: string;
  pomodorosParaDescansoLongo: string;
};

export const Route = createFileRoute("/configuracoes")({
  ssr: false,
  head: () => ({ meta: [{ title: "Configurações — Lock In Pomodoro" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { logado, carregando } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [camposNumericos, setCamposNumericos] = useState<CamposNumericos | null>(null);
  const [carregandoConfig, setCarregandoConfig] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampos, setErrosCampos] = useState<Partial<CamposNumericos>>({});

  useEffect(() => {
    if (!carregando && !logado) router.navigate({ to: "/login" });
  }, [logado, carregando, router]);

  useEffect(() => {
    if (!logado) return;
    (async () => {
      try {
        const c = await configuracoesApi.obter();
        setConfig(c);
        setCamposNumericos(camposNumericosDaConfig(c));
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

  const atualizarCampoNumerico = (chave: keyof CamposNumericos, valor: string) => {
    setMensagem(null);
    setErro(null);
    setErrosCampos((atual) => ({ ...atual, [chave]: undefined }));
    setCamposNumericos((campos) => (campos ? { ...campos, [chave]: valor } : campos));
  };

  const validarNumero = (valor: string, min: number, max: number, rotulo: string) => {
    if (valor.trim() === "") return `${rotulo} deve estar entre ${min} e ${max}.`;

    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < min || numero > max) {
      return `${rotulo} deve estar entre ${min} e ${max}.`;
    }

    return numero;
  };

  const salvar = async () => {
    if (!config || !camposNumericos) return;

    const tempoPomodoroMinutos = validarNumero(
      camposNumericos.tempoPomodoroMinutos,
      1,
      59,
      "Pomodoro",
    );
    const tempoDescansoCurtoMinutos = validarNumero(
      camposNumericos.tempoDescansoCurtoMinutos,
      1,
      59,
      "Descanso curto",
    );
    const tempoDescansoLongoMinutos = validarNumero(
      camposNumericos.tempoDescansoLongoMinutos,
      1,
      59,
      "Descanso longo",
    );
    const pomodorosParaDescansoLongo = validarNumero(
      camposNumericos.pomodorosParaDescansoLongo,
      1,
      99,
      "Pomodoros ate descanso longo",
    );

    const novosErros = {
      tempoPomodoroMinutos:
        typeof tempoPomodoroMinutos === "string" ? tempoPomodoroMinutos : undefined,
      tempoDescansoCurtoMinutos:
        typeof tempoDescansoCurtoMinutos === "string" ? tempoDescansoCurtoMinutos : undefined,
      tempoDescansoLongoMinutos:
        typeof tempoDescansoLongoMinutos === "string" ? tempoDescansoLongoMinutos : undefined,
      pomodorosParaDescansoLongo:
        typeof pomodorosParaDescansoLongo === "string" ? pomodorosParaDescansoLongo : undefined,
    };

    setErrosCampos(novosErros);
    if (
      typeof tempoPomodoroMinutos === "string" ||
      typeof tempoDescansoCurtoMinutos === "string" ||
      typeof tempoDescansoLongoMinutos === "string" ||
      typeof pomodorosParaDescansoLongo === "string"
    ) {
      return;
    }

    setSalvando(true);
    setMensagem(null);
    setErro(null);
    try {
      const atualizado = await configuracoesApi.atualizar({
        tempoPomodoroMinutos,
        tempoDescansoCurtoMinutos,
        tempoDescansoLongoMinutos,
        pomodorosParaDescansoLongo,
        iniciarDescansoAutomaticamente: config.iniciarDescansoAutomaticamente,
        iniciarPomodoroAutomaticamente: config.iniciarPomodoroAutomaticamente,
      });
      setConfig(atualizado);
      setCamposNumericos(camposNumericosDaConfig(atualizado));
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

        {carregandoConfig || !config || !camposNumericos ? (
          <p className="text-sm text-muted-foreground">Carregando configurações...</p>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <CampoNumero
                rotulo="Pomodoro (min)"
                valor={camposNumericos.tempoPomodoroMinutos}
                min={1}
                max={59}
                erro={errosCampos.tempoPomodoroMinutos}
                onChange={(v) => atualizarCampoNumerico("tempoPomodoroMinutos", v)}
              />
              <CampoNumero
                rotulo="Descanso curto (min)"
                valor={camposNumericos.tempoDescansoCurtoMinutos}
                min={1}
                max={59}
                erro={errosCampos.tempoDescansoCurtoMinutos}
                onChange={(v) => atualizarCampoNumerico("tempoDescansoCurtoMinutos", v)}
              />
              <CampoNumero
                rotulo="Descanso longo (min)"
                valor={camposNumericos.tempoDescansoLongoMinutos}
                min={1}
                max={59}
                erro={errosCampos.tempoDescansoLongoMinutos}
                onChange={(v) => atualizarCampoNumerico("tempoDescansoLongoMinutos", v)}
              />
              <CampoNumero
                rotulo="Pomodoros até descanso longo"
                valor={camposNumericos.pomodorosParaDescansoLongo}
                min={1}
                max={99}
                erro={errosCampos.pomodorosParaDescansoLongo}
                onChange={(v) => atualizarCampoNumerico("pomodorosParaDescansoLongo", v)}
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
  erro,
  onChange,
}: {
  rotulo: string;
  valor: string;
  min: number;
  max: number;
  erro?: string;
  onChange: (valor: string) => void;
}) {
  const alterar = (novoValor: string) => {
    if (/^\d*$/.test(novoValor)) onChange(novoValor);
  };

  const somar = (quantidade: number) => {
    const atual = valor.trim() === "" ? min : Number(valor);
    const proximo = Math.max(min, Math.min(max, atual + quantidade));
    onChange(String(proximo));
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{rotulo}</span>
      <div className="flex overflow-hidden rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary">
        <button
          type="button"
          onClick={() => somar(-1)}
          className="w-10 border-r border-border text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          -
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={(e) => alterar(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-center text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={() => somar(1)}
          className="w-10 border-l border-border text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          +
        </button>
      </div>
      {erro && <span className="text-xs text-destructive">{erro}</span>}
    </label>
  );
}

function camposNumericosDaConfig(config: Configuracao): CamposNumericos {
  return {
    tempoPomodoroMinutos: String(config.tempoPomodoroMinutos),
    tempoDescansoCurtoMinutos: String(config.tempoDescansoCurtoMinutos),
    tempoDescansoLongoMinutos: String(config.tempoDescansoLongoMinutos),
    pomodorosParaDescansoLongo: String(config.pomodorosParaDescansoLongo),
  };
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
