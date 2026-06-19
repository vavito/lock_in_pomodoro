import { ConfiguracaoPomodoro } from '../domain/ConfiguracaoPomodoro.js'
import type { ConfiguracaoPomodoroRepository } from '../repository/configuracao-pomodoro.repository.js'

export class BuscarConfiguracaoPomodoroService {
  constructor(
    private readonly configuracaoPomodoroRepository: ConfiguracaoPomodoroRepository,
  ) {}

  async executar(usuarioId: string) {
    const configuracao =
      await this.configuracaoPomodoroRepository.buscarPorUsuarioId(usuarioId)

    if (configuracao) {
      return configuracao
    }

    return this.configuracaoPomodoroRepository.salvar(
      ConfiguracaoPomodoro.criar({
        usuarioId,
      }),
    )
  }
}
