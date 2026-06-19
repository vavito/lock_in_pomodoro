import type { FastifyReply, FastifyRequest } from 'fastify'

import { UsuarioMapper } from '../mapper/usuario.mapper.js'
import type { BuscarUsuarioLogadoService } from '../service/buscar-usuario-logado.service.js'

export class UsuarioController {
  constructor(
    private readonly buscarUsuarioLogadoService: BuscarUsuarioLogadoService,
  ) {}

  async buscarLogado(request: FastifyRequest, reply: FastifyReply) {
    const usuario = await this.buscarUsuarioLogadoService.executar(
      request.user.sub,
    )

    return reply.status(200).send({
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }
}
