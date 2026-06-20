import type { PrismaClient } from '@prisma/client'

import type { TokenAtualizacao } from '../domain/TokenAtualizacao.js'
import { TokenAtualizacaoMapper } from '../mapper/token-atualizacao.mapper.js'
import type { TokenAtualizacaoRepository } from './token-atualizacao.repository.js'

export class PrismaTokenAtualizacaoRepository implements TokenAtualizacaoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorHash(tokenHash: string) {
    const token = await this.prisma.tokenAtualizacao.findUnique({
      where: {
        tokenHash,
      },
    })

    return token ? TokenAtualizacaoMapper.paraDominio(token) : null
  }

  async salvar(token: TokenAtualizacao) {
    const dados = TokenAtualizacaoMapper.paraPersistencia(token)

    const tokenSalvo = await this.prisma.tokenAtualizacao.upsert({
      where: {
        id: dados.id,
      },
      create: {
        id: dados.id,
        usuarioId: dados.usuarioId,
        tokenHash: dados.tokenHash,
        expiraEm: dados.expiraEm,
        revogadoEm: dados.revogadoEm,
      },
      update: {
        revogadoEm: dados.revogadoEm,
      },
    })

    return TokenAtualizacaoMapper.paraDominio(tokenSalvo)
  }
}
