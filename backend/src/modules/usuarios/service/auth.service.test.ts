import { describe, expect, it } from 'vitest'

import { Usuario } from '../domain/Usuario.js'
import { TokenAtualizacao } from '../domain/TokenAtualizacao.js'
import type { TokenAtualizacaoRepository } from '../repository/token-atualizacao.repository.js'
import type { UsuarioRepository } from '../repository/usuario.repository.js'
import { CadastrarUsuarioService } from './cadastrar-usuario.service.js'
import { LoginUsuarioService } from './login-usuario.service.js'
import type { SenhaService } from './senha.service.js'
import {
  gerarHashToken,
  GerarTokenAtualizacaoService,
  LogoutService,
  RenovarTokenService,
} from './token-atualizacao.service.js'

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

  async atualizar(usuario: Usuario) {
    const indice = this.usuarios.findIndex(
      (usuarioSalvo) => usuarioSalvo.id === usuario.id,
    )

    if (indice >= 0) {
      this.usuarios[indice] = usuario
      return usuario
    }

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

class TokenAtualizacaoRepositoryEmMemoria implements TokenAtualizacaoRepository {
  tokens: TokenAtualizacao[] = []

  async buscarPorHash(tokenHash: string) {
    return this.tokens.find((token) => token.tokenHash === tokenHash) ?? null
  }

  async salvar(token: TokenAtualizacao) {
    const indice = this.tokens.findIndex(
      (tokenSalvo) => tokenSalvo.id === token.id,
    )

    if (indice >= 0) {
      this.tokens[indice] = token
      return token
    }

    this.tokens.push(token)
    return token
  }
}

function criarServicos() {
  const usuarioRepository = new UsuarioRepositoryEmMemoria()
  const tokenAtualizacaoRepository = new TokenAtualizacaoRepositoryEmMemoria()
  const senhaService = new SenhaServiceFake()
  const gerarTokenAtualizacaoService = new GerarTokenAtualizacaoService(
    tokenAtualizacaoRepository,
  )

  return {
    tokenAtualizacaoRepository,
    cadastrarUsuarioService: new CadastrarUsuarioService(
      usuarioRepository,
      senhaService,
    ),
    loginUsuarioService: new LoginUsuarioService(
      usuarioRepository,
      senhaService,
    ),
    gerarTokenAtualizacaoService,
    renovarTokenService: new RenovarTokenService(
      tokenAtualizacaoRepository,
      usuarioRepository,
      gerarTokenAtualizacaoService,
    ),
    logoutService: new LogoutService(tokenAtualizacaoRepository),
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

  it('deve gerar refresh token armazenando apenas o hash', async () => {
    const { gerarTokenAtualizacaoService, tokenAtualizacaoRepository } =
      criarServicos()

    const refreshToken =
      await gerarTokenAtualizacaoService.executar('usuario-1')
    const tokenSalvo = await tokenAtualizacaoRepository.buscarPorHash(
      gerarHashToken(refreshToken),
    )

    expect(tokenSalvo?.usuarioId).toBe('usuario-1')
    expect(tokenSalvo?.tokenHash).not.toBe(refreshToken)
  })

  it('deve renovar refresh token revogando o token anterior', async () => {
    const {
      cadastrarUsuarioService,
      gerarTokenAtualizacaoService,
      renovarTokenService,
      tokenAtualizacaoRepository,
    } = criarServicos()
    const usuario = await cadastrarUsuarioService.executar({
      email: 'vavito@email.com',
      senha: 'senha-segura',
    })
    const refreshTokenAntigo = await gerarTokenAtualizacaoService.executar(
      usuario.id,
    )

    const resultado = await renovarTokenService.executar(refreshTokenAntigo)
    const tokenAntigo = await tokenAtualizacaoRepository.buscarPorHash(
      gerarHashToken(refreshTokenAntigo),
    )

    expect(resultado.usuario.id).toBe(usuario.id)
    expect(resultado.refreshToken).not.toBe(refreshTokenAntigo)
    expect(tokenAntigo?.revogadoEm).toBeInstanceOf(Date)
  })

  it('deve revogar refresh token no logout', async () => {
    const {
      gerarTokenAtualizacaoService,
      logoutService,
      tokenAtualizacaoRepository,
    } = criarServicos()
    const refreshToken =
      await gerarTokenAtualizacaoService.executar('usuario-1')

    await logoutService.executar(refreshToken)

    const tokenSalvo = await tokenAtualizacaoRepository.buscarPorHash(
      gerarHashToken(refreshToken),
    )

    expect(tokenSalvo?.revogadoEm).toBeInstanceOf(Date)
  })
})
