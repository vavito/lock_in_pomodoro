import type { ConfiguracaoPomodoro as PrismaConfiguracaoPomodoro } from '@prisma/client'

import { ConfiguracaoPomodoro } from '../domain/ConfiguracaoPomodoro.js'
import type { ConfiguracaoPomodoroRespostaDTO } from '../dto/configuracao-pomodoro-resposta.dto.js'

export class ConfiguracaoPomodoroMapper {
  static paraDominio(configuracao: PrismaConfiguracaoPomodoro) {
    return ConfiguracaoPomodoro.criar({
      id: configuracao.id,
      usuarioId: configuracao.usuarioId,
      tempoPomodoroMinutos: configuracao.tempoPomodoroMinutos,
      tempoDescansoCurtoMinutos: configuracao.tempoDescansoCurtoMinutos,
      tempoDescansoLongoMinutos: configuracao.tempoDescansoLongoMinutos,
      pomodorosParaDescansoLongo: configuracao.pomodorosParaDescansoLongo,
      iniciarDescansoAutomaticamente:
        configuracao.iniciarDescansoAutomaticamente,
      iniciarPomodoroAutomaticamente:
        configuracao.iniciarPomodoroAutomaticamente,
      criadoEm: configuracao.criadoEm,
      atualizadoEm: configuracao.atualizadoEm,
    })
  }

  static paraPersistencia(configuracao: ConfiguracaoPomodoro) {
    return {
      id: configuracao.id,
      usuarioId: configuracao.usuarioId,
      tempoPomodoroMinutos: configuracao.tempoPomodoroMinutos,
      tempoDescansoCurtoMinutos: configuracao.tempoDescansoCurtoMinutos,
      tempoDescansoLongoMinutos: configuracao.tempoDescansoLongoMinutos,
      pomodorosParaDescansoLongo: configuracao.pomodorosParaDescansoLongo,
      iniciarDescansoAutomaticamente:
        configuracao.iniciarDescansoAutomaticamente,
      iniciarPomodoroAutomaticamente:
        configuracao.iniciarPomodoroAutomaticamente,
      criadoEm: configuracao.criadoEm,
      atualizadoEm: configuracao.atualizadoEm,
    }
  }

  static paraResposta(
    configuracao: ConfiguracaoPomodoro,
  ): ConfiguracaoPomodoroRespostaDTO {
    return {
      id: configuracao.id,
      usuarioId: configuracao.usuarioId,
      tempoPomodoroMinutos: configuracao.tempoPomodoroMinutos,
      tempoDescansoCurtoMinutos: configuracao.tempoDescansoCurtoMinutos,
      tempoDescansoLongoMinutos: configuracao.tempoDescansoLongoMinutos,
      pomodorosParaDescansoLongo: configuracao.pomodorosParaDescansoLongo,
      iniciarDescansoAutomaticamente:
        configuracao.iniciarDescansoAutomaticamente,
      iniciarPomodoroAutomaticamente:
        configuracao.iniciarPomodoroAutomaticamente,
      criadoEm: configuracao.criadoEm.toISOString(),
      atualizadoEm: configuracao.atualizadoEm.toISOString(),
    }
  }
}
