export type ConfiguracaoPomodoroRespostaDTO = {
  id: string
  usuarioId: string
  tempoPomodoroMinutos: number
  tempoDescansoCurtoMinutos: number
  tempoDescansoLongoMinutos: number
  pomodorosParaDescansoLongo: number
  iniciarDescansoAutomaticamente: boolean
  iniciarPomodoroAutomaticamente: boolean
  criadoEm: string
  atualizadoEm: string
}
