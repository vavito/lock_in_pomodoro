import type { FastifyInstance } from 'fastify'

import { autenticar } from '../../../shared/infra/http/autenticar.js'
import { prisma } from '../../../shared/infra/prisma/prisma.js'
import { ConfiguracaoPomodoroController } from '../controller/configuracao-pomodoro.controller.js'
import { PrismaConfiguracaoPomodoroRepository } from '../repository/prisma-configuracao-pomodoro.repository.js'
import { AtualizarConfiguracaoPomodoroService } from '../service/atualizar-configuracao-pomodoro.service.js'
import { BuscarConfiguracaoPomodoroService } from '../service/buscar-configuracao-pomodoro.service.js'

export async function configuracoesPomodoroRoutes(app: FastifyInstance) {
  const configuracaoPomodoroRepository =
    new PrismaConfiguracaoPomodoroRepository(prisma)
  const buscarConfiguracaoPomodoroService =
    new BuscarConfiguracaoPomodoroService(configuracaoPomodoroRepository)
  const atualizarConfiguracaoPomodoroService =
    new AtualizarConfiguracaoPomodoroService(configuracaoPomodoroRepository)
  const configuracaoPomodoroController = new ConfiguracaoPomodoroController(
    buscarConfiguracaoPomodoroService,
    atualizarConfiguracaoPomodoroService,
  )

  app.get(
    '/configuracoes-pomodoro',
    {
      preHandler: autenticar,
    },
    configuracaoPomodoroController.buscar.bind(configuracaoPomodoroController),
  )

  app.patch(
    '/configuracoes-pomodoro',
    {
      preHandler: autenticar,
    },
    configuracaoPomodoroController.atualizar.bind(
      configuracaoPomodoroController,
    ),
  )
}
