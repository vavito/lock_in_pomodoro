import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'

type ConfiguracaoPomodoroProps = {
  id?: string
  usuarioId: string
  tempoPomodoroMinutos?: number
  tempoDescansoCurtoMinutos?: number
  tempoDescansoLongoMinutos?: number
  pomodorosParaDescansoLongo?: number
  iniciarDescansoAutomaticamente?: boolean
  iniciarPomodoroAutomaticamente?: boolean
  criadoEm?: Date
  atualizadoEm?: Date
}

type AtualizarConfiguracaoPomodoroProps = {
  tempoPomodoroMinutos?: number | undefined
  tempoDescansoCurtoMinutos?: number | undefined
  tempoDescansoLongoMinutos?: number | undefined
  pomodorosParaDescansoLongo?: number | undefined
  iniciarDescansoAutomaticamente?: boolean | undefined
  iniciarPomodoroAutomaticamente?: boolean | undefined
}

export class ConfiguracaoPomodoro {
  private constructor(private props: Required<ConfiguracaoPomodoroProps>) {
    this.validar()
  }

  static criar(props: ConfiguracaoPomodoroProps) {
    return new ConfiguracaoPomodoro({
      id: props.id ?? crypto.randomUUID(),
      usuarioId: props.usuarioId,
      tempoPomodoroMinutos: props.tempoPomodoroMinutos ?? 25,
      tempoDescansoCurtoMinutos: props.tempoDescansoCurtoMinutos ?? 5,
      tempoDescansoLongoMinutos: props.tempoDescansoLongoMinutos ?? 15,
      pomodorosParaDescansoLongo: props.pomodorosParaDescansoLongo ?? 4,
      iniciarDescansoAutomaticamente:
        props.iniciarDescansoAutomaticamente ?? false,
      iniciarPomodoroAutomaticamente:
        props.iniciarPomodoroAutomaticamente ?? false,
      criadoEm: props.criadoEm ?? new Date(),
      atualizadoEm: props.atualizadoEm ?? new Date(),
    })
  }

  get id() {
    return this.props.id
  }

  get usuarioId() {
    return this.props.usuarioId
  }

  get tempoPomodoroMinutos() {
    return this.props.tempoPomodoroMinutos
  }

  get tempoDescansoCurtoMinutos() {
    return this.props.tempoDescansoCurtoMinutos
  }

  get tempoDescansoLongoMinutos() {
    return this.props.tempoDescansoLongoMinutos
  }

  get pomodorosParaDescansoLongo() {
    return this.props.pomodorosParaDescansoLongo
  }

  get iniciarDescansoAutomaticamente() {
    return this.props.iniciarDescansoAutomaticamente
  }

  get iniciarPomodoroAutomaticamente() {
    return this.props.iniciarPomodoroAutomaticamente
  }

  get criadoEm() {
    return this.props.criadoEm
  }

  get atualizadoEm() {
    return this.props.atualizadoEm
  }

  atualizar(props: AtualizarConfiguracaoPomodoroProps) {
    if (props.tempoPomodoroMinutos !== undefined) {
      this.props.tempoPomodoroMinutos = props.tempoPomodoroMinutos
    }

    if (props.tempoDescansoCurtoMinutos !== undefined) {
      this.props.tempoDescansoCurtoMinutos = props.tempoDescansoCurtoMinutos
    }

    if (props.tempoDescansoLongoMinutos !== undefined) {
      this.props.tempoDescansoLongoMinutos = props.tempoDescansoLongoMinutos
    }

    if (props.pomodorosParaDescansoLongo !== undefined) {
      this.props.pomodorosParaDescansoLongo = props.pomodorosParaDescansoLongo
    }

    if (props.iniciarDescansoAutomaticamente !== undefined) {
      this.props.iniciarDescansoAutomaticamente =
        props.iniciarDescansoAutomaticamente
    }

    if (props.iniciarPomodoroAutomaticamente !== undefined) {
      this.props.iniciarPomodoroAutomaticamente =
        props.iniciarPomodoroAutomaticamente
    }

    this.props.atualizadoEm = new Date()

    this.validar()
  }

  private validar() {
    this.validarMinutos(this.props.tempoPomodoroMinutos, 'tempo do pomodoro')
    this.validarMinutos(
      this.props.tempoDescansoCurtoMinutos,
      'tempo do descanso curto',
    )
    this.validarMinutos(
      this.props.tempoDescansoLongoMinutos,
      'tempo do descanso longo',
    )

    if (
      this.props.pomodorosParaDescansoLongo < 1 ||
      this.props.pomodorosParaDescansoLongo > 99
    ) {
      throw new ErroAplicacao(
        'Pomodoros para descanso longo deve estar entre 1 e 99',
      )
    }
  }

  private validarMinutos(valor: number, campo: string) {
    if (valor < 1 || valor > 59) {
      throw new ErroAplicacao(`${campo} deve estar entre 1 e 59 minutos`)
    }
  }
}
