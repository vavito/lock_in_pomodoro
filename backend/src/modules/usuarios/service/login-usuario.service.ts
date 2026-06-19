import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import type { LoginUsuarioDTO } from '../dto/login-usuario.dto.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'
import type { SenhaService } from './senha.service.js'

export class LoginUsuarioService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly senhaService: SenhaService,
  ) {}

  async executar(dto: LoginUsuarioDTO) {
    const usuario = await this.usuarioRepository.buscarPorEmail(dto.email)

    if (!usuario) {
      throw new ErroAplicacao('Email ou senha invalidos', 401)
    }

    const senhaValida = await this.senhaService.comparar(
      dto.senha,
      usuario.senhaHash,
    )

    if (!senhaValida) {
      throw new ErroAplicacao('Email ou senha invalidos', 401)
    }

    return usuario
  }
}
