import type { FastifyInstance } from 'fastify'

import { SaudeController } from '../controller/saude.controller.js'

export async function saudeRoutes(app: FastifyInstance) {
  const saudeController = new SaudeController()

  app.get('/health', saudeController.verificar.bind(saudeController))
}
