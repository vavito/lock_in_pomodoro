import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { configuracoesApi, resumosApi, sessoesApi } from "@/services/api";
import type { Configuracao, ResumoDiario, TipoSessao } from "@/types";
import { formatarMMSS, hojeYYYYMMDD } from "@/lib/data";
import { ResumoDoDia } from "./ResumoDoDia";

const ABAS: { tipo: TipoSessao; rotulo: string }[] = [
  { tipo: "POMODORO", rotulo: "Pomodoro" },
  { tipo: "DESCANSO_CURTO", rotulo: "Curto" },
  { tipo: "DESCANSO_LONGO", rotulo: "Longo" },
];

const ROTULO_TIPO: Record<TipoSessao, string> = {
  POMODORO: "Pomodoro",
  DESCANSO_CURTO: "Descanso Curto",
  DESCANSO_LONGO: "Descanso Longo",
};

function tocarAlarme() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch (erro) {
    void erro;
  }
}

function notificar(texto: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("Lock In Pomodoro", { body: texto });
  }
}

function duracaoDeMinutos(tipo: TipoSessao, config: Configuracao | null): number {
  if (!config) {
    if (tipo === "POMODORO") return 25;
    if (tipo === "DESCANSO_CURTO") return 5;
    return 15;
  }
  if (tipo === "POMODORO") return config.tempoPomodoroMinutos;
  if (tipo === "DESCANSO_CURTO") return config.tempoDescansoCurtoMinutos;
  return config.tempoDescansoLongoMinutos;
}

export function Timer() {
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [resumo, setResumo] = useState<ResumoDiario | null>(null);
  const [tipo, setTipo] = useState<TipoSessao>("POMODORO");
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [timerCongelado, setTimerCongelado] = useState(false);
  const [minutosParciaisSalvos, setMinutosParciaisSalvos] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(25 * 60);
  const [erro, setErro] = useState<string | null>(null);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const c = await configuracoesApi.obter();
        if (!ativo) return;
        setConfig(c);
        setSegundosRestantes(c.tempoPomodoroMinutos * 60);
      } catch (e) {
        if (ativo) setErro((e as Error).message);
      }
      try {
        const r = await resumosApi.obter(hojeYYYYMMDD());
        if (ativo) setResumo(r);
      } catch (erro) {
        void erro;
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (rodando || timerCongelado) return;
    setSegundosRestantes(duracaoDeMinutos(tipo, config) * 60);
  }, [tipo, config, rodando, timerCongelado]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((erro) => {
        void erro;
      });
    }
  }, []);

  const limparIntervalo = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  const recarregarResumo = useCallback(async () => {
    try {
      const r = await resumosApi.obter(hojeYYYYMMDD());
      setResumo(r);
    } catch (erro) {
      void erro;
    }
  }, []);

  const iniciarComTipo = useCallback(
    async (t: TipoSessao, manterTempoAtual = false) => {
      setErro(null);
      try {
        const sessao = await sessoesApi.criar(t);
        setTipo(t);
        setSessaoId(sessao.id);
        setTimerCongelado(false);
        if (!manterTempoAtual) {
          setSegundosRestantes(duracaoDeMinutos(t, config) * 60);
          setMinutosParciaisSalvos(0);
        }
        setRodando(true);
      } catch (e) {
        setErro((e as Error).message);
      }
    },
    [config],
  );

  const concluirSessao = useCallback(
    async (id: string) => {
      try {
        await sessoesApi.concluir(id, hojeYYYYMMDD());
        tocarAlarme();
        notificar(`${ROTULO_TIPO[tipo]} concluído!`);
        await recarregarResumo();

        if (config) {
          let proximo: TipoSessao;
          if (tipo === "POMODORO") {
            const total = (resumo?.pomodorosRealizados ?? 0) + 1;
            proximo =
              total % config.pomodorosParaDescansoLongo === 0 ? "DESCANSO_LONGO" : "DESCANSO_CURTO";
            setTipo(proximo);
            setSessaoId(null);
            setRodando(false);
            setTimerCongelado(false);
            setMinutosParciaisSalvos(0);
            setSegundosRestantes(duracaoDeMinutos(proximo, config) * 60);
            if (config.iniciarDescansoAutomaticamente) {
              setTimeout(() => iniciarComTipo(proximo), 600);
            }
          } else {
            proximo = "POMODORO";
            setTipo(proximo);
            setSessaoId(null);
            setRodando(false);
            setTimerCongelado(false);
            setMinutosParciaisSalvos(0);
            setSegundosRestantes(duracaoDeMinutos(proximo, config) * 60);
            if (config.iniciarPomodoroAutomaticamente) {
              setTimeout(() => iniciarComTipo(proximo), 600);
            }
          }
        }
      } catch (e) {
        setErro((e as Error).message);
      }
    },
    [tipo, config, resumo, recarregarResumo, iniciarComTipo],
  );

  useEffect(() => {
    if (!rodando) return;
    intervaloRef.current = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s <= 1) {
          limparIntervalo();
          setRodando(false);
          const id = sessaoId;
          if (id) {
            concluirSessao(id);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => limparIntervalo();
  }, [rodando, sessaoId, concluirSessao]);

  const iniciar = () => iniciarComTipo(tipo, timerCongelado);

  const parar = async () => {
    limparIntervalo();
    setRodando(false);
    const id = sessaoId;
    const minutosRealizados = Math.floor((totalSegundos - segundosRestantes) / 60);
    const minutosParaSalvar = Math.max(0, minutosRealizados - minutosParciaisSalvos);
    setSessaoId(null);
    setTimerCongelado(true);
    if (id) {
      try {
        await sessoesApi.parar(id, hojeYYYYMMDD(), minutosParaSalvar);
        setMinutosParciaisSalvos(minutosRealizados);
        await recarregarResumo();
      } catch (e) {
        setErro((e as Error).message);
      }
    }
  };

  const pular = async () => {
    limparIntervalo();
    setRodando(false);
    const id = sessaoId;
    if (id) {
      await concluirSessao(id);
    }
  };

  const totalSegundos = duracaoDeMinutos(tipo, config) * 60;
  const progresso = useMemo(() => {
    if (!totalSegundos) return 0;
    return 1 - segundosRestantes / totalSegundos;
  }, [segundosRestantes, totalSegundos]);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="flex rounded-2xl bg-card p-1 ring-1 ring-border">
        {ABAS.map((a) => (
          <button
            key={a.tipo}
            onClick={() => {
              if (rodando) return;
              setTimerCongelado(false);
              setMinutosParciaisSalvos(0);
              setTipo(a.tipo);
            }}
            disabled={rodando && tipo !== a.tipo}
            className={
              "cursor-pointer rounded-xl px-5 py-2 text-sm font-medium transition-colors " +
              (tipo === a.tipo
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground")
            }
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center">
        <h1 className="font-mono-timer text-[6.5rem] font-extrabold leading-none tracking-tighter text-foreground sm:text-[10rem] md:text-[13rem]">
          {formatarMMSS(segundosRestantes)}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round(progresso * 100)}%` }}
            />
          </div>
          <span className="font-mono-timer text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {rodando ? "Ciclo em curso" : "Pronto"}
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-muted-foreground"
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
            className="group relative cursor-pointer rounded-2xl bg-primary px-12 py-5 text-lg font-bold tracking-widest text-primary-foreground ring-primary ring-offset-4 ring-offset-background transition-all hover:ring-2 active:scale-95"
          >
            INICIAR
          </button>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={parar}
              className="cursor-pointer rounded-2xl border border-border bg-card px-10 py-5 text-lg font-bold tracking-widest text-foreground transition-all hover:bg-secondary active:scale-95"
            >
              PARAR
            </button>
            <button
              onClick={pular}
              className="cursor-pointer rounded-2xl bg-primary px-10 py-5 text-lg font-bold tracking-widest text-primary-foreground transition-all hover:opacity-90 active:scale-95"
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
