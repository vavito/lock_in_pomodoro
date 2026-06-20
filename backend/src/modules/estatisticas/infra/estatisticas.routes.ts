import type { FastifyInstance } from 'fastify'

import { autenticar } from '../../../shared/infra/http/autenticar.js'
import { prisma } from '../../../shared/infra/prisma/prisma.js'
import { EstatisticasController } from '../controller/estatisticas.controller.js'
import { PrismaEstatisticasRepository } from '../repository/prisma-estatisticas.repository.js'
import { BuscarEstatisticasService } from '../service/buscar-estatisticas.service.js'

export async function estatisticasRoutes(app: FastifyInstance) {
  const estatisticasRepository = new PrismaEstatisticasRepository(prisma)
  const buscarEstatisticasService = new BuscarEstatisticasService(
    estatisticasRepository,
  )
  const estatisticasController = new EstatisticasController(
    buscarEstatisticasService,
  )

  app.get(
    '/estatisticas',
    {
      preHandler: autenticar,
    },
    estatisticasController.buscar.bind(estatisticasController),
  )
}
