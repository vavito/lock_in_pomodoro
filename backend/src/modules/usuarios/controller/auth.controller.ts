import type { FastifyReply, FastifyRequest } from 'fastify'

import { UsuarioMapper } from '../mapper/usuario.mapper.js'
import { CadastrarUsuarioService } from '../service/cadastrar-usuario.service.js'
import { LoginUsuarioService } from '../service/login-usuario.service.js'
import { cadastrarUsuarioSchema } from '../dto/cadastrar-usuario.dto.js'
import { loginUsuarioSchema } from '../dto/login-usuario.dto.js'

export class AuthController {
  constructor(
    private readonly cadastrarUsuarioService: CadastrarUsuarioService,
    private readonly loginUsuarioService: LoginUsuarioService,
  ) {}

  async cadastrar(request: FastifyRequest, reply: FastifyReply) {
    const dto = cadastrarUsuarioSchema.parse(request.body)
    const usuario = await this.cadastrarUsuarioService.executar(dto)
    const token = await reply.jwtSign({ sub: usuario.id })

    return reply.status(201).send({
      token,
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const dto = loginUsuarioSchema.parse(request.body)
    const usuario = await this.loginUsuarioService.executar(dto)
    const token = await reply.jwtSign({ sub: usuario.id })

    return reply.status(200).send({
      token,
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }
}
