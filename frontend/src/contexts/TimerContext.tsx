import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hojeYYYYMMDD } from "@/lib/data";
import { configuracoesApi, resumosApi, sessoesApi } from "@/services/api";
import type { Configuracao, ResumoDiario, TipoSessao } from "@/types";

const ROTULO_TIPO: Record<TipoSessao, string> = {
  POMODORO: "Pomodoro",
  DESCANSO_CURTO: "Descanso Curto",
  DESCANSO_LONGO: "Descanso Longo",
};

type TimerContexto = {
  config: Configuracao | null;
  resumo: ResumoDiario | null;
  tipo: TipoSessao;
  rodando: boolean;
  segundosRestantes: number;
  totalSegundos: number;
  progresso: number;
  erro: string | null;
  iniciar: () => void;
  parar: () => Promise<void>;
  pular: () => Promise<void>;
  selecionarTipo: (tipo: TipoSessao) => void;
  recarregarResumo: () => Promise<void>;
};

const TimerContext = createContext<TimerContexto | null>(null);

function tocarAlarme() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.26, ctx.currentTime + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.15);

    [0, 0.28, 0.56, 0.84].forEach((inicio, indice) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(indice % 2 === 0 ? 880 : 740, ctx.currentTime + inicio);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + inicio);
      gain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + inicio + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + 0.18);
      osc.connect(gain);
      gain.connect(master);
      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + 0.2);
    });

    window.setTimeout(() => {
      ctx.close().catch((erro) => {
        void erro;
      });
    }, 1300);
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

export function TimerProvider({ children }: { children: ReactNode }) {
  const { logado, carregando } = useAuth();
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
  const tipoRef = useRef(tipo);
  const sessaoIdRef = useRef(sessaoId);
  const segundosRestantesRef = useRef(segundosRestantes);

  const limparIntervalo = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  const resetarTimer = useCallback(() => {
    limparIntervalo();
    setConfig(null);
    setResumo(null);
    setTipo("POMODORO");
    setSessaoId(null);
    setRodando(false);
    setTimerCongelado(false);
    setMinutosParciaisSalvos(0);
    setSegundosRestantes(25 * 60);
    setErro(null);
  }, [limparIntervalo]);

  useEffect(() => {
    tipoRef.current = tipo;
  }, [tipo]);

  useEffect(() => {
    sessaoIdRef.current = sessaoId;
  }, [sessaoId]);

  useEffect(() => {
    segundosRestantesRef.current = segundosRestantes;
  }, [segundosRestantes]);

  useEffect(() => {
    if (carregando) return;
    if (!logado) resetarTimer();
  }, [carregando, logado, resetarTimer]);

  useEffect(() => {
    if (!logado) return;

    let ativo = true;
    (async () => {
      try {
        const c = await configuracoesApi.obter();
        if (ativo) setConfig(c);
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
  }, [logado]);

  useEffect(() => {
    if (rodando || timerCongelado) return;
    setSegundosRestantes(duracaoDeMinutos(tipo, config) * 60);
  }, [tipo, config, rodando, timerCongelado]);

  useEffect(() => {
    if (!logado) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((erro) => {
        void erro;
      });
    }
  }, [logado]);

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
      if (!logado) return;

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
    [config, logado],
  );

  const concluirSessao = useCallback(
    async (id: string) => {
      const tipoAtual = tipoRef.current;

      try {
        await sessoesApi.concluir(id, hojeYYYYMMDD());
        tocarAlarme();
        notificar(`${ROTULO_TIPO[tipoAtual]} concluido!`);
        const resumoAtualizado = await resumosApi.obter(hojeYYYYMMDD());
        setResumo(resumoAtualizado);

        if (config) {
          let proximo: TipoSessao;
          if (tipoAtual === "POMODORO") {
            const total = resumoAtualizado.pomodorosRealizados;
            proximo =
              total % config.pomodorosParaDescansoLongo === 0 ? "DESCANSO_LONGO" : "DESCANSO_CURTO";
            setTipo(proximo);
            setSessaoId(null);
            setRodando(false);
            setTimerCongelado(false);
            setMinutosParciaisSalvos(0);
            setSegundosRestantes(duracaoDeMinutos(proximo, config) * 60);
            if (config.iniciarDescansoAutomaticamente) {
              window.setTimeout(() => iniciarComTipo(proximo), 600);
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
              window.setTimeout(() => iniciarComTipo(proximo), 600);
            }
          }
        }
      } catch (e) {
        setErro((e as Error).message);
      }
    },
    [config, iniciarComTipo],
  );

  useEffect(() => {
    if (!rodando) {
      limparIntervalo();
      return;
    }

    limparIntervalo();
    intervaloRef.current = setInterval(() => {
      setSegundosRestantes((segundos) => {
        if (segundos <= 1) {
          limparIntervalo();
          setRodando(false);
          const id = sessaoIdRef.current;
          if (id) void concluirSessao(id);
          return 0;
        }
        return segundos - 1;
      });
    }, 1000);

    return () => limparIntervalo();
  }, [rodando, concluirSessao, limparIntervalo]);

  const iniciar = useCallback(() => {
    void iniciarComTipo(tipoRef.current, timerCongelado);
  }, [iniciarComTipo, timerCongelado]);

  const parar = useCallback(async () => {
    limparIntervalo();
    setRodando(false);
    const id = sessaoIdRef.current;
    const totalSegundos = duracaoDeMinutos(tipoRef.current, config) * 60;
    const minutosRealizados = Math.floor((totalSegundos - segundosRestantesRef.current) / 60);
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
  }, [config, limparIntervalo, minutosParciaisSalvos, recarregarResumo]);

  const pular = useCallback(async () => {
    limparIntervalo();
    setRodando(false);
    const id = sessaoIdRef.current;
    if (id) await concluirSessao(id);
  }, [concluirSessao, limparIntervalo]);

  const selecionarTipo = useCallback(
    (novoTipo: TipoSessao) => {
      if (rodando) return;
      setTimerCongelado(false);
      setMinutosParciaisSalvos(0);
      setTipo(novoTipo);
    },
    [rodando],
  );

  const totalSegundos = duracaoDeMinutos(tipo, config) * 60;
  const progresso = useMemo(() => {
    if (!totalSegundos) return 0;
    return 1 - segundosRestantes / totalSegundos;
  }, [segundosRestantes, totalSegundos]);

  const valor = useMemo(
    () => ({
      config,
      resumo,
      tipo,
      rodando,
      segundosRestantes,
      totalSegundos,
      progresso,
      erro,
      iniciar,
      parar,
      pular,
      selecionarTipo,
      recarregarResumo,
    }),
    [
      config,
      resumo,
      tipo,
      rodando,
      segundosRestantes,
      totalSegundos,
      progresso,
      erro,
      iniciar,
      parar,
      pular,
      selecionarTipo,
      recarregarResumo,
    ],
  );

  return <TimerContext.Provider value={valor}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const contexto = useContext(TimerContext);
  if (!contexto) {
    throw new Error("useTimer deve ser usado dentro de TimerProvider.");
  }
  return contexto;
}
