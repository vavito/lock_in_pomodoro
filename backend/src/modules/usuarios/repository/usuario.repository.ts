import type { Usuario } from '../domain/Usuario.js'

export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>
  buscarPorId(id: string): Promise<Usuario | null>
  salvar(usuario: Usuario): Promise<Usuario>
}
