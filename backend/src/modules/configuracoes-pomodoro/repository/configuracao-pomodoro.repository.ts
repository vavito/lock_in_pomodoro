import type { ConfiguracaoPomodoro } from '../domain/ConfiguracaoPomodoro.js'

export interface ConfiguracaoPomodoroRepository {
  buscarPorUsuarioId(usuarioId: string): Promise<ConfiguracaoPomodoro | null>
  salvar(configuracao: ConfiguracaoPomodoro): Promise<ConfiguracaoPomodoro>
}
