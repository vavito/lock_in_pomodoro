import { z } from 'zod'

export const criarSessaoPomodoroSchema = z.object({
  tipo: z.enum(['POMODORO', 'DESCANSO_CURTO', 'DESCANSO_LONGO']),
})

export type CriarSessaoPomodoroDTO = z.infer<typeof criarSessaoPomodoroSchema>
