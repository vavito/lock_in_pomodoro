type UsuarioProps = {
  id?: string
  nome?: string | null
  email: string
  senhaHash: string
  criadoEm?: Date
  atualizadoEm?: Date
}

export class Usuario {
  private constructor(private props: Required<UsuarioProps>) {
    this.validar()
  }

  static criar(props: UsuarioProps) {
    return new Usuario({
      id: props.id ?? crypto.randomUUID(),
      nome: props.nome ?? null,
      email: props.email.trim().toLowerCase(),
      senhaHash: props.senhaHash,
      criadoEm: props.criadoEm ?? new Date(),
      atualizadoEm: props.atualizadoEm ?? new Date(),
    })
  }

  get id() {
    return this.props.id
  }

  get nome() {
    return this.props.nome
  }

  get email() {
    return this.props.email
  }

  get senhaHash() {
    return this.props.senhaHash
  }

  get criadoEm() {
    return this.props.criadoEm
  }

  get atualizadoEm() {
    return this.props.atualizadoEm
  }

  atualizarNome(nome: string | null) {
    this.props.nome = nome?.trim() || null
    this.props.atualizadoEm = new Date()
  }

  possuiEmail(email: string) {
    return this.props.email === email.trim().toLowerCase()
  }

  private validar() {
    if (!this.props.email.includes('@')) {
      throw new Error('Email invalido')
    }

    if (!this.props.senhaHash) {
      throw new Error('Senha invalida')
    }
  }
}
