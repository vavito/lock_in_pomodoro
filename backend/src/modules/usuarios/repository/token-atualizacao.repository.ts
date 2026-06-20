import type { TokenAtualizacao } from '../domain/TokenAtualizacao.js'

export interface TokenAtualizacaoRepository {
  buscarPorHash(tokenHash: string): Promise<TokenAtualizacao | null>
  salvar(token: TokenAtualizacao): Promise<TokenAtualizacao>
}
