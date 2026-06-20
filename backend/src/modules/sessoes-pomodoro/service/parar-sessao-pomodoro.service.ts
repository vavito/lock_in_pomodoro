import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { BuscarResumoDiarioService } from '../../resumos-diarios/service/buscar-resumo-diario.service.js'
import type { ResumoDiarioRepository } from '../../resumos-diarios/repository/resumo-diario.repository.js'
import type { SessaoPomodoroRepository } from '../repository/sessao-pomodoro.repository.js'

export class PararSessaoPomodoroService {
  private readonly buscarResumoDiarioService: BuscarResumoDiarioService

  constructor(
    private readonly sessaoPomodoroRepository: SessaoPomodoroRepository,
    private readonly resumoDiarioRepository: ResumoDiarioRepository,
    buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService,
  ) {
    this.buscarResumoDiarioService = new BuscarResumoDiarioService(
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    )
  }

  async executar(
    usuarioId: string,
    sessaoId: string,
    data: Date,
    minutosRealizados: number,
  ) {
    const sessao = await this.sessaoPomodoroRepository.buscarPorIdEUsuarioId(
      sessaoId,
      usuarioId,
    )

    if (!sessao) {
      throw new ErroAplicacao('Sessao nao encontrada', 404)
    }

    const minutosSalvos = Math.min(minutosRealizados, sessao.duracaoMinutos)

    sessao.cancelar()

    const sessaoSalva = await this.sessaoPomodoroRepository.salvar(sessao)
    const resumo = await this.buscarResumoDiarioService.executar(
      usuarioId,
      data,
    )

    resumo.registrarTempoParcial(sessao.tipo, minutosSalvos)
    await this.resumoDiarioRepository.salvar(resumo)

    return sessaoSalva
  }
}
