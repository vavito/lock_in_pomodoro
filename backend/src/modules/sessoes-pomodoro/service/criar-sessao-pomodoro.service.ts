import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { SessaoPomodoro } from '../domain/SessaoPomodoro.js'
import type { CriarSessaoPomodoroDTO } from '../dto/criar-sessao-pomodoro.dto.js'
import type { SessaoPomodoroRepository } from '../repository/sessao-pomodoro.repository.js'

export class CriarSessaoPomodoroService {
  constructor(
    private readonly sessaoPomodoroRepository: SessaoPomodoroRepository,
    private readonly buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService,
  ) {}

  async executar(usuarioId: string, dto: CriarSessaoPomodoroDTO) {
    const configuracao =
      await this.buscarConfiguracaoPomodoroService.executar(usuarioId)
    const duracaoMinutos = {
      POMODORO: configuracao.tempoPomodoroMinutos,
      DESCANSO_CURTO: configuracao.tempoDescansoCurtoMinutos,
      DESCANSO_LONGO: configuracao.tempoDescansoLongoMinutos,
    }[dto.tipo]
    const sessao = SessaoPomodoro.iniciarNova(
      usuarioId,
      dto.tipo,
      duracaoMinutos,
    )

    return this.sessaoPomodoroRepository.salvar(sessao)
  }
}
