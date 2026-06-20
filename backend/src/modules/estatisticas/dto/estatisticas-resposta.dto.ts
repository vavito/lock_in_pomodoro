import type { TipoPeriodoEstatistica } from '../domain/EstatisticaPomodoro.js'

type ResumoEstatisticaDiaDTO = {
  data: string
  pomodorosRealizados: number
  descansosCurtosRealizados: number
  descansosLongosRealizados: number
  tempoEstudandoMinutos: number
  tempoDescansoMinutos: number
}

type TotaisEstatisticaDTO = {
  pomodorosRealizados: number
  descansosCurtosRealizados: number
  descansosLongosRealizados: number
  tempoEstudandoMinutos: number
  tempoDescansoMinutos: number
  diasUsados: number
}

export type EstatisticasRespostaDTO = {
  periodo: {
    tipo: TipoPeriodoEstatistica
    inicio: string
    fim: string
  }
  totais: TotaisEstatisticaDTO
  dias: ResumoEstatisticaDiaDTO[]
}
