export type TipoSessao = "POMODORO" | "DESCANSO_CURTO" | "DESCANSO_LONGO";
export type StatusSessao = "CRIADA" | "EM_ANDAMENTO" | "PAUSADA" | "CONCLUIDA" | "CANCELADA";

export type Usuario = {
  id: string;
  nome: string | null;
  email: string;
  criadoEm: string;
};

export type Configuracao = {
  id: string;
  usuarioId: string;
  tempoPomodoroMinutos: number;
  tempoDescansoCurtoMinutos: number;
  tempoDescansoLongoMinutos: number;
  pomodorosParaDescansoLongo: number;
  iniciarDescansoAutomaticamente: boolean;
  iniciarPomodoroAutomaticamente: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type Sessao = {
  id: string;
  usuarioId: string;
  tipo: TipoSessao;
  status: StatusSessao;
  duracaoMinutos: number;
  iniciadoEm: string | null;
  finalizadoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type ResumoDiario = {
  id: string;
  usuarioId: string;
  data: string;
  pomodorosRealizados: number;
  descansosCurtosRealizados: number;
  descansosLongosRealizados: number;
  tempoEstudandoMinutos: number;
  tempoDescansoMinutos: number;
  criadoEm: string;
  atualizadoEm: string;
};

export type Estatisticas = {
  pomodorosRealizados: number;
  descansosCurtosRealizados: number;
  descansosLongosRealizados: number;
  tempoEstudandoMinutos: number;
  tempoDescansoMinutos: number;
  diasUsados: number;
  dias: ResumoDiario[];
};

export type AuthResponse = {
  token: string;
  refreshToken: string;
  usuario?: Usuario;
};
