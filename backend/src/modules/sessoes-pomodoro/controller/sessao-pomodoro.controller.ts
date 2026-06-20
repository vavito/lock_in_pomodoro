import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  concluirSessaoPomodoroSchema,
  criarDataResumoDiario,
} from '../dto/concluir-sessao-pomodoro.dto.js'
import { criarSessaoPomodoroSchema } from '../dto/criar-sessao-pomodoro.dto.js'
import {
  criarDataResumoDiario as criarDataPararSessao,
  pararSessaoPomodoroSchema,
} from '../dto/parar-sessao-pomodoro.dto.js'
import { sessaoPomodoroParametrosSchema } from '../dto/sessao-pomodoro-parametros.dto.js'
import { SessaoPomodoroMapper } from '../mapper/sessao-pomodoro.mapper.js'
import type { CancelarSessaoPomodoroService } from '../service/cancelar-sessao-pomodoro.service.js'
import type { ConcluirSessaoPomodoroService } from '../service/concluir-sessao-pomodoro.service.js'
import type { CriarSessaoPomodoroService } from '../service/criar-sessao-pomodoro.service.js'
import type { PararSessaoPomodoroService } from '../service/parar-sessao-pomodoro.service.js'

export class SessaoPomodoroController {
  constructor(
    private readonly criarSessaoPomodoroService: CriarSessaoPomodoroService,
    private readonly concluirSessaoPomodoroService: ConcluirSessaoPomodoroService,
    private readonly cancelarSessaoPomodoroService: CancelarSessaoPomodoroService,
    private readonly pararSessaoPomodoroService: PararSessaoPomodoroService,
  ) {}

  async criar(request: FastifyRequest, reply: FastifyReply) {
    const dto = criarSessaoPomodoroSchema.parse(request.body)
    const sessao = await this.criarSessaoPomodoroService.executar(
      request.user.sub,
      dto,
    )

    return reply.status(201).send({
      sessao: SessaoPomodoroMapper.paraResposta(sessao),
    })
  }

  async concluir(request: FastifyRequest, reply: FastifyReply) {
    const parametros = sessaoPomodoroParametrosSchema.parse(request.params)
    const dto = concluirSessaoPomodoroSchema.parse(request.body)
    const sessao = await this.concluirSessaoPomodoroService.executar(
      request.user.sub,
      parametros.id,
      criarDataResumoDiario(dto.data),
    )

    return reply.status(200).send({
      sessao: SessaoPomodoroMapper.paraResposta(sessao),
    })
  }

  async cancelar(request: FastifyRequest, reply: FastifyReply) {
    const parametros = sessaoPomodoroParametrosSchema.parse(request.params)
    const sessao = await this.cancelarSessaoPomodoroService.executar(
      request.user.sub,
      parametros.id,
    )

    return reply.status(200).send({
      sessao: SessaoPomodoroMapper.paraResposta(sessao),
    })
  }

  async parar(request: FastifyRequest, reply: FastifyReply) {
    const parametros = sessaoPomodoroParametrosSchema.parse(request.params)
    const dto = pararSessaoPomodoroSchema.parse(request.body)
    const sessao = await this.pararSessaoPomodoroService.executar(
      request.user.sub,
      parametros.id,
      criarDataPararSessao(dto.data),
      dto.minutosRealizados,
    )

    return reply.status(200).send({
      sessao: SessaoPomodoroMapper.paraResposta(sessao),
    })
  }
}
