import type { SessaoPomodoro as PrismaSessaoPomodoro } from '@prisma/client'

import { SessaoPomodoro } from '../domain/SessaoPomodoro.js'
import type { SessaoPomodoroRespostaDTO } from '../dto/sessao-pomodoro-resposta.dto.js'

export class SessaoPomodoroMapper {
  static paraDominio(sessao: PrismaSessaoPomodoro) {
    return SessaoPomodoro.criar({
      id: sessao.id,
      usuarioId: sessao.usuarioId,
      tipo: sessao.tipo,
      status: sessao.status,
      duracaoMinutos: sessao.duracaoMinutos,
      iniciadoEm: sessao.iniciadoEm,
      finalizadoEm: sessao.finalizadoEm,
      criadoEm: sessao.criadoEm,
      atualizadoEm: sessao.atualizadoEm,
    })
  }

  static paraPersistencia(sessao: SessaoPomodoro) {
    return {
      id: sessao.id,
      usuarioId: sessao.usuarioId,
      tipo: sessao.tipo,
      status: sessao.status,
      duracaoMinutos: sessao.duracaoMinutos,
      iniciadoEm: sessao.iniciadoEm,
      finalizadoEm: sessao.finalizadoEm,
      criadoEm: sessao.criadoEm,
      atualizadoEm: sessao.atualizadoEm,
    }
  }

  static paraResposta(sessao: SessaoPomodoro): SessaoPomodoroRespostaDTO {
    return {
      id: sessao.id,
      usuarioId: sessao.usuarioId,
      tipo: sessao.tipo,
      status: sessao.status,
      duracaoMinutos: sessao.duracaoMinutos,
      iniciadoEm: sessao.iniciadoEm?.toISOString() ?? null,
      finalizadoEm: sessao.finalizadoEm?.toISOString() ?? null,
      criadoEm: sessao.criadoEm.toISOString(),
      atualizadoEm: sessao.atualizadoEm.toISOString(),
    }
  }
}
