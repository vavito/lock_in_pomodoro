import { createContext } from "react";
import type { Configuracao, ResumoDiario, TipoSessao } from "@/types";

export type TimerContexto = {
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

export const TimerContext = createContext<TimerContexto | null>(null);
