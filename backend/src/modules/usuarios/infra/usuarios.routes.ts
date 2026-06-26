import type { FastifyInstance } from 'fastify'

import { autenticar } from '../../../shared/infra/http/autenticar.js'
import { prisma } from '../../../shared/infra/prisma/prisma.js'
import { AuthController } from '../controller/auth.controller.js'
import { UsuarioController } from '../controller/usuario.controller.js'
import { PrismaTokenAtualizacaoRepository } from '../repository/prisma-token-atualizacao.repository.js'
import { PrismaUsuarioRepository } from '../repository/prisma-usuario.repository.js'
import { AlterarSenhaService } from '../service/alterar-senha.service.js'
import { AtualizarUsuarioService } from '../service/atualizar-usuario.service.js'
import { BuscarUsuarioLogadoService } from '../service/buscar-usuario-logado.service.js'
import { CadastrarUsuarioService } from '../service/cadastrar-usuario.service.js'
import { LoginUsuarioService } from '../service/login-usuario.service.js'
import {
  GerarTokenAtualizacaoService,
  LogoutService,
  RenovarTokenService,
} from '../service/token-atualizacao.service.js'
import { Argon2SenhaService } from './argon2-senha.service.js'

export async function usuariosRoutes(app: FastifyInstance) {
  const usuarioRepository = new PrismaUsuarioRepository(prisma)
  const tokenAtualizacaoRepository = new PrismaTokenAtualizacaoRepository(
    prisma,
  )
  const senhaService = new Argon2SenhaService()
  const cadastrarUsuarioService = new CadastrarUsuarioService(
    usuarioRepository,
    senhaService,
  )
  const loginUsuarioService = new LoginUsuarioService(
    usuarioRepository,
    senhaService,
  )
  const buscarUsuarioLogadoService = new BuscarUsuarioLogadoService(
    usuarioRepository,
  )
  const atualizarUsuarioService = new AtualizarUsuarioService(usuarioRepository)
  const alterarSenhaService = new AlterarSenhaService(
    usuarioRepository,
    senhaService,
  )
  const gerarTokenAtualizacaoService = new GerarTokenAtualizacaoService(
    tokenAtualizacaoRepository,
  )
  const renovarTokenService = new RenovarTokenService(
    tokenAtualizacaoRepository,
    usuarioRepository,
    gerarTokenAtualizacaoService,
  )
  const logoutService = new LogoutService(tokenAtualizacaoRepository)
  const authController = new AuthController(
    cadastrarUsuarioService,
    loginUsuarioService,
    gerarTokenAtualizacaoService,
    renovarTokenService,
    logoutService,
  )
  const usuarioController = new UsuarioController(
    buscarUsuarioLogadoService,
    atualizarUsuarioService,
    alterarSenhaService,
  )

  app.post('/auth/cadastro', authController.cadastrar.bind(authController))
  app.post('/auth/login', authController.login.bind(authController))
  app.post('/auth/refresh', authController.renovar.bind(authController))
  app.post('/auth/logout', authController.logout.bind(authController))
  app.get(
    '/usuarios/me',
    {
      preHandler: autenticar,
    },
    usuarioController.buscarLogado.bind(usuarioController),
  )
  app.patch(
    '/usuarios/me',
    {
      preHandler: autenticar,
    },
    usuarioController.atualizar.bind(usuarioController),
  )
  app.patch(
    '/usuarios/me/senha',
    {
      preHandler: autenticar,
    },
    usuarioController.alterarSenha.bind(usuarioController),
  )
}
