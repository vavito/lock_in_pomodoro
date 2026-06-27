import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { BotaoFormulario } from "@/components/BotaoFormulario";
import { CampoNumero } from "@/components/CampoNumero";
import { CarregandoPagina } from "@/components/CarregandoPagina";
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
  head: () => ({ meta: [{ title: "Configurações - Lock In Pomodoro" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { logado, carregando } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [configSalva, setConfigSalva] = useState<Configuracao | null>(null);
  const [camposNumericos, setCamposNumericos] = useState<CamposNumericos | null>(null);
  const [carregandoConfig, setCarregandoConfig] = useState(true);
  const [salvando, setSalvando] = useState(false);
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
        setConfigSalva(c);
        setCamposNumericos(camposNumericosDaConfig(c));
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setCarregandoConfig(false);
      }
    })();
  }, [logado]);

  if (carregando || !logado) {
    return <CarregandoPagina />;
  }

  const atualizarCampo = <K extends keyof Configuracao>(chave: K, valor: Configuracao[K]) => {
    setConfig((c) => (c ? { ...c, [chave]: valor } : c));
  };

  const atualizarCampoNumerico = (chave: keyof CamposNumericos, valor: string) => {
    setErro(null);
    setErrosCampos((atual) => ({ ...atual, [chave]: undefined }));
    setCamposNumericos((campos) => (campos ? { ...campos, [chave]: valor } : campos));
  };

  const cancelarAlteracoes = () => {
    if (!configSalva) return;

    setConfig(configSalva);
    setCamposNumericos(camposNumericosDaConfig(configSalva));
    setErrosCampos({});
    setErro(null);
  };

  const validarNumero = (valor: string, min: number, max: number) => {
    if (valor.trim() === "") return `O valor deve estar entre ${min} e ${max}.`;

    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < min || numero > max) {
      return `O valor deve estar entre ${min} e ${max}.`;
    }

    return numero;
  };

  const salvar = async () => {
    if (!config || !camposNumericos) return;

    const tempoPomodoroMinutos = validarNumero(camposNumericos.tempoPomodoroMinutos, 1, 59);
    const tempoDescansoCurtoMinutos = validarNumero(
      camposNumericos.tempoDescansoCurtoMinutos,
      1,
      59,
    );
    const tempoDescansoLongoMinutos = validarNumero(
      camposNumericos.tempoDescansoLongoMinutos,
      1,
      59,
    );
    const pomodorosParaDescansoLongo = validarNumero(
      camposNumericos.pomodorosParaDescansoLongo,
      1,
      99,
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
      setConfigSalva(atualizado);
      setCamposNumericos(camposNumericosDaConfig(atualizado));
      window.dispatchEvent(
        new CustomEvent<Configuracao>("lockin.configuracaoAtualizada", { detail: atualizado }),
      );
      toast.success("Configurações salvas com sucesso.");
    } catch (e) {
      const mensagem = (e as Error).message;
      setErro(mensagem);
      toast.error(mensagem);
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
          <div className="animate-pulse rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 h-4 w-48 rounded-full bg-secondary" />
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, indice) => (
                <div key={indice} className="h-16 rounded-xl bg-secondary/70" />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-page-enter rounded-3xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg sm:p-8">
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {erro ? erro : "Tempos: 1 a 59 min. Pomodoros: 1 a 99."}
              </p>
              <div className="flex items-center gap-2">
                <BotaoFormulario
                  onClick={salvar}
                  carregando={salvando}
                  textoCarregando="SALVANDO..."
                  className="py-2.5"
                >
                  SALVAR
                </BotaoFormulario>
                <button
                  onClick={cancelarAlteracoes}
                  disabled={salvando}
                  className="cursor-pointer rounded-2xl border border-border bg-white px-6 py-2.5 text-sm font-bold tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md active:translate-y-0 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
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
