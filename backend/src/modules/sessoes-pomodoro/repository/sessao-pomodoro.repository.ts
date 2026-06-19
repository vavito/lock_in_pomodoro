import type { SessaoPomodoro } from '../domain/SessaoPomodoro.js'

export interface SessaoPomodoroRepository {
  buscarPorIdEUsuarioId(
    id: string,
    usuarioId: string,
  ): Promise<SessaoPomodoro | null>
  salvar(sessao: SessaoPomodoro): Promise<SessaoPomodoro>
}
