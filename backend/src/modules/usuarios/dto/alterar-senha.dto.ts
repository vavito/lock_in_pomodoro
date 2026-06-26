import { z } from 'zod'

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1).max(100),
  novaSenha: z.string().min(8).max(100),
})

export type AlterarSenhaDTO = z.infer<typeof alterarSenhaSchema>
