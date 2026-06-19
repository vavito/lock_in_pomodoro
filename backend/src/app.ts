import cors from '@fastify/cors'
import fastify from 'fastify'

import { saudeRoutes } from './modules/saude/infra/saude.routes.js'
import { env } from './shared/config/env.js'
import { prisma } from './shared/infra/prisma/prisma.js'

export function construirApp() {
  const app = fastify({
    logger: env.NODE_ENV !== 'test',
  })

  app.register(cors, {
    origin: env.ORIGEM_FRONTEND === '*' ? true : env.ORIGEM_FRONTEND,
  })

  app.register(saudeRoutes)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  app.setErrorHandler((erro, request, reply) => {
    request.log.error({ erro }, 'Erro inesperado na API')

    return reply.status(500).send({
      mensagem: 'Erro interno do servidor',
    })
  })

  return app
}
