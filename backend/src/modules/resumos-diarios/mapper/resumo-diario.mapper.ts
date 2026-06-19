import type { ResumoDiario as PrismaResumoDiario } from '@prisma/client'

import { ResumoDiario } from '../domain/ResumoDiario.js'
import type { ResumoDiarioRespostaDTO } from '../dto/resumo-diario-resposta.dto.js'

export class ResumoDiarioMapper {
  static paraDominio(resumo: PrismaResumoDiario) {
    return ResumoDiario.criar({
      id: resumo.id,
      usuarioId: resumo.usuarioId,
      data: resumo.data,
      pomodorosRealizados: resumo.pomodorosRealizados,
      descansosCurtosRealizados: resumo.descansosCurtosRealizados,
      descansosLongosRealizados: resumo.descansosLongosRealizados,
      tempoEstudandoMinutos: resumo.tempoEstudandoMinutos,
      tempoDescansoMinutos: resumo.tempoDescansoMinutos,
      criadoEm: resumo.criadoEm,
      atualizadoEm: resumo.atualizadoEm,
    })
  }

  static paraPersistencia(resumo: ResumoDiario) {
    return {
      id: resumo.id,
      usuarioId: resumo.usuarioId,
      data: resumo.data,
      pomodorosRealizados: resumo.pomodorosRealizados,
      descansosCurtosRealizados: resumo.descansosCurtosRealizados,
      descansosLongosRealizados: resumo.descansosLongosRealizados,
      tempoEstudandoMinutos: resumo.tempoEstudandoMinutos,
      tempoDescansoMinutos: resumo.tempoDescansoMinutos,
      criadoEm: resumo.criadoEm,
      atualizadoEm: resumo.atualizadoEm,
    }
  }

  static paraResposta(resumo: ResumoDiario): ResumoDiarioRespostaDTO {
    return {
      id: resumo.id,
      usuarioId: resumo.usuarioId,
      data: resumo.data.toISOString().slice(0, 10),
      pomodorosRealizados: resumo.pomodorosRealizados,
      descansosCurtosRealizados: resumo.descansosCurtosRealizados,
      descansosLongosRealizados: resumo.descansosLongosRealizados,
      tempoEstudandoMinutos: resumo.tempoEstudandoMinutos,
      tempoDescansoMinutos: resumo.tempoDescansoMinutos,
      criadoEm: resumo.criadoEm.toISOString(),
      atualizadoEm: resumo.atualizadoEm.toISOString(),
    }
  }
}
