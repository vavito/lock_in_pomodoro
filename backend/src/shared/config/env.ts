import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),
  ORIGEM_FRONTEND: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
})

const envValidada = envSchema.safeParse(process.env)

if (!envValidada.success) {
  throw new Error(
    `Variaveis de ambiente invalidas: ${envValidada.error.message}`,
  )
}

export const env = envValidada.data
