import type {
  StatusSessaoPomodoro,
  TipoSessaoPomodoro,
} from '../domain/SessaoPomodoro.js'

export type SessaoPomodoroRespostaDTO = {
  id: string
  usuarioId: string
  tipo: TipoSessaoPomodoro
  status: StatusSessaoPomodoro
  duracaoMinutos: number
  iniciadoEm: string | null
  finalizadoEm: string | null
  criadoEm: string
  atualizadoEm: string
}
