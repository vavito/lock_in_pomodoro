import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'

export class BuscarUsuarioLogadoService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async executar(usuarioId: string) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId)

    if (!usuario) {
      throw new ErroAplicacao('Usuario nao encontrado', 404)
    }

    return usuario
  }
}
