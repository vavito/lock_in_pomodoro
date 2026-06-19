import type { ResumoDiario } from '../domain/ResumoDiario.js'

export interface ResumoDiarioRepository {
  buscarPorUsuarioIdEData(
    usuarioId: string,
    data: Date,
  ): Promise<ResumoDiario | null>
  salvar(resumo: ResumoDiario): Promise<ResumoDiario>
}
