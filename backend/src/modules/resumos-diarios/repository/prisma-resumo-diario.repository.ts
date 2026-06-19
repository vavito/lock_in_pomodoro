import type { PrismaClient } from '@prisma/client'

import type { ResumoDiario } from '../domain/ResumoDiario.js'
import { ResumoDiarioMapper } from '../mapper/resumo-diario.mapper.js'
import type { ResumoDiarioRepository } from './resumo-diario.repository.js'

export class PrismaResumoDiarioRepository implements ResumoDiarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorUsuarioIdEData(usuarioId: string, data: Date) {
    const resumo = await this.prisma.resumoDiario.findUnique({
      where: {
        usuarioId_data: {
          usuarioId,
          data,
        },
      },
    })

    return resumo ? ResumoDiarioMapper.paraDominio(resumo) : null
  }

  async salvar(resumo: ResumoDiario) {
    const dados = ResumoDiarioMapper.paraPersistencia(resumo)

    const resumoSalvo = await this.prisma.resumoDiario.upsert({
      where: {
        usuarioId_data: {
          usuarioId: dados.usuarioId,
          data: dados.data,
        },
      },
      create: {
        id: dados.id,
        usuarioId: dados.usuarioId,
        data: dados.data,
        pomodorosRealizados: dados.pomodorosRealizados,
        descansosCurtosRealizados: dados.descansosCurtosRealizados,
        descansosLongosRealizados: dados.descansosLongosRealizados,
        tempoEstudandoMinutos: dados.tempoEstudandoMinutos,
        tempoDescansoMinutos: dados.tempoDescansoMinutos,
      },
      update: {
        pomodorosRealizados: dados.pomodorosRealizados,
        descansosCurtosRealizados: dados.descansosCurtosRealizados,
        descansosLongosRealizados: dados.descansosLongosRealizados,
        tempoEstudandoMinutos: dados.tempoEstudandoMinutos,
        tempoDescansoMinutos: dados.tempoDescansoMinutos,
      },
    })

    return ResumoDiarioMapper.paraDominio(resumoSalvo)
  }
}
