import { ErroAplicacao } from '../../../shared/errors/erro-aplicacao.js'
import type { ConfiguracaoPomodoro } from '../../configuracoes-pomodoro/domain/ConfiguracaoPomodoro.js'
import type { TipoSessaoPomodoro } from '../../sessoes-pomodoro/domain/SessaoPomodoro.js'

type ResumoDiarioProps = {
  id?: string
  usuarioId: string
  data: Date
  pomodorosRealizados?: number
  descansosCurtosRealizados?: number
  descansosLongosRealizados?: number
  tempoEstudandoMinutos?: number
  tempoDescansoMinutos?: number
  criadoEm?: Date
  atualizadoEm?: Date
}

type AtualizarResumoDiarioProps = {
  pomodorosRealizados?: number | undefined
  descansosCurtosRealizados?: number | undefined
  descansosLongosRealizados?: number | undefined
}

export class ResumoDiario {
  private constructor(private props: Required<ResumoDiarioProps>) {
    this.validar()
  }

  static criar(props: ResumoDiarioProps) {
    return new ResumoDiario({
      id: props.id ?? crypto.randomUUID(),
      usuarioId: props.usuarioId,
      data: props.data,
      pomodorosRealizados: props.pomodorosRealizados ?? 0,
      descansosCurtosRealizados: props.descansosCurtosRealizados ?? 0,
      descansosLongosRealizados: props.descansosLongosRealizados ?? 0,
      tempoEstudandoMinutos: props.tempoEstudandoMinutos ?? 0,
      tempoDescansoMinutos: props.tempoDescansoMinutos ?? 0,
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

  get data() {
    return this.props.data
  }

  get pomodorosRealizados() {
    return this.props.pomodorosRealizados
  }

  get descansosCurtosRealizados() {
    return this.props.descansosCurtosRealizados
  }

  get descansosLongosRealizados() {
    return this.props.descansosLongosRealizados
  }

  get tempoEstudandoMinutos() {
    return this.props.tempoEstudandoMinutos
  }

  get tempoDescansoMinutos() {
    return this.props.tempoDescansoMinutos
  }

  get criadoEm() {
    return this.props.criadoEm
  }

  get atualizadoEm() {
    return this.props.atualizadoEm
  }

  atualizarContadores(
    props: AtualizarResumoDiarioProps,
    configuracao: ConfiguracaoPomodoro,
  ) {
    if (props.pomodorosRealizados !== undefined) {
      this.props.pomodorosRealizados = props.pomodorosRealizados
    }

    if (props.descansosCurtosRealizados !== undefined) {
      this.props.descansosCurtosRealizados = props.descansosCurtosRealizados
    }

    if (props.descansosLongosRealizados !== undefined) {
      this.props.descansosLongosRealizados = props.descansosLongosRealizados
    }

    this.recalcularTempos(configuracao)
    this.props.atualizadoEm = new Date()
    this.validar()
  }

  recalcularTempos(configuracao: ConfiguracaoPomodoro) {
    this.props.tempoEstudandoMinutos =
      this.props.pomodorosRealizados * configuracao.tempoPomodoroMinutos

    this.props.tempoDescansoMinutos =
      this.props.descansosCurtosRealizados *
        configuracao.tempoDescansoCurtoMinutos +
      this.props.descansosLongosRealizados *
        configuracao.tempoDescansoLongoMinutos
  }

  registrarTempoParcial(tipo: TipoSessaoPomodoro, minutosRealizados: number) {
    if (
      !Number.isInteger(minutosRealizados) ||
      minutosRealizados < 0 ||
      minutosRealizados > 59
    ) {
      throw new ErroAplicacao('Tempo parcial deve estar entre 0 e 59 minutos')
    }

    if (tipo === 'POMODORO') {
      this.props.tempoEstudandoMinutos += minutosRealizados
    } else {
      this.props.tempoDescansoMinutos += minutosRealizados
    }

    this.props.atualizadoEm = new Date()
  }

  private validar() {
    this.validarContador(this.props.pomodorosRealizados, 'Pomodoros realizados')
    this.validarContador(
      this.props.descansosCurtosRealizados,
      'Descansos curtos realizados',
    )
    this.validarContador(
      this.props.descansosLongosRealizados,
      'Descansos longos realizados',
    )
  }

  private validarContador(valor: number, campo: string) {
    if (!Number.isInteger(valor) || valor < 0 || valor > 1000) {
      throw new ErroAplicacao(`${campo} deve estar entre 0 e 1000`)
    }
  }
}
