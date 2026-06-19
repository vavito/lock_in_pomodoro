import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { AtualizarResumoDiarioService } from '../../resumos-diarios/service/atualizar-resumo-diario.service.js'
import { BuscarResumoDiarioService } from '../../resumos-diarios/service/buscar-resumo-diario.service.js'
import type { ResumoDiarioRepository } from '../../resumos-diarios/repository/resumo-diario.repository.js'
import type { SessaoPomodoroRepository } from '../repository/sessao-pomodoro.repository.js'

export class ConcluirSessaoPomodoroService {
  private readonly buscarResumoDiarioService: BuscarResumoDiarioService
  private readonly atualizarResumoDiarioService: AtualizarResumoDiarioService

  constructor(
    private readonly sessaoPomodoroRepository: SessaoPomodoroRepository,
    resumoDiarioRepository: ResumoDiarioRepository,
    buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService,
  ) {
    this.buscarResumoDiarioService = new BuscarResumoDiarioService(
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    )
    this.atualizarResumoDiarioService = new AtualizarResumoDiarioService(
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    )
  }

  async executar(usuarioId: string, sessaoId: string, data: Date) {
    const sessao = await this.sessaoPomodoroRepository.buscarPorIdEUsuarioId(
      sessaoId,
      usuarioId,
    )

    if (!sessao) {
      throw new ErroAplicacao('Sessao nao encontrada', 404)
    }

    sessao.concluir()

    const sessaoSalva = await this.sessaoPomodoroRepository.salvar(sessao)
    const resumo = await this.buscarResumoDiarioService.executar(
      usuarioId,
      data,
    )

    await this.atualizarResumoDiarioService.executar(usuarioId, data, {
      pomodorosRealizados:
        sessao.tipo === 'POMODORO'
          ? resumo.pomodorosRealizados + 1
          : resumo.pomodorosRealizados,
      descansosCurtosRealizados:
        sessao.tipo === 'DESCANSO_CURTO'
          ? resumo.descansosCurtosRealizados + 1
          : resumo.descansosCurtosRealizados,
      descansosLongosRealizados:
        sessao.tipo === 'DESCANSO_LONGO'
          ? resumo.descansosLongosRealizados + 1
          : resumo.descansosLongosRealizados,
    })

    return sessaoSalva
  }
}
