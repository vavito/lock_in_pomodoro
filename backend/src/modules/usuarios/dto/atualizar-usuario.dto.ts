import { z } from 'zod'

export const atualizarUsuarioSchema = z
  .object({
    nome: z.string().trim().max(100).optional(),
    email: z.email().trim().toLowerCase().optional(),
  })
  .refine((dados) => dados.nome !== undefined || dados.email !== undefined, {
    message: 'Informe ao menos um dado para atualizar',
  })

export type AtualizarUsuarioDTO = z.infer<typeof atualizarUsuarioSchema>
