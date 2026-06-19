import { describe, expect, it } from 'vitest'

import { ConfiguracaoPomodoro } from '../domain/ConfiguracaoPomodoro.js'
import type { ConfiguracaoPomodoroRepository } from '../repository/configuracao-pomodoro.repository.js'
import { AtualizarConfiguracaoPomodoroService } from './atualizar-configuracao-pomodoro.service.js'
import { BuscarConfiguracaoPomodoroService } from './buscar-configuracao-pomodoro.service.js'

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
    const indice = this.configuracoes.findIndex(
      (configuracaoSalva) =>
        configuracaoSalva.usuarioId === configuracao.usuarioId,
    )

    if (indice >= 0) {
      this.configuracoes[indice] = configuracao
      return configuracao
    }

    this.configuracoes.push(configuracao)
    return configuracao
  }
}

function criarServicos() {
  const repository = new ConfiguracaoPomodoroRepositoryEmMemoria()

  return {
    buscarConfiguracaoPomodoroService: new BuscarConfiguracaoPomodoroService(
      repository,
    ),
    atualizarConfiguracaoPomodoroService:
      new AtualizarConfiguracaoPomodoroService(repository),
  }
}

describe('configuracao pomodoro', () => {
  it('deve criar configuracao padrao quando nao existir', async () => {
    const { buscarConfiguracaoPomodoroService } = criarServicos()

    const configuracao =
      await buscarConfiguracaoPomodoroService.executar('usuario-1')

    expect(configuracao.tempoPomodoroMinutos).toBe(25)
    expect(configuracao.tempoDescansoCurtoMinutos).toBe(5)
    expect(configuracao.tempoDescansoLongoMinutos).toBe(15)
    expect(configuracao.pomodorosParaDescansoLongo).toBe(4)
  })

  it('deve atualizar tempos e automacoes', async () => {
    const { atualizarConfiguracaoPomodoroService } = criarServicos()

    const configuracao = await atualizarConfiguracaoPomodoroService.executar(
      'usuario-1',
      {
        tempoPomodoroMinutos: 40,
        tempoDescansoCurtoMinutos: 8,
        iniciarDescansoAutomaticamente: true,
      },
    )

    expect(configuracao.tempoPomodoroMinutos).toBe(40)
    expect(configuracao.tempoDescansoCurtoMinutos).toBe(8)
    expect(configuracao.iniciarDescansoAutomaticamente).toBe(true)
  })

  it('nao deve permitir tempo maior que 59 minutos', async () => {
    expect(() =>
      ConfiguracaoPomodoro.criar({
        usuarioId: 'usuario-1',
        tempoPomodoroMinutos: 60,
      }),
    ).toThrow('tempo do pomodoro deve estar entre 1 e 59 minutos')
  })

  it('nao deve permitir mais de 99 pomodoros para descanso longo', async () => {
    expect(() =>
      ConfiguracaoPomodoro.criar({
        usuarioId: 'usuario-1',
        pomodorosParaDescansoLongo: 100,
      }),
    ).toThrow('Pomodoros para descanso longo deve estar entre 1 e 99')
  })
})
