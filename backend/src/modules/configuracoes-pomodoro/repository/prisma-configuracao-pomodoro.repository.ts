import type { PrismaClient } from '@prisma/client'

import type { ConfiguracaoPomodoro } from '../domain/ConfiguracaoPomodoro.js'
import { ConfiguracaoPomodoroMapper } from '../mapper/configuracao-pomodoro.mapper.js'
import type { ConfiguracaoPomodoroRepository } from './configuracao-pomodoro.repository.js'

export class PrismaConfiguracaoPomodoroRepository implements ConfiguracaoPomodoroRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorUsuarioId(usuarioId: string) {
    const configuracao = await this.prisma.configuracaoPomodoro.findUnique({
      where: {
        usuarioId,
      },
    })

    return configuracao
      ? ConfiguracaoPomodoroMapper.paraDominio(configuracao)
      : null
  }

  async salvar(configuracao: ConfiguracaoPomodoro) {
    const dados = ConfiguracaoPomodoroMapper.paraPersistencia(configuracao)

    const configuracaoSalva = await this.prisma.configuracaoPomodoro.upsert({
      where: {
        usuarioId: dados.usuarioId,
      },
      create: {
        id: dados.id,
        usuarioId: dados.usuarioId,
        tempoPomodoroMinutos: dados.tempoPomodoroMinutos,
        tempoDescansoCurtoMinutos: dados.tempoDescansoCurtoMinutos,
        tempoDescansoLongoMinutos: dados.tempoDescansoLongoMinutos,
        pomodorosParaDescansoLongo: dados.pomodorosParaDescansoLongo,
        iniciarDescansoAutomaticamente: dados.iniciarDescansoAutomaticamente,
        iniciarPomodoroAutomaticamente: dados.iniciarPomodoroAutomaticamente,
      },
      update: {
        tempoPomodoroMinutos: dados.tempoPomodoroMinutos,
        tempoDescansoCurtoMinutos: dados.tempoDescansoCurtoMinutos,
        tempoDescansoLongoMinutos: dados.tempoDescansoLongoMinutos,
        pomodorosParaDescansoLongo: dados.pomodorosParaDescansoLongo,
        iniciarDescansoAutomaticamente: dados.iniciarDescansoAutomaticamente,
        iniciarPomodoroAutomaticamente: dados.iniciarPomodoroAutomaticamente,
      },
    })

    return ConfiguracaoPomodoroMapper.paraDominio(configuracaoSalva)
  }
}
