import { describe, expect, it } from 'vitest'

import { Usuario } from '../domain/Usuario.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'
import { CadastrarUsuarioService } from './cadastrar-usuario.service.js'
import { LoginUsuarioService } from './login-usuario.service.js'
import type { SenhaService } from './senha.service.js'

class UsuarioRepositoryEmMemoria implements UsuarioRepository {
  private usuarios: Usuario[] = []

  async buscarPorEmail(email: string) {
    return this.usuarios.find((usuario) => usuario.possuiEmail(email)) ?? null
  }

  async buscarPorId(id: string) {
    return this.usuarios.find((usuario) => usuario.id === id) ?? null
  }

  async salvar(usuario: Usuario) {
    this.usuarios.push(usuario)
    return usuario
  }
}

class SenhaServiceFake implements SenhaService {
  async gerarHash(senha: string) {
    return `hash:${senha}`
  }

  async comparar(senha: string, senhaHash: string) {
    return senhaHash === `hash:${senha}`
  }
}

function criarServicos() {
  const usuarioRepository = new UsuarioRepositoryEmMemoria()
  const senhaService = new SenhaServiceFake()

  return {
    cadastrarUsuarioService: new CadastrarUsuarioService(
      usuarioRepository,
      senhaService,
    ),
    loginUsuarioService: new LoginUsuarioService(
      usuarioRepository,
      senhaService,
    ),
  }
}

describe('autenticacao de usuario', () => {
  it('deve cadastrar um usuario com senha em hash', async () => {
    const { cadastrarUsuarioService } = criarServicos()

    const usuario = await cadastrarUsuarioService.executar({
      nome: 'Vavito',
      email: 'VAVITO@email.com',
      senha: 'senha-segura',
    })

    expect(usuario.email).toBe('vavito@email.com')
    expect(usuario.senhaHash).toBe('hash:senha-segura')
  })

  it('nao deve cadastrar email repetido', async () => {
    const { cadastrarUsuarioService } = criarServicos()

    await cadastrarUsuarioService.executar({
      email: 'vavito@email.com',
      senha: 'senha-segura',
    })

    await expect(
      cadastrarUsuarioService.executar({
        email: 'vavito@email.com',
        senha: 'outra-senha',
      }),
    ).rejects.toThrow('Email ja cadastrado')
  })

  it('deve permitir login com credenciais validas', async () => {
    const { cadastrarUsuarioService, loginUsuarioService } = criarServicos()

    await cadastrarUsuarioService.executar({
      email: 'vavito@email.com',
      senha: 'senha-segura',
    })

    const usuario = await loginUsuarioService.executar({
      email: 'vavito@email.com',
      senha: 'senha-segura',
    })

    expect(usuario.email).toBe('vavito@email.com')
  })

  it('nao deve permitir login com senha invalida', async () => {
    const { cadastrarUsuarioService, loginUsuarioService } = criarServicos()

    await cadastrarUsuarioService.executar({
      email: 'vavito@email.com',
      senha: 'senha-segura',
    })

    await expect(
      loginUsuarioService.executar({
        email: 'vavito@email.com',
        senha: 'senha-errada',
      }),
    ).rejects.toThrow('Email ou senha invalidos')
  })
})
