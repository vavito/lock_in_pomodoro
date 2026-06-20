import type { ResumoDiario } from '../../resumos-diarios/domain/ResumoDiario.js'

export type TipoPeriodoEstatistica = 'dia' | 'semana' | 'mes' | 'ano'

type EstatisticaPomodoroProps = {
  periodo: TipoPeriodoEstatistica
  inicio: Date
  fim: Date
  resumos: ResumoDiario[]
}

export class EstatisticaPomodoro {
  constructor(private readonly props: EstatisticaPomodoroProps) {}

  get periodo() {
    return this.props.periodo
  }

  get inicio() {
    return this.props.inicio
  }

  get fim() {
    return this.props.fim
  }

  get resumos() {
    return this.props.resumos
  }

  calcularTotais() {
    return this.props.resumos.reduce(
      (totais, resumo) => ({
        pomodorosRealizados:
          totais.pomodorosRealizados + resumo.pomodorosRealizados,
        descansosCurtosRealizados:
          totais.descansosCurtosRealizados + resumo.descansosCurtosRealizados,
        descansosLongosRealizados:
          totais.descansosLongosRealizados + resumo.descansosLongosRealizados,
        tempoEstudandoMinutos:
          totais.tempoEstudandoMinutos + resumo.tempoEstudandoMinutos,
        tempoDescansoMinutos:
          totais.tempoDescansoMinutos + resumo.tempoDescansoMinutos,
      }),
      {
        pomodorosRealizados: 0,
        descansosCurtosRealizados: 0,
        descansosLongosRealizados: 0,
        tempoEstudandoMinutos: 0,
        tempoDescansoMinutos: 0,
      },
    )
  }

  contarDiasUsados() {
    return this.props.resumos.filter(
      (resumo) =>
        resumo.pomodorosRealizados > 0 ||
        resumo.descansosCurtosRealizados > 0 ||
        resumo.descansosLongosRealizados > 0 ||
        resumo.tempoEstudandoMinutos > 0 ||
        resumo.tempoDescansoMinutos > 0,
    ).length
  }
}
