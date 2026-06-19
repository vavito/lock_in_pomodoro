import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastify from 'fastify'
import { ZodError } from 'zod'

import { configuracoesPomodoroRoutes } from './modules/configuracoes-pomodoro/infra/configuracoes-pomodoro.routes.js'
import { resumosDiariosRoutes } from './modules/resumos-diarios/infra/resumos-diarios.routes.js'
import { saudeRoutes } from './modules/saude/infra/saude.routes.js'
import { sessoesPomodoroRoutes } from './modules/sessoes-pomodoro/infra/sessoes-pomodoro.routes.js'
import { usuariosRoutes } from './modules/usuarios/infra/usuarios.routes.js'
import { env } from './shared/config/env.js'
import { ErroAplicacao } from './shared/errors/erro-aplicacao.js'
import { prisma } from './shared/infra/prisma/prisma.js'

export function construirApp() {
  const app = fastify({
    logger: env.NODE_ENV !== 'test',
  })

  app.register(cors, {
    origin: env.ORIGEM_FRONTEND === '*' ? true : env.ORIGEM_FRONTEND,
  })

  app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '7d',
    },
  })

  app.register(saudeRoutes)
  app.register(usuariosRoutes)
  app.register(configuracoesPomodoroRoutes)
  app.register(resumosDiariosRoutes)
  app.register(sessoesPomodoroRoutes)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  app.setErrorHandler((erro, request, reply) => {
    if (erro instanceof ZodError) {
      return reply.status(400).send({
        mensagem: 'Dados invalidos',
        campos: erro.issues,
      })
    }

    if (erro instanceof ErroAplicacao) {
      return reply.status(erro.statusCode).send({
        mensagem: erro.message,
      })
    }

    request.log.error({ erro }, 'Erro inesperado na API')

    return reply.status(500).send({
      mensagem: 'Erro interno do servidor',
    })
  })

  return app
}
