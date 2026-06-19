import type { FastifyReply, FastifyRequest } from 'fastify'

export async function autenticar(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({
      mensagem: 'Token invalido ou ausente',
    })
  }
}
