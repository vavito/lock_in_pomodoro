import type { AtualizarConfiguracaoPomodoroDTO } from '../dto/atualizar-configuracao-pomodoro.dto.js'
import type { ConfiguracaoPomodoroRepository } from '../repository/configuracao-pomodoro.repository.js'
import { BuscarConfiguracaoPomodoroService } from './buscar-configuracao-pomodoro.service.js'

export class AtualizarConfiguracaoPomodoroService {
  private readonly buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService

  constructor(
    private readonly configuracaoPomodoroRepository: ConfiguracaoPomodoroRepository,
  ) {
    this.buscarConfiguracaoPomodoroService =
      new BuscarConfiguracaoPomodoroService(configuracaoPomodoroRepository)
  }

  async executar(usuarioId: string, dto: AtualizarConfiguracaoPomodoroDTO) {
    const configuracao =
      await this.buscarConfiguracaoPomodoroService.executar(usuarioId)

    configuracao.atualizar(dto)

    return this.configuracaoPomodoroRepository.salvar(configuracao)
  }
}
