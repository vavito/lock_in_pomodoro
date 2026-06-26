import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import type { AtualizarUsuarioDTO } from '../dto/atualizar-usuario.dto.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'

export class AtualizarUsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async executar(usuarioId: string, dto: AtualizarUsuarioDTO) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId)

    if (!usuario) {
      throw new ErroAplicacao('Usuario nao encontrado', 404)
    }

    if (dto.email && !usuario.possuiEmail(dto.email)) {
      const usuarioComEmail = await this.usuarioRepository.buscarPorEmail(
        dto.email,
      )

      if (usuarioComEmail) {
        throw new ErroAplicacao('Email ja cadastrado', 409)
      }

      usuario.atualizarEmail(dto.email)
    }

    if (dto.nome !== undefined) {
      usuario.atualizarNome(dto.nome)
    }

    return this.usuarioRepository.atualizar(usuario)
  }
}
