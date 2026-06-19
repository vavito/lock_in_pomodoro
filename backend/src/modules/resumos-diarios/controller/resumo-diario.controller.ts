import type { FastifyReply, FastifyRequest } from 'fastify'

import { atualizarResumoDiarioSchema } from '../dto/atualizar-resumo-diario.dto.js'
import {
  criarDataResumoDiario,
  resumoDiarioParametrosSchema,
} from '../dto/resumo-diario-parametros.dto.js'
import { ResumoDiarioMapper } from '../mapper/resumo-diario.mapper.js'
import type { AtualizarResumoDiarioService } from '../service/atualizar-resumo-diario.service.js'
import type { BuscarResumoDiarioService } from '../service/buscar-resumo-diario.service.js'

export class ResumoDiarioController {
  constructor(
    private readonly buscarResumoDiarioService: BuscarResumoDiarioService,
    private readonly atualizarResumoDiarioService: AtualizarResumoDiarioService,
  ) {}

  async buscar(request: FastifyRequest, reply: FastifyReply) {
    const parametros = resumoDiarioParametrosSchema.parse(request.params)
    const data = criarDataResumoDiario(parametros.data)
    const resumo = await this.buscarResumoDiarioService.executar(
      request.user.sub,
      data,
    )

    return reply.status(200).send({
      resumo: ResumoDiarioMapper.paraResposta(resumo),
    })
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    const parametros = resumoDiarioParametrosSchema.parse(request.params)
    const dto = atualizarResumoDiarioSchema.parse(request.body)
    const data = criarDataResumoDiario(parametros.data)
    const resumo = await this.atualizarResumoDiarioService.executar(
      request.user.sub,
      data,
      dto,
    )

    return reply.status(200).send({
      resumo: ResumoDiarioMapper.paraResposta(resumo),
    })
  }
}
