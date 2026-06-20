import { z } from 'zod'

function dataValida(data: string) {
  const dataCriada = new Date(`${data}T00:00:00.000Z`)

  return (
    !Number.isNaN(dataCriada.getTime()) &&
    dataCriada.toISOString().slice(0, 10) === data
  )
}

export const buscarEstatisticasSchema = z.object({
  periodo: z.enum(['dia', 'semana', 'mes', 'ano']),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(dataValida, 'Data invalida'),
})

export type BuscarEstatisticasDTO = z.infer<typeof buscarEstatisticasSchema>

export function criarDataEstatistica(data: string) {
  return new Date(`${data}T00:00:00.000Z`)
}
