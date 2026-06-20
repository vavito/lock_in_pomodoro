import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  aoDeslogar,
  authApi,
  limparTokens,
  obterRefreshToken,
  obterToken,
  salvarTokens,
} from "@/services/api";
import type { Usuario } from "@/types";

type AuthContextType = {
  usuario: Usuario | null;
  carregando: boolean;
  logado: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastro: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarUsuario = useCallback(async () => {
    const token = obterToken();
    if (!token) {
      setUsuario(null);
      setCarregando(false);
      return;
    }
    try {
      const u = await authApi.me();
      setUsuario(u);
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuario();
    const off = aoDeslogar(() => {
      setUsuario(null);
    });
    return off;
  }, [carregarUsuario]);

  const login = async (email: string, senha: string) => {
    const resp = await authApi.login(email, senha);
    salvarTokens(resp.token, resp.refreshToken);
    if (resp.usuario) {
      setUsuario(resp.usuario);
    } else {
      const u = await authApi.me();
      setUsuario(u);
    }
  };

  const cadastro = async (nome: string, email: string, senha: string) => {
    const resp = await authApi.cadastro(nome, email, senha);
    salvarTokens(resp.token, resp.refreshToken);
    if (resp.usuario) {
      setUsuario(resp.usuario);
    } else {
      const u = await authApi.me();
      setUsuario(u);
    }
  };

  const logout = async () => {
    const refresh = obterRefreshToken();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch (erro) {
        void erro;
      }
    }
    limparTokens();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        logado: !!usuario,
        login,
        cadastro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
