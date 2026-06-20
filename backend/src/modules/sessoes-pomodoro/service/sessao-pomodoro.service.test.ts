import { describe, expect, it } from 'vitest'

import { ConfiguracaoPomodoro } from '../../configuracoes-pomodoro/domain/ConfiguracaoPomodoro.js'
import type { ConfiguracaoPomodoroRepository } from '../../configuracoes-pomodoro/repository/configuracao-pomodoro.repository.js'
import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { ResumoDiario } from '../../resumos-diarios/domain/ResumoDiario.js'
import type { ResumoDiarioRepository } from '../../resumos-diarios/repository/resumo-diario.repository.js'
import { SessaoPomodoro } from '../domain/SessaoPomodoro.js'
import type { SessaoPomodoroRepository } from '../repository/sessao-pomodoro.repository.js'
import { CancelarSessaoPomodoroService } from './cancelar-sessao-pomodoro.service.js'
import { ConcluirSessaoPomodoroService } from './concluir-sessao-pomodoro.service.js'
import { CriarSessaoPomodoroService } from './criar-sessao-pomodoro.service.js'
import { PararSessaoPomodoroService } from './parar-sessao-pomodoro.service.js'

class SessaoPomodoroRepositoryEmMemoria implements SessaoPomodoroRepository {
  sessoes: SessaoPomodoro[] = []

  async buscarPorIdEUsuarioId(id: string, usuarioId: string) {
    return (
      this.sessoes.find(
        (sessao) => sessao.id === id && sessao.usuarioId === usuarioId,
      ) ?? null
    )
  }

  async salvar(sessao: SessaoPomodoro) {
    const indice = this.sessoes.findIndex(
      (sessaoSalva) => sessaoSalva.id === sessao.id,
    )

    if (indice >= 0) {
      this.sessoes[indice] = sessao
      return sessao
    }

    this.sessoes.push(sessao)
    return sessao
  }
}

class ResumoDiarioRepositoryEmMemoria implements ResumoDiarioRepository {
  resumos: ResumoDiario[] = []

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
  const sessaoPomodoroRepository = new SessaoPomodoroRepositoryEmMemoria()
  const resumoDiarioRepository = new ResumoDiarioRepositoryEmMemoria()
  const configuracaoPomodoroRepository =
    new ConfiguracaoPomodoroRepositoryEmMemoria()
  const buscarConfiguracaoPomodoroService =
    new BuscarConfiguracaoPomodoroService(configuracaoPomodoroRepository)

  return {
    sessaoPomodoroRepository,
    resumoDiarioRepository,
    criarSessaoPomodoroService: new CriarSessaoPomodoroService(
      sessaoPomodoroRepository,
      buscarConfiguracaoPomodoroService,
    ),
    concluirSessaoPomodoroService: new ConcluirSessaoPomodoroService(
      sessaoPomodoroRepository,
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    ),
    cancelarSessaoPomodoroService: new CancelarSessaoPomodoroService(
      sessaoPomodoroRepository,
    ),
    pararSessaoPomodoroService: new PararSessaoPomodoroService(
      sessaoPomodoroRepository,
      resumoDiarioRepository,
      buscarConfiguracaoPomodoroService,
    ),
  }
}

describe('sessao pomodoro', () => {
  it('deve criar sessao em andamento usando a duracao da configuracao', async () => {
    const { criarSessaoPomodoroService } = criarServicos()

    const sessao = await criarSessaoPomodoroService.executar('usuario-1', {
      tipo: 'POMODORO',
    })

    expect(sessao.status).toBe('EM_ANDAMENTO')
    expect(sessao.duracaoMinutos).toBe(25)
    expect(sessao.iniciadoEm).toBeInstanceOf(Date)
  })

  it('deve concluir sessao e incrementar resumo diario', async () => {
    const {
      criarSessaoPomodoroService,
      concluirSessaoPomodoroService,
      resumoDiarioRepository,
    } = criarServicos()
    const data = new Date('2026-06-19T00:00:00.000Z')
    const sessao = await criarSessaoPomodoroService.executar('usuario-1', {
      tipo: 'POMODORO',
    })

    const sessaoConcluida = await concluirSessaoPomodoroService.executar(
      'usuario-1',
      sessao.id,
      data,
    )
    const resumo = await resumoDiarioRepository.buscarPorUsuarioIdEData(
      'usuario-1',
      data,
    )

    expect(sessaoConcluida.status).toBe('CONCLUIDA')
    expect(resumo?.pomodorosRealizados).toBe(1)
    expect(resumo?.tempoEstudandoMinutos).toBe(25)
  })

  it('deve cancelar sessao em andamento sem incrementar resumo', async () => {
    const {
      criarSessaoPomodoroService,
      cancelarSessaoPomodoroService,
      resumoDiarioRepository,
    } = criarServicos()
    const sessao = await criarSessaoPomodoroService.executar('usuario-1', {
      tipo: 'DESCANSO_CURTO',
    })

    const sessaoCancelada = await cancelarSessaoPomodoroService.executar(
      'usuario-1',
      sessao.id,
    )
    const resumo = await resumoDiarioRepository.buscarPorUsuarioIdEData(
      'usuario-1',
      new Date('2026-06-19T00:00:00.000Z'),
    )

    expect(sessaoCancelada.status).toBe('CANCELADA')
    expect(resumo).toBeNull()
  })

  it('deve parar sessao e salvar tempo parcial sem incrementar contador', async () => {
    const {
      criarSessaoPomodoroService,
      pararSessaoPomodoroService,
      resumoDiarioRepository,
    } = criarServicos()
    const data = new Date('2026-06-19T00:00:00.000Z')
    const sessao = await criarSessaoPomodoroService.executar('usuario-1', {
      tipo: 'POMODORO',
    })

    const sessaoParada = await pararSessaoPomodoroService.executar(
      'usuario-1',
      sessao.id,
      data,
      12,
    )
    const resumo = await resumoDiarioRepository.buscarPorUsuarioIdEData(
      'usuario-1',
      data,
    )

    expect(sessaoParada.status).toBe('CANCELADA')
    expect(resumo?.pomodorosRealizados).toBe(0)
    expect(resumo?.tempoEstudandoMinutos).toBe(12)
  })

  it('nao deve concluir sessao cancelada', async () => {
    const {
      criarSessaoPomodoroService,
      cancelarSessaoPomodoroService,
      concluirSessaoPomodoroService,
    } = criarServicos()
    const sessao = await criarSessaoPomodoroService.executar('usuario-1', {
      tipo: 'POMODORO',
    })

    await cancelarSessaoPomodoroService.executar('usuario-1', sessao.id)

    await expect(
      concluirSessaoPomodoroService.executar(
        'usuario-1',
        sessao.id,
        new Date('2026-06-19T00:00:00.000Z'),
      ),
    ).rejects.toThrow('Apenas sessoes em andamento podem ser concluidas')
  })
})
