import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import type { SessaoPomodoroRepository } from '../repository/sessao-pomodoro.repository.js'

export class CancelarSessaoPomodoroService {
  constructor(
    private readonly sessaoPomodoroRepository: SessaoPomodoroRepository,
  ) {}

  async executar(usuarioId: string, sessaoId: string) {
    const sessao = await this.sessaoPomodoroRepository.buscarPorIdEUsuarioId(
      sessaoId,
      usuarioId,
    )

    if (!sessao) {
      throw new ErroAplicacao('Sessao nao encontrada', 404)
    }

    sessao.cancelar()

    return this.sessaoPomodoroRepository.salvar(sessao)
  }
}
