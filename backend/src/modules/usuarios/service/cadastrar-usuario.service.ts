import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import { Usuario } from '../domain/Usuario.js'
import type { CadastrarUsuarioDTO } from '../dto/cadastrar-usuario.dto.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'
import type { SenhaService } from './senha.service.js'

export class CadastrarUsuarioService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly senhaService: SenhaService,
  ) {}

  async executar(dto: CadastrarUsuarioDTO) {
    const usuarioExistente = await this.usuarioRepository.buscarPorEmail(
      dto.email,
    )

    if (usuarioExistente) {
      throw new ErroAplicacao('Email ja cadastrado', 409)
    }

    const senhaHash = await this.senhaService.gerarHash(dto.senha)

    const usuario = Usuario.criar({
      ...(dto.nome ? { nome: dto.nome } : {}),
      email: dto.email,
      senhaHash,
    })

    return this.usuarioRepository.salvar(usuario)
  }
}
