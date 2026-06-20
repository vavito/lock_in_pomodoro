import { createHash, randomBytes } from 'node:crypto'

import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import { TokenAtualizacao } from '../domain/TokenAtualizacao.js'
import type { TokenAtualizacaoRepository } from '../repository/token-atualizacao.repository.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'

export class GerarTokenAtualizacaoService {
  constructor(
    private readonly tokenAtualizacaoRepository: TokenAtualizacaoRepository,
  ) {}

  async executar(usuarioId: string) {
    const refreshToken = randomBytes(64).toString('hex')
    const tokenHash = gerarHashToken(refreshToken)
    const expiraEm = new Date()

    expiraEm.setDate(expiraEm.getDate() + 30)

    await this.tokenAtualizacaoRepository.salvar(
      TokenAtualizacao.criar({
        usuarioId,
        tokenHash,
        expiraEm,
      }),
    )

    return refreshToken
  }
}

export class RenovarTokenService {
  constructor(
    private readonly tokenAtualizacaoRepository: TokenAtualizacaoRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly gerarTokenAtualizacaoService: GerarTokenAtualizacaoService,
  ) {}

  async executar(refreshToken: string) {
    const token = await this.tokenAtualizacaoRepository.buscarPorHash(
      gerarHashToken(refreshToken),
    )

    if (!token || !token.estaAtivo()) {
      throw new ErroAplicacao('Refresh token invalido ou expirado', 401)
    }

    const usuario = await this.usuarioRepository.buscarPorId(token.usuarioId)

    if (!usuario) {
      throw new ErroAplicacao('Usuario nao encontrado', 404)
    }

    token.revogar()
    await this.tokenAtualizacaoRepository.salvar(token)

    return {
      usuario,
      refreshToken: await this.gerarTokenAtualizacaoService.executar(
        usuario.id,
      ),
    }
  }
}

export class LogoutService {
  constructor(
    private readonly tokenAtualizacaoRepository: TokenAtualizacaoRepository,
  ) {}

  async executar(refreshToken: string) {
    const token = await this.tokenAtualizacaoRepository.buscarPorHash(
      gerarHashToken(refreshToken),
    )

    if (!token) {
      return
    }

    token.revogar()
    await this.tokenAtualizacaoRepository.salvar(token)
  }
}

export function gerarHashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
