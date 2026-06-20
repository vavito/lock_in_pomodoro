# Contrato da API

Base URL local:

```txt
http://localhost:3333
```

Rotas protegidas usam:

```http
Authorization: Bearer <token>
```

Datas devem ser enviadas no formato ISO curto:

```txt
YYYY-MM-DD
```

Exemplo:

```txt
2026-06-20
```

## Autenticacao

### POST /auth/cadastro

Cria usuario e retorna tokens.

```json
{
  "nome": "Vavito",
  "email": "vavito@email.com",
  "senha": "senha-segura"
}
```

Resposta `201`:

```json
{
  "token": "access-token",
  "refreshToken": "refresh-token",
  "usuario": {
    "id": "uuid",
    "nome": "Vavito",
    "email": "vavito@email.com",
    "criadoEm": "2026-06-20T10:00:00.000Z"
  }
}
```

### POST /auth/login

Autentica usuario existente.

```json
{
  "email": "vavito@email.com",
  "senha": "senha-segura"
}
```

Resposta `200`:

```json
{
  "token": "access-token",
  "refreshToken": "refresh-token",
  "usuario": {
    "id": "uuid",
    "nome": "Vavito",
    "email": "vavito@email.com",
    "criadoEm": "2026-06-20T10:00:00.000Z"
  }
}
```

### POST /auth/refresh

Renova o access token e rotaciona o refresh token.

```json
{
  "refreshToken": "refresh-token"
}
```

Resposta `200`:

```json
{
  "token": "novo-access-token",
  "refreshToken": "novo-refresh-token",
  "usuario": {
    "id": "uuid",
    "nome": "Vavito",
    "email": "vavito@email.com",
    "criadoEm": "2026-06-20T10:00:00.000Z"
  }
}
```

### POST /auth/logout

Revoga o refresh token informado.

```json
{
  "refreshToken": "refresh-token"
}
```

Resposta `200`:

```json
{
  "mensagem": "Logout realizado com sucesso"
}
```

### GET /usuarios/me

Retorna usuario autenticado.

Resposta `200`:

```json
{
  "usuario": {
    "id": "uuid",
    "nome": "Vavito",
    "email": "vavito@email.com",
    "criadoEm": "2026-06-20T10:00:00.000Z"
  }
}
```

## Configuracoes Pomodoro

### GET /configuracoes-pomodoro

Busca configuracao do usuario autenticado. Se ainda nao existir, a API cria uma configuracao padrao.

Resposta `200`:

```json
{
  "configuracao": {
    "id": "uuid",
    "usuarioId": "uuid",
    "tempoPomodoroMinutos": 25,
    "tempoDescansoCurtoMinutos": 5,
    "tempoDescansoLongoMinutos": 15,
    "pomodorosParaDescansoLongo": 4,
    "iniciarDescansoAutomaticamente": false,
    "iniciarPomodoroAutomaticamente": false,
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:00:00.000Z"
  }
}
```

### PATCH /configuracoes-pomodoro

Atualiza configuracao do usuario. Todos os campos sao opcionais, mas ao menos um deve ser enviado.

Limites:

- tempos: `1` a `59`
- pomodoros para descanso longo: `1` a `99`

```json
{
  "tempoPomodoroMinutos": 40,
  "tempoDescansoCurtoMinutos": 8,
  "tempoDescansoLongoMinutos": 20,
  "pomodorosParaDescansoLongo": 5,
  "iniciarDescansoAutomaticamente": true,
  "iniciarPomodoroAutomaticamente": false
}
```

Resposta `200`:

```json
{
  "configuracao": {
    "id": "uuid",
    "usuarioId": "uuid",
    "tempoPomodoroMinutos": 40,
    "tempoDescansoCurtoMinutos": 8,
    "tempoDescansoLongoMinutos": 20,
    "pomodorosParaDescansoLongo": 5,
    "iniciarDescansoAutomaticamente": true,
    "iniciarPomodoroAutomaticamente": false,
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:05:00.000Z"
  }
}
```

## Sessoes Pomodoro

Tipos aceitos:

```txt
POMODORO
DESCANSO_CURTO
DESCANSO_LONGO
```

Status possiveis:

```txt
CRIADA
EM_ANDAMENTO
PAUSADA
CONCLUIDA
CANCELADA
```

### POST /sessoes-pomodoro

Cria uma sessao em andamento usando a duracao configurada para o tipo informado.

```json
{
  "tipo": "POMODORO"
}
```

Resposta `201`:

```json
{
  "sessao": {
    "id": "uuid",
    "usuarioId": "uuid",
    "tipo": "POMODORO",
    "status": "EM_ANDAMENTO",
    "duracaoMinutos": 25,
    "iniciadoEm": "2026-06-20T10:00:00.000Z",
    "finalizadoEm": null,
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:00:00.000Z"
  }
}
```

### PATCH /sessoes-pomodoro/:id/concluir

Conclui uma sessao em andamento e incrementa o resumo diario da data informada.

```json
{
  "data": "2026-06-20"
}
```

Resposta `200`:

```json
{
  "sessao": {
    "id": "uuid",
    "usuarioId": "uuid",
    "tipo": "POMODORO",
    "status": "CONCLUIDA",
    "duracaoMinutos": 25,
    "iniciadoEm": "2026-06-20T10:00:00.000Z",
    "finalizadoEm": "2026-06-20T10:25:00.000Z",
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:25:00.000Z"
  }
}
```

### PATCH /sessoes-pomodoro/:id/cancelar

Cancela uma sessao que ainda nao foi concluida. Nao incrementa o resumo diario.

Resposta `200`:

```json
{
  "sessao": {
    "id": "uuid",
    "usuarioId": "uuid",
    "tipo": "DESCANSO_CURTO",
    "status": "CANCELADA",
    "duracaoMinutos": 5,
    "iniciadoEm": "2026-06-20T10:00:00.000Z",
    "finalizadoEm": "2026-06-20T10:03:00.000Z",
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:03:00.000Z"
  }
}
```

## Resumos Diarios

### GET /resumos-diarios/:data

Busca o resumo diario do usuario autenticado. Se ainda nao existir, cria zerado.

Exemplo:

```http
GET /resumos-diarios/2026-06-20
```

Resposta `200`:

```json
{
  "resumo": {
    "id": "uuid",
    "usuarioId": "uuid",
    "data": "2026-06-20",
    "pomodorosRealizados": 3,
    "descansosCurtosRealizados": 2,
    "descansosLongosRealizados": 1,
    "tempoEstudandoMinutos": 75,
    "tempoDescansoMinutos": 25,
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:05:00.000Z"
  }
}
```

### PATCH /resumos-diarios/:data

Atualiza manualmente os contadores do dia e recalcula os tempos usando a configuracao atual.

Todos os campos sao opcionais, mas ao menos um deve ser enviado.

Limite de cada contador: `0` a `1000`.

```json
{
  "pomodorosRealizados": 4,
  "descansosCurtosRealizados": 3,
  "descansosLongosRealizados": 1
}
```

Resposta `200`:

```json
{
  "resumo": {
    "id": "uuid",
    "usuarioId": "uuid",
    "data": "2026-06-20",
    "pomodorosRealizados": 4,
    "descansosCurtosRealizados": 3,
    "descansosLongosRealizados": 1,
    "tempoEstudandoMinutos": 100,
    "tempoDescansoMinutos": 30,
    "criadoEm": "2026-06-20T10:00:00.000Z",
    "atualizadoEm": "2026-06-20T10:10:00.000Z"
  }
}
```

## Estatisticas

### GET /estatisticas

Consulta estatisticas do usuario autenticado.

Query params:

- `periodo`: `dia`, `semana`, `mes` ou `ano`
- `data`: data base no formato `YYYY-MM-DD`

Exemplo:

```http
GET /estatisticas?periodo=semana&data=2026-06-20
```

Resposta `200`:

```json
{
  "estatisticas": {
    "periodo": {
      "tipo": "semana",
      "inicio": "2026-06-15",
      "fim": "2026-06-21"
    },
    "totais": {
      "pomodorosRealizados": 8,
      "descansosCurtosRealizados": 6,
      "descansosLongosRealizados": 2,
      "tempoEstudandoMinutos": 200,
      "tempoDescansoMinutos": 60,
      "diasUsados": 3
    },
    "dias": [
      {
        "data": "2026-06-20",
        "pomodorosRealizados": 4,
        "descansosCurtosRealizados": 3,
        "descansosLongosRealizados": 1,
        "tempoEstudandoMinutos": 100,
        "tempoDescansoMinutos": 30
      }
    ]
  }
}
```

Para `periodo=semana`, a API considera semana de segunda a domingo.

## Erros comuns

Token ausente ou invalido:

```json
{
  "mensagem": "Token invalido ou ausente"
}
```

Payload invalido:

```json
{
  "mensagem": "Dados invalidos",
  "campos": []
}
```

Erro de regra de negocio:

```json
{
  "mensagem": "Mensagem explicando o erro"
}
```
