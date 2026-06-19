import type { FastifyInstance } from 'fastify'

import { PrismaConfiguracaoPomodoroRepository } from '../../configuracoes-pomodoro/repository/prisma-configuracao-pomodoro.repository.js'
import { BuscarConfiguracaoPomodoroService } from '../../configuracoes-pomodoro/service/buscar-configuracao-pomodoro.service.js'
import { autenticar } from '../../../shared/infra/http/autenticar.js'
import { prisma } from '../../../shared/infra/prisma/prisma.js'
import { ResumoDiarioController } from '../controller/resumo-diario.controller.js'
import { PrismaResumoDiarioRepository } from '../repository/prisma-resumo-diario.repository.js'
import { AtualizarResumoDiarioService } from '../service/atualizar-resumo-diario.service.js'
import { BuscarResumoDiarioService } from '../service/buscar-resumo-diario.service.js'

export async function resumosDiariosRoutes(app: FastifyInstance) {
  const resumoDiarioRepository = new PrismaResumoDiarioRepository(prisma)
  const configuracaoPomodoroRepository =
    new PrismaConfiguracaoPomodoroRepository(prisma)
  const buscarConfiguracaoPomodoroService =
    new BuscarConfiguracaoPomodoroService(configuracaoPomodoroRepository)
  const buscarResumoDiarioService = new BuscarResumoDiarioService(
    resumoDiarioRepository,
    buscarConfiguracaoPomodoroService,
  )
  const atualizarResumoDiarioService = new AtualizarResumoDiarioService(
    resumoDiarioRepository,
    buscarConfiguracaoPomodoroService,
  )
  const resumoDiarioController = new ResumoDiarioController(
    buscarResumoDiarioService,
    atualizarResumoDiarioService,
  )

  app.get(
    '/resumos-diarios/:data',
    {
      preHandler: autenticar,
    },
    resumoDiarioController.buscar.bind(resumoDiarioController),
  )

  app.patch(
    '/resumos-diarios/:data',
    {
      preHandler: autenticar,
    },
    resumoDiarioController.atualizar.bind(resumoDiarioController),
  )
}
