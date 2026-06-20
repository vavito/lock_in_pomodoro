import type { FastifyReply, FastifyRequest } from 'fastify'

import { UsuarioMapper } from '../mapper/usuario.mapper.js'
import { CadastrarUsuarioService } from '../service/cadastrar-usuario.service.js'
import { LoginUsuarioService } from '../service/login-usuario.service.js'
import { cadastrarUsuarioSchema } from '../dto/cadastrar-usuario.dto.js'
import { loginUsuarioSchema } from '../dto/login-usuario.dto.js'
import { refreshTokenSchema } from '../dto/refresh-token.dto.js'
import {
  GerarTokenAtualizacaoService,
  LogoutService,
  RenovarTokenService,
} from '../service/token-atualizacao.service.js'

export class AuthController {
  constructor(
    private readonly cadastrarUsuarioService: CadastrarUsuarioService,
    private readonly loginUsuarioService: LoginUsuarioService,
    private readonly gerarTokenAtualizacaoService: GerarTokenAtualizacaoService,
    private readonly renovarTokenService: RenovarTokenService,
    private readonly logoutService: LogoutService,
  ) {}

  async cadastrar(request: FastifyRequest, reply: FastifyReply) {
    const dto = cadastrarUsuarioSchema.parse(request.body)
    const usuario = await this.cadastrarUsuarioService.executar(dto)
    const token = await reply.jwtSign({ sub: usuario.id })
    const refreshToken = await this.gerarTokenAtualizacaoService.executar(
      usuario.id,
    )

    return reply.status(201).send({
      token,
      refreshToken,
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const dto = loginUsuarioSchema.parse(request.body)
    const usuario = await this.loginUsuarioService.executar(dto)
    const token = await reply.jwtSign({ sub: usuario.id })
    const refreshToken = await this.gerarTokenAtualizacaoService.executar(
      usuario.id,
    )

    return reply.status(200).send({
      token,
      refreshToken,
      usuario: UsuarioMapper.paraResposta(usuario),
    })
  }

  async renovar(request: FastifyRequest, reply: FastifyReply) {
    const dto = refreshTokenSchema.parse(request.body)
    const resultado = await this.renovarTokenService.executar(dto.refreshToken)
    const token = await reply.jwtSign({ sub: resultado.usuario.id })

    return reply.status(200).send({
      token,
      refreshToken: resultado.refreshToken,
      usuario: UsuarioMapper.paraResposta(resultado.usuario),
    })
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const dto = refreshTokenSchema.parse(request.body)

    await this.logoutService.executar(dto.refreshToken)

    return reply.status(200).send({
      mensagem: 'Logout realizado com sucesso',
    })
  }
}
