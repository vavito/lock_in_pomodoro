import type { FastifyReply, FastifyRequest } from 'fastify'

export class SaudeController {
  async verificar(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      status: 'ok',
      nome: 'lock-in-pomodoro-api',
    })
  }
}
