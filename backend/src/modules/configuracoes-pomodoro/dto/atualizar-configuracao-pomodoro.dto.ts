import { z } from 'zod'

export const atualizarConfiguracaoPomodoroSchema = z
  .object({
    tempoPomodoroMinutos: z.number().int().min(1).max(59).optional(),
    tempoDescansoCurtoMinutos: z.number().int().min(1).max(59).optional(),
    tempoDescansoLongoMinutos: z.number().int().min(1).max(59).optional(),
    pomodorosParaDescansoLongo: z.number().int().min(1).max(99).optional(),
    iniciarDescansoAutomaticamente: z.boolean().optional(),
    iniciarPomodoroAutomaticamente: z.boolean().optional(),
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  })

export type AtualizarConfiguracaoPomodoroDTO = z.infer<
  typeof atualizarConfiguracaoPomodoroSchema
>
