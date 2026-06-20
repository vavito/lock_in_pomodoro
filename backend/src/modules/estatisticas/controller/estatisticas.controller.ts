import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  buscarEstatisticasSchema,
  criarDataEstatistica,
} from '../dto/buscar-estatisticas.dto.js'
import { EstatisticasMapper } from '../mapper/estatisticas.mapper.js'
import type { BuscarEstatisticasService } from '../service/buscar-estatisticas.service.js'

export class EstatisticasController {
  constructor(
    private readonly buscarEstatisticasService: BuscarEstatisticasService,
  ) {}

  async buscar(request: FastifyRequest, reply: FastifyReply) {
    const dto = buscarEstatisticasSchema.parse(request.query)
    const estatisticas = await this.buscarEstatisticasService.executar(
      request.user.sub,
      dto.periodo,
      criarDataEstatistica(dto.data),
    )

    return reply.status(200).send({
      estatisticas: EstatisticasMapper.paraResposta(estatisticas),
    })
  }
}
