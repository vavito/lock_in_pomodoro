import {
  criarDataResumoDiario,
  resumoDiarioParametrosSchema,
} from '../../resumos-diarios/dto/resumo-diario-parametros.dto.js'

export const concluirSessaoPomodoroSchema = resumoDiarioParametrosSchema

export type ConcluirSessaoPomodoroDTO = {
  data: string
}

export { criarDataResumoDiario }
