import { z } from 'zod'

import {
  criarDataResumoDiario,
  resumoDiarioParametrosSchema,
} from '../../resumos-diarios/dto/resumo-diario-parametros.dto.js'

export const pararSessaoPomodoroSchema = resumoDiarioParametrosSchema.extend({
  minutosRealizados: z.number().int().min(0).max(59),
})

export type PararSessaoPomodoroDTO = z.infer<typeof pararSessaoPomodoroSchema>

export { criarDataResumoDiario }
