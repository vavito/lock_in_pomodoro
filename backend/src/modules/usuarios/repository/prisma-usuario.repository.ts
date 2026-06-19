import type { PrismaClient } from '@prisma/client'

import type { Usuario } from '../domain/Usuario.js'
import { UsuarioMapper } from '../mapper/usuario.mapper.js'
import type { UsuarioRepository } from './usuario.repository.js'

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorEmail(email: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    })

    return usuario ? UsuarioMapper.paraDominio(usuario) : null
  }

  async buscarPorId(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id,
      },
    })

    return usuario ? UsuarioMapper.paraDominio(usuario) : null
  }

  async salvar(usuario: Usuario) {
    const dados = UsuarioMapper.paraPersistencia(usuario)

    const usuarioCriado = await this.prisma.usuario.create({
      data: {
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        senhaHash: dados.senhaHash,
        configuracao: {
          create: {},
        },
      },
    })

    return UsuarioMapper.paraDominio(usuarioCriado)
  }
}
