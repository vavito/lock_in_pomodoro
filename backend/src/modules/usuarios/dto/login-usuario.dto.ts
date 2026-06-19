import { z } from 'zod'

export const loginUsuarioSchema = z.object({
  email: z.email().trim().toLowerCase(),
  senha: z.string().min(1).max(100),
})

export type LoginUsuarioDTO = z.infer<typeof loginUsuarioSchema>
