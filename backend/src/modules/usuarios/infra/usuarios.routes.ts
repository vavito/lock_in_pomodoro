import type { FastifyInstance } from 'fastify'

import { autenticar } from '../../../shared/infra/http/autenticar.js'
import { prisma } from '../../../shared/infra/prisma/prisma.js'
import { AuthController } from '../controller/auth.controller.js'
import { UsuarioController } from '../controller/usuario.controller.js'
import { PrismaUsuarioRepository } from '../repository/prisma-usuario.repository.js'
import { BuscarUsuarioLogadoService } from '../service/buscar-usuario-logado.service.js'
import { CadastrarUsuarioService } from '../service/cadastrar-usuario.service.js'
import { LoginUsuarioService } from '../service/login-usuario.service.js'
import { Argon2SenhaService } from './argon2-senha.service.js'

export async function usuariosRoutes(app: FastifyInstance) {
  const usuarioRepository = new PrismaUsuarioRepository(prisma)
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
  const authController = new AuthController(
    cadastrarUsuarioService,
    loginUsuarioService,
  )
  const usuarioController = new UsuarioController(buscarUsuarioLogadoService)

  app.post('/auth/cadastro', authController.cadastrar.bind(authController))
  app.post('/auth/login', authController.login.bind(authController))
  app.get(
    '/usuarios/me',
    {
      preHandler: autenticar,
    },
    usuarioController.buscarLogado.bind(usuarioController),
  )
}
