import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import type { AtualizarResumoDiarioDTO } from '../dto/atualizar-resumo-diario.dto.js'
import type { ResumoDiarioRepository } from '../repository/resumo-diario.repository.js'
import { BuscarResumoDiarioService } from './buscar-resumo-diario.service.js'

export class AtualizarResumoDiarioService {
  private readonly buscarResumoDiarioService: BuscarResumoDiarioService

  constructor(
    private readonly resumoDiarioRepository: ResumoDiarioRepository,
    private readonly buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService,
  ) {
    this.buscarResumoDiarioService = new BuscarResumoDiarioService(
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    )
  }

  async executar(usuarioId: string, data: Date, dto: AtualizarResumoDiarioDTO) {
    const resumo = await this.buscarResumoDiarioService.executar(
      usuarioId,
      data,
    )
    const configuracao =
      await this.buscarConfiguracaoPomodoroService.executar(usuarioId)

    resumo.atualizarContadores(dto, configuracao)

    return this.resumoDiarioRepository.salvar(resumo)
  }
}
