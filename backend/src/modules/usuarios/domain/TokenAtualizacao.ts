type TokenAtualizacaoProps = {
  id?: string
  usuarioId: string
  tokenHash: string
  expiraEm: Date
  revogadoEm?: Date | null
  criadoEm?: Date
}

export class TokenAtualizacao {
  private constructor(private props: Required<TokenAtualizacaoProps>) {}

  static criar(props: TokenAtualizacaoProps) {
    return new TokenAtualizacao({
      id: props.id ?? crypto.randomUUID(),
      usuarioId: props.usuarioId,
      tokenHash: props.tokenHash,
      expiraEm: props.expiraEm,
      revogadoEm: props.revogadoEm ?? null,
      criadoEm: props.criadoEm ?? new Date(),
    })
  }

  get id() {
    return this.props.id
  }

  get usuarioId() {
    return this.props.usuarioId
  }

  get tokenHash() {
    return this.props.tokenHash
  }

  get expiraEm() {
    return this.props.expiraEm
  }

  get revogadoEm() {
    return this.props.revogadoEm
  }

  get criadoEm() {
    return this.props.criadoEm
  }

  estaAtivo(agora = new Date()) {
    return !this.props.revogadoEm && this.props.expiraEm > agora
  }

  revogar() {
    if (!this.props.revogadoEm) {
      this.props.revogadoEm = new Date()
    }
  }
}
