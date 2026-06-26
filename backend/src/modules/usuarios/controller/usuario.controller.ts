import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  alterarSenhaSchema,
  type AlterarSenhaDTO,
} from '../dto/alterar-senha.dto.js'
import {
  atualizarUsuarioSchema,
  type AtualizarUsuarioDTO,
} from '../dto/atualizar-usuario.dto.js'
import { UsuarioMapper } from '../mapper/usuario.mapper.js'
import type { AlterarSenhaService } from '../service/alterar-senha.service.js'
import type { AtualizarUsuarioService } from '../service/atualizar-usuario.service.js'
import type { BuscarUsuarioLogadoService } from '../service/buscar-usuario-logado.service.js'

export class UsuarioController {
  constructor(
    private readonly buscarUsuarioLogadoService: BuscarUsuarioLogadoService,
    private readonly atualizarUsuarioService: AtualizarUsuarioService,
    private readonly alterarSenhaService: AlterarSenhaService,
  ) {}

  async buscarLogado(request: FastifyRequest, reply: FastifyReply) {
    const usuario = await this.buscarUsuarioLogadoService.executar(
      request.user.sub,
    )

    return reply.status(200).send({
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    const dto = atualizarUsuarioSchema.parse(
      request.body,
    ) as AtualizarUsuarioDTO
    const usuario = await this.atualizarUsuarioService.executar(
      request.user.sub,
      dto,
    )

    return reply.status(200).send({
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }

  async alterarSenha(request: FastifyRequest, reply: FastifyReply) {
    const dto = alterarSenhaSchema.parse(request.body) as AlterarSenhaDTO
    const usuario = await this.alterarSenhaService.executar(
      request.user.sub,
      dto,
    )

    return reply.status(200).send({
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }
}
