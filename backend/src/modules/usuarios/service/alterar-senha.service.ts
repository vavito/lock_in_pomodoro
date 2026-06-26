import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import type { AlterarSenhaDTO } from '../dto/alterar-senha.dto.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'
import type { SenhaService } from './senha.service.js'

export class AlterarSenhaService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly senhaService: SenhaService,
  ) {}

  async executar(usuarioId: string, dto: AlterarSenhaDTO) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId)

    if (!usuario) {
      throw new ErroAplicacao('Usuario nao encontrado', 404)
    }

    const senhaAtualValida = await this.senhaService.comparar(
      dto.senhaAtual,
      usuario.senhaHash,
    )

    if (!senhaAtualValida) {
      throw new ErroAplicacao('Senha atual invalida', 401)
    }

    const novaSenhaHash = await this.senhaService.gerarHash(dto.novaSenha)
    usuario.atualizarSenhaHash(novaSenhaHash)

    return this.usuarioRepository.atualizar(usuario)
  }
}
