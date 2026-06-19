import { describe, expect, it } from 'vitest'

import { ConfiguracaoPomodoro } from '../../configuracoes-pomodoro/domain/ConfiguracaoPomodoro.js'
import type { ConfiguracaoPomodoroRepository } from '../../configuracoes-pomodoro/repository/configuracao-pomodoro.repository.js'
import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { ResumoDiario } from '../domain/ResumoDiario.js'
import type { ResumoDiarioRepository } from '../repository/resumo-diario.repository.js'
import { AtualizarResumoDiarioService } from './atualizar-resumo-diario.service.js'
import { BuscarResumoDiarioService } from './buscar-resumo-diario.service.js'

class ResumoDiarioRepositoryEmMemoria implements ResumoDiarioRepository {
  private resumos: ResumoDiario[] = []

  async buscarPorUsuarioIdEData(usuarioId: string, data: Date) {
    return (
      this.resumos.find(
        (resumo) =>
          resumo.usuarioId === usuarioId &&
          resumo.data.toISOString() === data.toISOString(),
      ) ?? null
    )
  }

  async salvar(resumo: ResumoDiario) {
    const indice = this.resumos.findIndex(
      (resumoSalvo) =>
        resumoSalvo.usuarioId === resumo.usuarioId &&
        resumoSalvo.data.toISOString() === resumo.data.toISOString(),
    )

    if (indice >= 0) {
      this.resumos[indice] = resumo
      return resumo
    }

    this.resumos.push(resumo)
    return resumo
  }
}

class ConfiguracaoPomodoroRepositoryEmMemoria implements ConfiguracaoPomodoroRepository {
  private configuracoes: ConfiguracaoPomodoro[] = []

  async buscarPorUsuarioId(usuarioId: string) {
    return (
      this.configuracoes.find(
        (configuracao) => configuracao.usuarioId === usuarioId,
      ) ?? null
    )
  }

  async salvar(configuracao: ConfiguracaoPomodoro) {
    this.configuracoes.push(configuracao)
    return configuracao
  }
}

function criarServicos() {
  const resumoDiarioRepository = new ResumoDiarioRepositoryEmMemoria()
  const configuracaoPomodoroRepository =
    new ConfiguracaoPomodoroRepositoryEmMemoria()
  const buscarConfiguracaoPomodoroService =
    new BuscarConfiguracaoPomodoroService(configuracaoPomodoroRepository)

  return {
    buscarResumoDiarioService: new BuscarResumoDiarioService(
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    ),
    atualizarResumoDiarioService: new AtualizarResumoDiarioService(
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    ),
  }
}

describe('resumo diario', () => {
  it('deve criar resumo zerado quando nao existir', async () => {
    const { buscarResumoDiarioService } = criarServicos()

    const resumo = await buscarResumoDiarioService.executar(
      'usuario-1',
      new Date('2026-06-19T00:00:00.000Z'),
    )

    expect(resumo.pomodorosRealizados).toBe(0)
    expect(resumo.descansosCurtosRealizados).toBe(0)
    expect(resumo.descansosLongosRealizados).toBe(0)
  })

  it('deve atualizar contadores e recalcular tempos', async () => {
    const { atualizarResumoDiarioService } = criarServicos()

    const resumo = await atualizarResumoDiarioService.executar(
      'usuario-1',
      new Date('2026-06-19T00:00:00.000Z'),
      {
        pomodorosRealizados: 3,
        descansosCurtosRealizados: 2,
        descansosLongosRealizados: 1,
      },
    )

    expect(resumo.tempoEstudandoMinutos).toBe(75)
    expect(resumo.tempoDescansoMinutos).toBe(25)
  })

  it('nao deve permitir contador maior que 1000', async () => {
    const { atualizarResumoDiarioService } = criarServicos()

    await expect(
      atualizarResumoDiarioService.executar(
        'usuario-1',
        new Date('2026-06-19T00:00:00.000Z'),
        {
          pomodorosRealizados: 1001,
        },
      ),
    ).rejects.toThrow('Pomodoros realizados deve estar entre 0 e 1000')
  })
})
