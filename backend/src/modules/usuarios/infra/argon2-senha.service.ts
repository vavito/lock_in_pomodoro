import { hash, verify } from 'argon2'

import type { SenhaService } from '../service/senha.service.js'

export class Argon2SenhaService implements SenhaService {
  async gerarHash(senha: string) {
    return hash(senha)
  }

  async comparar(senha: string, senhaHash: string) {
    return verify(senhaHash, senha)
  }
}
