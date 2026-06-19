import type { Usuario as PrismaUsuario } from '@prisma/client'

import { Usuario } from '../domain/Usuario.js'
import type { UsuarioRespostaDTO } from '../dto/usuario-resposta.dto.js'

export class UsuarioMapper {
  static paraDominio(usuario: PrismaUsuario) {
    return Usuario.criar({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      criadoEm: usuario.criadoEm,
      atualizadoEm: usuario.atualizadoEm,
    })
  }

  static paraPersistencia(usuario: Usuario) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      criadoEm: usuario.criadoEm,
      atualizadoEm: usuario.atualizadoEm,
    }
  }

  static paraResposta(usuario: Usuario): UsuarioRespostaDTO {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      criadoEm: usuario.criadoEm.toISOString(),
    }
  }
}
