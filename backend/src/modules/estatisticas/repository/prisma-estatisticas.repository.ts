import type { PrismaClient } from '@prisma/client'

import { ResumoDiarioMapper } from '../../resumos-diarios/mapper/resumo-diario.mapper.js'
import type { EstatisticasRepository } from './estatisticas.repository.js'

export class PrismaEstatisticasRepository implements EstatisticasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarResumosPorPeriodo(usuarioId: string, inicio: Date, fim: Date) {
    const resumos = await this.prisma.resumoDiario.findMany({
      where: {
        usuarioId,
        data: {
          gte: inicio,
          lte: fim,
        },
      },
      orderBy: {
        data: 'asc',
      },
    })

    return resumos.map(ResumoDiarioMapper.paraDominio)
  }
}
