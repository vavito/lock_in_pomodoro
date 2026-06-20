import type { TokenAtualizacao as PrismaTokenAtualizacao } from '@prisma/client'

import { TokenAtualizacao } from '../domain/TokenAtualizacao.js'

export class TokenAtualizacaoMapper {
  static paraDominio(token: PrismaTokenAtualizacao) {
    return TokenAtualizacao.criar({
      id: token.id,
      usuarioId: token.usuarioId,
      tokenHash: token.tokenHash,
      expiraEm: token.expiraEm,
      revogadoEm: token.revogadoEm,
      criadoEm: token.criadoEm,
    })
  }

  static paraPersistencia(token: TokenAtualizacao) {
    return {
      id: token.id,
      usuarioId: token.usuarioId,
      tokenHash: token.tokenHash,
      expiraEm: token.expiraEm,
      revogadoEm: token.revogadoEm,
      criadoEm: token.criadoEm,
    }
  }
}
