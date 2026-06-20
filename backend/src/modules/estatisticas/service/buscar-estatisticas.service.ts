import { EstatisticaPomodoro } from '../domain/EstatisticaPomodoro.js'
import type { TipoPeriodoEstatistica } from '../domain/EstatisticaPomodoro.js'
import type { EstatisticasRepository } from '../repository/estatisticas.repository.js'

export class BuscarEstatisticasService {
  constructor(
    private readonly estatisticasRepository: EstatisticasRepository,
  ) {}

  async executar(
    usuarioId: string,
    periodo: TipoPeriodoEstatistica,
    dataBase: Date,
  ) {
    const intervalo = this.calcularIntervalo(periodo, dataBase)
    const resumos = await this.estatisticasRepository.buscarResumosPorPeriodo(
      usuarioId,
      intervalo.inicio,
      intervalo.fim,
    )

    return new EstatisticaPomodoro({
      periodo,
      inicio: intervalo.inicio,
      fim: intervalo.fim,
      resumos,
    })
  }

  private calcularIntervalo(periodo: TipoPeriodoEstatistica, dataBase: Date) {
    const ano = dataBase.getUTCFullYear()
    const mes = dataBase.getUTCMonth()
    const dia = dataBase.getUTCDate()

    if (periodo === 'dia') {
      const data = new Date(Date.UTC(ano, mes, dia))
      return {
        inicio: data,
        fim: data,
      }
    }

    if (periodo === 'semana') {
      const diaSemana = dataBase.getUTCDay()
      const diasDesdeSegunda = (diaSemana + 6) % 7
      const inicio = new Date(Date.UTC(ano, mes, dia - diasDesdeSegunda))
      const fim = new Date(Date.UTC(ano, mes, dia - diasDesdeSegunda + 6))

      return {
        inicio,
        fim,
      }
    }

    if (periodo === 'mes') {
      return {
        inicio: new Date(Date.UTC(ano, mes, 1)),
        fim: new Date(Date.UTC(ano, mes + 1, 0)),
      }
    }

    return {
      inicio: new Date(Date.UTC(ano, 0, 1)),
      fim: new Date(Date.UTC(ano, 11, 31)),
    }
  }
}
