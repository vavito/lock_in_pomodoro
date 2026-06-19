import type { FastifyReply, FastifyRequest } from 'fastify'

import { atualizarConfiguracaoPomodoroSchema } from '../dto/atualizar-configuracao-pomodoro.dto.js'
import { ConfiguracaoPomodoroMapper } from '../mapper/configuracao-pomodoro.mapper.js'
import type { AtualizarConfiguracaoPomodoroService } from '../service/atualizar-configuracao-pomodoro.service.js'
import type { BuscarConfiguracaoPomodoroService } from '../service/buscar-configuracao-pomodoro.service.js'

export class ConfiguracaoPomodoroController {
  constructor(
    private readonly buscarConfiguracaoPomodoroService: BuscarConfiguracaoPomodoroService,
    private readonly atualizarConfiguracaoPomodoroService: AtualizarConfiguracaoPomodoroService,
  ) {}

  async buscar(request: FastifyRequest, reply: FastifyReply) {
    const configuracao = await this.buscarConfiguracaoPomodoroService.executar(
      request.user.sub,
    )

    return reply.status(200).send({
      configuracao: ConfiguracaoPomodoroMapper.paraResposta(configuracao),
    })
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    const dto = atualizarConfiguracaoPomodoroSchema.parse(request.body)
    const configuracao =
      await this.atualizarConfiguracaoPomodoroService.executar(
        request.user.sub,
        dto,
      )

    return reply.status(200).send({
      configuracao: ConfiguracaoPomodoroMapper.paraResposta(configuracao),
    })
  }
}
