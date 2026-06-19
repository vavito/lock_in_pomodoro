import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'

export type TipoSessaoPomodoro =
  | 'POMODORO'
  | 'DESCANSO_CURTO'
  | 'DESCANSO_LONGO'

export type StatusSessaoPomodoro =
  | 'CRIADA'
  | 'EM_ANDAMENTO'
  | 'PAUSADA'
  | 'CONCLUIDA'
  | 'CANCELADA'

type SessaoPomodoroProps = {
  id?: string
  usuarioId: string
  tipo: TipoSessaoPomodoro
  status?: StatusSessaoPomodoro
  duracaoMinutos: number
  iniciadoEm?: Date | null
  finalizadoEm?: Date | null
  criadoEm?: Date
  atualizadoEm?: Date
}

export class SessaoPomodoro {
  private constructor(private props: Required<SessaoPomodoroProps>) {
    this.validar()
  }

  static criar(props: SessaoPomodoroProps) {
    return new SessaoPomodoro({
      id: props.id ?? crypto.randomUUID(),
      usuarioId: props.usuarioId,
      tipo: props.tipo,
      status: props.status ?? 'CRIADA',
      duracaoMinutos: props.duracaoMinutos,
      iniciadoEm: props.iniciadoEm ?? null,
      finalizadoEm: props.finalizadoEm ?? null,
      criadoEm: props.criadoEm ?? new Date(),
      atualizadoEm: props.atualizadoEm ?? new Date(),
    })
  }

  static iniciarNova(
    usuarioId: string,
    tipo: TipoSessaoPomodoro,
    duracaoMinutos: number,
  ) {
    const sessao = SessaoPomodoro.criar({
      usuarioId,
      tipo,
      duracaoMinutos,
    })

    sessao.iniciar()

    return sessao
  }

  get id() {
    return this.props.id
  }

  get usuarioId() {
    return this.props.usuarioId
  }

  get tipo() {
    return this.props.tipo
  }

  get status() {
    return this.props.status
  }

  get duracaoMinutos() {
    return this.props.duracaoMinutos
  }

  get iniciadoEm() {
    return this.props.iniciadoEm
  }

  get finalizadoEm() {
    return this.props.finalizadoEm
  }

  get criadoEm() {
    return this.props.criadoEm
  }

  get atualizadoEm() {
    return this.props.atualizadoEm
  }

  iniciar() {
    if (this.props.status !== 'CRIADA') {
      throw new ErroAplicacao('Apenas sessoes criadas podem ser iniciadas')
    }

    this.props.status = 'EM_ANDAMENTO'
    this.props.iniciadoEm = new Date()
    this.props.atualizadoEm = new Date()
  }

  concluir() {
    if (this.props.status !== 'EM_ANDAMENTO') {
      throw new ErroAplicacao(
        'Apenas sessoes em andamento podem ser concluidas',
      )
    }

    this.props.status = 'CONCLUIDA'
    this.props.finalizadoEm = new Date()
    this.props.atualizadoEm = new Date()
  }

  cancelar() {
    if (this.props.status === 'CONCLUIDA') {
      throw new ErroAplicacao('Sessoes concluidas nao podem ser canceladas')
    }

    if (this.props.status === 'CANCELADA') {
      throw new ErroAplicacao('Sessao ja cancelada')
    }

    this.props.status = 'CANCELADA'
    this.props.finalizadoEm = new Date()
    this.props.atualizadoEm = new Date()
  }

  private validar() {
    if (this.props.duracaoMinutos < 1 || this.props.duracaoMinutos > 59) {
      throw new ErroAplicacao('Duracao da sessao deve estar entre 1 e 59')
    }
  }
}
