import { z } from 'zod'

export const sessaoPomodoroParametrosSchema = z.object({
  id: z.uuid(),
})

export type SessaoPomodoroParametrosDTO = z.infer<
  typeof sessaoPomodoroParametrosSchema
>
