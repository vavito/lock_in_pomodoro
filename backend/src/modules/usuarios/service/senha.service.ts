export interface SenhaService {
  gerarHash(senha: string): Promise<string>
  comparar(senha: string, senhaHash: string): Promise<boolean>
}
