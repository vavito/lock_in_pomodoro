import type { PrismaClient } from '@prisma/client'

import type { SessaoPomodoro } from '../domain/SessaoPomodoro.js'
import { SessaoPomodoroMapper } from '../mapper/sessao-pomodoro.mapper.js'
import type { SessaoPomodoroRepository } from './sessao-pomodoro.repository.js'

export class PrismaSessaoPomodoroRepository implements SessaoPomodoroRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorIdEUsuarioId(id: string, usuarioId: string) {
    const sessao = await this.prisma.sessaoPomodoro.findFirst({
      where: {
        id,
        usuarioId,
      },
    })

    return sessao ? SessaoPomodoroMapper.paraDominio(sessao) : null
  }

  async salvar(sessao: SessaoPomodoro) {
    const dados = SessaoPomodoroMapper.paraPersistencia(sessao)

    const sessaoSalva = await this.prisma.sessaoPomodoro.upsert({
      where: {
        id: dados.id,
      },
      create: {
        id: dados.id,
        usuarioId: dados.usuarioId,
        tipo: dados.tipo,
        status: dados.status,
        duracaoMinutos: dados.duracaoMinutos,
        iniciadoEm: dados.iniciadoEm,
        finalizadoEm: dados.finalizadoEm,
      },
      update: {
        status: dados.status,
        iniciadoEm: dados.iniciadoEm,
        finalizadoEm: dados.finalizadoEm,
      },
    })

    return SessaoPomodoroMapper.paraDominio(sessaoSalva)
  }
}
