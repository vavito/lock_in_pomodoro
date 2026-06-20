import type { FastifyInstance } from 'fastify'

import { PrismaConfiguracaoPomodoroRepository } from '../../configuracoes-pomodoro/repository/prisma-configuracao-pomodoro.repository.js'
import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { PrismaResumoDiarioRepository } from '../../resumos-diarios/repository/prisma-resumo-diario.repository.js'
import { autenticar } from '../../../shared/infra/http/autenticar.js'
import { prisma } from '../../../shared/infra/prisma/prisma.js'
import { SessaoPomodoroController } from '../controller/sessao-pomodoro.controller.js'
import { PrismaSessaoPomodoroRepository } from '../repository/prisma-sessao-pomodoro.repository.js'
import { CancelarSessaoPomodoroService } from '../service/cancelar-sessao-pomodoro.service.js'
import { ConcluirSessaoPomodoroService } from '../service/concluir-sessao-pomodoro.service.js'
import { CriarSessaoPomodoroService } from '../service/criar-sessao-pomodoro.service.js'
import { PararSessaoPomodoroService } from '../service/parar-sessao-pomodoro.service.js'

export async function sessoesPomodoroRoutes(app: FastifyInstance) {
  const sessaoPomodoroRepository = new PrismaSessaoPomodoroRepository(prisma)
  const resumoDiarioRepository = new PrismaResumoDiarioRepository(prisma)
  const configuracaoPomodoroRepository =
    new PrismaConfiguracaoPomodoroRepository(prisma)
  const buscarConfiguracaoPomodoroService =
    new BuscarConfiguracaoPomodoroService(configuracaoPomodoroRepository)
  const criarSessaoPomodoroService = new CriarSessaoPomodoroService(
    sessaoPomodoroRepository,
    buscarConfiguracaoPomodoroService,
  )
  const concluirSessaoPomodoroService = new ConcluirSessaoPomodoroService(
    sessaoPomodoroRepository,
    resumoDiarioRepository,
    buscarConfiguracaoPomodoroService,
  )
  const cancelarSessaoPomodoroService = new CancelarSessaoPomodoroService(
    sessaoPomodoroRepository,
  )
  const pararSessaoPomodoroService = new PararSessaoPomodoroService(
    sessaoPomodoroRepository,
    resumoDiarioRepository,
    buscarConfiguracaoPomodoroService,
  )
  const sessaoPomodoroController = new SessaoPomodoroController(
    criarSessaoPomodoroService,
    concluirSessaoPomodoroService,
    cancelarSessaoPomodoroService,
    pararSessaoPomodoroService,
  )

  app.post(
    '/sessoes-pomodoro',
    {
      preHandler: autenticar,
    },
    sessaoPomodoroController.criar.bind(sessaoPomodoroController),
  )

  app.patch(
    '/sessoes-pomodoro/:id/concluir',
    {
      preHandler: autenticar,
    },
    sessaoPomodoroController.concluir.bind(sessaoPomodoroController),
  )

  app.patch(
    '/sessoes-pomodoro/:id/cancelar',
    {
      preHandler: autenticar,
    },
    sessaoPomodoroController.cancelar.bind(sessaoPomodoroController),
  )

  app.patch(
    '/sessoes-pomodoro/:id/parar',
    {
      preHandler: autenticar,
    },
    sessaoPomodoroController.parar.bind(sessaoPomodoroController),
  )
}
