import { z } from 'zod'

export const cadastrarUsuarioSchema = z.object({
  nome: z.string().trim().min(1).max(100).optional(),
  email: z.email().trim().toLowerCase(),
  senha: z.string().min(8).max(100),
})

export type CadastrarUsuarioDTO = z.infer<typeof cadastrarUsuarioSchema>
