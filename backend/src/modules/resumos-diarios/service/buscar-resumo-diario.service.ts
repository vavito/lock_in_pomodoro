import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { ResumoDiario } from '../domain/ResumoDiario.js'
import type { ResumoDiarioRepository } from '../repository/resumo-diario.repository.js'

export class BuscarResumoDiarioService {
  constructor(
    private readonly resumoDiarioRepository: ResumoDiarioRepository,
    private readonly buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService,
  ) {}

  async executar(usuarioId: string, data: Date) {
    const resumo = await this.resumoDiarioRepository.buscarPorUsuarioIdEData(
      usuarioId,
      data,
    )

    if (resumo) {
      return resumo
    }

    const configuracao =
      await this.buscarConfiguracaoPomodoroService.executar(usuarioId)
    const novoResumo = ResumoDiario.criar({
      usuarioId,
      data,
    })

    novoResumo.recalcularTempos(configuracao)

    return this.resumoDiarioRepository.salvar(novoResumo)
  }
}
