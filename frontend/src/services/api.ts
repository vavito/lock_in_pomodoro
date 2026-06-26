import type {
  AuthResponse,
  Configuracao,
  EstatisticaDia,
  Estatisticas,
  ResumoDiario,
  Sessao,
  TipoSessao,
  Usuario,
} from "@/types";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

const TOKEN_KEY = "lockin.token";
const REFRESH_KEY = "lockin.refreshToken";

type RequestOptions = {
  method?: string;
  body?: unknown;
  autenticada?: boolean;
};

type UsuarioResponse = {
  usuario: Usuario;
};

type ConfiguracaoResponse = {
  configuracao: Configuracao;
};

type SessaoResponse = {
  sessao: Sessao;
};

type ResumoResponse = {
  resumo: ResumoDiario;
};

type EstatisticasBackendResponse = {
  estatisticas: {
    totais?: Partial<Omit<Estatisticas, "dias">>;
    dias?: Partial<EstatisticaDia>[];
  };
};

function numeroSeguro(valor: unknown): number {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

function textoSeguro(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

function mapearEstatisticas(resposta: EstatisticasBackendResponse): Estatisticas {
  const totais = resposta.estatisticas.totais ?? {};
  const dias = resposta.estatisticas.dias ?? [];

  return {
    pomodorosRealizados: numeroSeguro(totais.pomodorosRealizados),
    descansosCurtosRealizados: numeroSeguro(totais.descansosCurtosRealizados),
    descansosLongosRealizados: numeroSeguro(totais.descansosLongosRealizados),
    tempoEstudandoMinutos: numeroSeguro(totais.tempoEstudandoMinutos),
    tempoDescansoMinutos: numeroSeguro(totais.tempoDescansoMinutos),
    diasUsados: numeroSeguro(totais.diasUsados),
    dias: dias.map((dia) => ({
      data: textoSeguro(dia.data),
      pomodorosRealizados: numeroSeguro(dia.pomodorosRealizados),
      descansosCurtosRealizados: numeroSeguro(dia.descansosCurtosRealizados),
      descansosLongosRealizados: numeroSeguro(dia.descansosLongosRealizados),
      tempoEstudandoMinutos: numeroSeguro(dia.tempoEstudandoMinutos),
      tempoDescansoMinutos: numeroSeguro(dia.tempoDescansoMinutos),
    })),
  };
}

export function obterToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function obterRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function salvarTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function limparTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function aoDeslogar(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener("lockin:logout", handler);
  return () => window.removeEventListener("lockin:logout", handler);
}

function dispararLogout() {
  limparTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("lockin:logout"));
  }
}

async function tentarRefresh(): Promise<boolean> {
  const refreshToken = obterRefreshToken();
  if (!refreshToken) return false;

  try {
    const resposta = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!resposta.ok) return false;

    const dados = (await resposta.json()) as AuthResponse;
    salvarTokens(dados.token, dados.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, autenticada = true } = opts;

  const fazer = async (): Promise<Response> => {
    const headers: Record<string, string> = {};

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (autenticada) {
      const token = obterToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let resposta = await fazer();

  if (resposta.status === 401 && autenticada) {
    const renovou = await tentarRefresh();

    if (renovou) {
      resposta = await fazer();
    } else {
      dispararLogout();
      throw new Error("Sessao expirada. Faca login novamente.");
    }
  }

  if (!resposta.ok) {
    let mensagem = `Erro ${resposta.status}`;

    try {
      const dados = await resposta.json();
      if (dados?.mensagem) mensagem = dados.mensagem;
      else if (dados?.message) mensagem = dados.message;
    } catch (erro) {
      void erro;
    }

    throw new Error(mensagem);
  }

  if (resposta.status === 204) return undefined as T;

  const texto = await resposta.text();
  if (!texto) return undefined as T;
  return JSON.parse(texto) as T;
}

export const authApi = {
  login: (email: string, senha: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, senha },
      autenticada: false,
    }),
  cadastro: (nome: string, email: string, senha: string) =>
    request<AuthResponse>("/auth/cadastro", {
      method: "POST",
      body: { nome, email, senha },
      autenticada: false,
    }),
  logout: (refreshToken: string) =>
    request<void>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      autenticada: false,
    }),
  me: async () => {
    const resposta = await request<UsuarioResponse>("/usuarios/me");
    return resposta.usuario;
  },
  atualizarPerfil: async (dados: { nome?: string; email?: string }) => {
    const resposta = await request<UsuarioResponse>("/usuarios/me", {
      method: "PATCH",
      body: dados,
    });
    return resposta.usuario;
  },
  alterarSenha: async (senhaAtual: string, novaSenha: string) => {
    const resposta = await request<UsuarioResponse>("/usuarios/me/senha", {
      method: "PATCH",
      body: { senhaAtual, novaSenha },
    });
    return resposta.usuario;
  },
};

export const configuracoesApi = {
  obter: async () => {
    const resposta = await request<ConfiguracaoResponse>("/configuracoes-pomodoro");
    return resposta.configuracao;
  },
  atualizar: async (dados: Partial<Configuracao>) => {
    const resposta = await request<ConfiguracaoResponse>("/configuracoes-pomodoro", {
      method: "PATCH",
      body: dados,
    });
    return resposta.configuracao;
  },
};

export const sessoesApi = {
  criar: async (tipo: TipoSessao) => {
    const resposta = await request<SessaoResponse>("/sessoes-pomodoro", {
      method: "POST",
      body: { tipo },
    });
    return resposta.sessao;
  },
  concluir: async (id: string, data: string) => {
    const resposta = await request<SessaoResponse>(`/sessoes-pomodoro/${id}/concluir`, {
      method: "PATCH",
      body: { data },
    });
    return resposta.sessao;
  },
  cancelar: async (id: string) => {
    const resposta = await request<SessaoResponse>(`/sessoes-pomodoro/${id}/cancelar`, {
      method: "PATCH",
    });
    return resposta.sessao;
  },
  parar: async (id: string, data: string, minutosRealizados: number) => {
    const resposta = await request<SessaoResponse>(`/sessoes-pomodoro/${id}/parar`, {
      method: "PATCH",
      body: { data, minutosRealizados },
    });
    return resposta.sessao;
  },
};

export const resumosApi = {
  obter: async (data: string) => {
    const resposta = await request<ResumoResponse>(`/resumos-diarios/${data}`);
    return resposta.resumo;
  },
  atualizar: async (
    data: string,
    dados: {
      pomodorosRealizados?: number;
      descansosCurtosRealizados?: number;
      descansosLongosRealizados?: number;
    },
  ) => {
    const resposta = await request<ResumoResponse>(`/resumos-diarios/${data}`, {
      method: "PATCH",
      body: dados,
    });
    return resposta.resumo;
  },
};

export const estatisticasApi = {
  obter: async (periodo: "dia" | "semana" | "mes" | "ano", data: string) => {
    const resposta = await request<EstatisticasBackendResponse>(
      `/estatisticas?periodo=${periodo}&data=${encodeURIComponent(data)}`,
    );
    return mapearEstatisticas(resposta);
  },
};
