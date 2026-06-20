export type ErrosAuth = {
  email?: string;
  senha?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email: string) {
  return emailRegex.test(email.trim());
}

export function senhaValida(senha: string) {
  return senha.length >= 8;
}

export function validarCamposAuth(email: string, senha: string): ErrosAuth {
  const erros: ErrosAuth = {};

  if (!emailValido(email)) {
    erros.email = "Informe um e-mail valido.";
  }

  if (!senhaValida(senha)) {
    erros.senha = "A senha deve ter no minimo 8 caracteres.";
  }

  return erros;
}
