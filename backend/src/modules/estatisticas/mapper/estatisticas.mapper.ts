import { EstatisticaPomodoro } from '../domain/EstatisticaPomodoro.js'
import type { EstatisticasRespostaDTO } from '../dto/estatisticas-resposta.dto.js'

export class EstatisticasMapper {
  static paraResposta(
    estatistica: EstatisticaPomodoro,
  ): EstatisticasRespostaDTO {
    return {
      periodo: {
        tipo: estatistica.periodo,
        inicio: this.formatarData(estatistica.inicio),
        fim: this.formatarData(estatistica.fim),
      },
      totais: {
        ...estatistica.calcularTotais(),
        diasUsados: estatistica.contarDiasUsados(),
      },
      dias: estatistica.resumos.map((resumo) => ({
        data: this.formatarData(resumo.data),
        pomodorosRealizados: resumo.pomodorosRealizados,
        descansosCurtosRealizados: resumo.descansosCurtosRealizados,
        descansosLongosRealizados: resumo.descansosLongosRealizados,
        tempoEstudandoMinutos: resumo.tempoEstudandoMinutos,
        tempoDescansoMinutos: resumo.tempoDescansoMinutos,
      })),
    }
  }

  private static formatarData(data: Date) {
    return data.toISOString().slice(0, 10)
  }
}
