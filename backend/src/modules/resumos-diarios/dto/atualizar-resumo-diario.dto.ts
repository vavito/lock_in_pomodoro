import { z } from 'zod'

export const atualizarResumoDiarioSchema = z
  .object({
    pomodorosRealizados: z.number().int().min(0).max(1000).optional(),
    descansosCurtosRealizados: z.number().int().min(0).max(1000).optional(),
    descansosLongosRealizados: z.number().int().min(0).max(1000).optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: 'Informe ao menos um contador para atualizar',
  })

export type AtualizarResumoDiarioDTO = z.infer<
  typeof atualizarResumoDiarioSchema
>
