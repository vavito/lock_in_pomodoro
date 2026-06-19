import { construirApp } from './app.js'
import { env } from './shared/config/env.js'

const app = construirApp()

async function iniciarServidor() {
  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    })
  } catch (erro) {
    app.log.error(erro)
    process.exit(1)
  }
}

void iniciarServidor()
