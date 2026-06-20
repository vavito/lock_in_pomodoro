import { describe, expect, it } from 'vitest'

import { ResumoDiario } from '../../resumos-diarios/domain/ResumoDiario.js'
import type { EstatisticasRepository } from '../repository/estatisticas.repository.js'
import { BuscarEstatisticasService } from './buscar-estatisticas.service.js'

class EstatisticasRepositoryEmMemoria implements EstatisticasRepository {
  constructor(private readonly resumos: ResumoDiario[]) {}

  async buscarResumosPorPeriodo(usuarioId: string, inicio: Date, fim: Date) {
    return this.resumos.filter(
      (resumo) =>
        resumo.usuarioId === usuarioId &&
        resumo.data.getTime() >= inicio.getTime() &&
        resumo.data.getTime() <= fim.getTime(),
    )
  }
}

function criarResumo(data: string, pomodorosRealizados: number) {
  return ResumoDiario.criar({
    usuarioId: 'usuario-1',
    data: new Date(`${data}T00:00:00.000Z`),
    pomodorosRealizados,
    descansosCurtosRealizados: 1,
    descansosLongosRealizados: 0,
    tempoEstudandoMinutos: pomodorosRealizados * 25,
    tempoDescansoMinutos: 5,
  })
}

describe('estatisticas', () => {
  it('deve somar estatisticas do dia', async () => {
    const service = new BuscarEstatisticasService(
      new EstatisticasRepositoryEmMemoria([
        criarResumo('2026-06-20', 3),
        criarResumo('2026-06-21', 2),
      ]),
    )

    const estatisticas = await service.executar(
      'usuario-1',
      'dia',
      new Date('2026-06-20T00:00:00.000Z'),
    )

    expect(estatisticas.inicio.toISOString().slice(0, 10)).toBe('2026-06-20')
    expect(estatisticas.fim.toISOString().slice(0, 10)).toBe('2026-06-20')
    expect(estatisticas.calcularTotais().pomodorosRealizados).toBe(3)
  })

  it('deve calcular semana de segunda a domingo', async () => {
    const service = new BuscarEstatisticasService(
      new EstatisticasRepositoryEmMemoria([
        criarResumo('2026-06-15', 1),
        criarResumo('2026-06-20', 2),
        criarResumo('2026-06-22', 5),
      ]),
    )

    const estatisticas = await service.executar(
      'usuario-1',
      'semana',
      new Date('2026-06-20T00:00:00.000Z'),
    )

    expect(estatisticas.inicio.toISOString().slice(0, 10)).toBe('2026-06-15')
    expect(estatisticas.fim.toISOString().slice(0, 10)).toBe('2026-06-21')
    expect(estatisticas.calcularTotais().pomodorosRealizados).toBe(3)
  })

  it('deve somar estatisticas do mes', async () => {
    const service = new BuscarEstatisticasService(
      new EstatisticasRepositoryEmMemoria([
        criarResumo('2026-06-01', 1),
        criarResumo('2026-06-30', 2),
        criarResumo('2026-07-01', 10),
      ]),
    )

    const estatisticas = await service.executar(
      'usuario-1',
      'mes',
      new Date('2026-06-20T00:00:00.000Z'),
    )

    expect(estatisticas.inicio.toISOString().slice(0, 10)).toBe('2026-06-01')
    expect(estatisticas.fim.toISOString().slice(0, 10)).toBe('2026-06-30')
    expect(estatisticas.calcularTotais().pomodorosRealizados).toBe(3)
  })

  it('deve somar estatisticas do ano', async () => {
    const service = new BuscarEstatisticasService(
      new EstatisticasRepositoryEmMemoria([
        criarResumo('2026-01-01', 1),
        criarResumo('2026-12-31', 2),
        criarResumo('2027-01-01', 10),
      ]),
    )

    const estatisticas = await service.executar(
      'usuario-1',
      'ano',
      new Date('2026-06-20T00:00:00.000Z'),
    )

    expect(estatisticas.inicio.toISOString().slice(0, 10)).toBe('2026-01-01')
    expect(estatisticas.fim.toISOString().slice(0, 10)).toBe('2026-12-31')
    expect(estatisticas.calcularTotais().pomodorosRealizados).toBe(3)
  })
})
