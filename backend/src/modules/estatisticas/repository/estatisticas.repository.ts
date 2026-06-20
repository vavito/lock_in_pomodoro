import type { ResumoDiario } from '../../resumos-diarios/domain/ResumoDiario.js'

export interface EstatisticasRepository {
  buscarResumosPorPeriodo(
    usuarioId: string,
    inicio: Date,
    fim: Date,
  ): Promise<ResumoDiario[]>
}
