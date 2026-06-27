# Lock In Pomodoro

![GitHub language count](https://img.shields.io/github/languages/count/vavito/lock_in_pomodoro?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen?style=for-the-badge)
![CI](https://img.shields.io/github/actions/workflow/status/vavito/lock_in_pomodoro/ci.yml?branch=main&style=for-the-badge)

Aplicacao web full stack de Pomodoro, desenvolvida com **Fastify + Prisma + PostgreSQL** no backend e **React + TypeScript + Tailwind CSS** no frontend.

O projeto permite criar uma conta, controlar ciclos de foco e descanso, acompanhar estatisticas por periodo, personalizar tempos do Pomodoro e editar dados do perfil em uma interface responsiva.

---

## Imagens demonstrativas

![Tela de login](./assets/login.png)
_Tela de login da aplicacao._

![Tela de cadastro](./assets/cadastro.png)
_Tela de cadastro de novos usuarios._

![Timer](./assets/timer.png)
_Pagina principal com o temporizador Pomodoro._

![Estatisticas](./assets/estatisticas.png)
_Pagina de estatisticas com calendario proprio e indicadores de desempenho._

![Configuracoes](./assets/configuracoes.png)
_Pagina para configurar tempos de foco, descanso e automacoes._

![Perfil](./assets/perfil.png)
_Pagina de perfil para alterar nome, e-mail e senha._

---

## Objetivo

Este projeto foi desenvolvido para praticar a construcao de uma aplicacao **full stack completa**, com autenticacao, persistencia de dados, deploy separado de frontend e backend, banco PostgreSQL em nuvem e pipeline de CI para validar futuras alteracoes.

O foco principal foi trabalhar com:

- Autenticacao com tokens de acesso e refresh token
- Controle de sessoes Pomodoro
- Persistencia de configuracoes por usuario
- Estatisticas diarias, semanais, mensais e anuais
- Interface responsiva para desktop e mobile
- Integracao entre frontend, API REST e banco PostgreSQL
- Deploy com **Supabase**, **Render** e **Vercel**
- Testes e validacoes automatizadas via GitHub Actions

---

## Funcionalidades

- **Criar conta e fazer login**
- **Editar nome, e-mail e senha**
- **Iniciar, parar e pular sessoes Pomodoro**
- **Manter o timer ativo ao navegar entre paginas**
- **Emitir alarme ao finalizar foco ou descanso**
- **Configurar tempos de Pomodoro, descanso curto e descanso longo**
- **Ativar inicio automatico de descanso e Pomodoro**
- **Visualizar resumo diario**
- **Editar manualmente o resumo do dia**
- **Consultar estatisticas por dia, semana, mes e ano**
- **Selecionar datas com calendario proprio**
- **Usar sidebar recolhivel no desktop**
- **Usar navegacao inferior no mobile**
- **Alternar entre tema claro e escuro**

---

## Tecnologias Utilizadas

### Backend

- **Node.js**
- **TypeScript**
- **Fastify**
- **Prisma**
- **PostgreSQL**
- **Supabase**
- **Zod**
- **Argon2**
- **JWT**
- **Vitest**
- **ESLint**
- **Render**

### Frontend

- **React**
- **TypeScript**
- **Vite**
- **TanStack Router**
- **TanStack Query**
- **Tailwind CSS**
- **Lucide React**
- **Sonner**
- **Vercel**

### DevOps e Qualidade

- **GitHub Actions**
- **Docker Compose**
- **Prisma Migrate**
- **CI para backend e frontend**

---

## Arquitetura

O projeto foi dividido em duas aplicacoes principais:

- `backend` -> API REST responsavel por autenticacao, usuarios, configuracoes, sessoes Pomodoro, resumos diarios e estatisticas.
- `frontend` -> Interface web responsavel pelo fluxo de login/cadastro, timer, estatisticas, configuracoes, perfil e experiencia responsiva.

O banco de dados PostgreSQL armazena usuarios, tokens de atualizacao, configuracoes individuais, sessoes Pomodoro e resumos diarios.

Em producao, o projeto utiliza:

- **Supabase** para PostgreSQL
- **Render** para hospedar a API
- **Vercel** para hospedar o frontend

---

## Fluxo Principal

O fluxo principal da aplicacao segue o padrao:

**Login -> Timer -> Sessao -> Resumo Diario -> Estatisticas**

1. O usuario cria uma conta ou faz login.
2. O frontend autentica na API e recebe tokens de acesso.
3. O usuario inicia uma sessao Pomodoro ou de descanso.
4. O backend registra a sessao e atualiza o resumo diario ao concluir ou parar.
5. O timer continua ativo enquanto o usuario navega pelo app.
6. O usuario acompanha o progresso em estatisticas e pode ajustar suas configuracoes.

---

## Banco de Dados

Principais entidades do Prisma:

- `Usuario`
- `TokenAtualizacao`
- `ConfiguracaoPomodoro`
- `SessaoPomodoro`
- `ResumoDiario`

As sessoes podem ser dos tipos:

- `POMODORO`
- `DESCANSO_CURTO`
- `DESCANSO_LONGO`

E os resumos diarios consolidam:

- Pomodoros realizados
- Descansos curtos realizados
- Descansos longos realizados
- Tempo focado
- Tempo de descanso

---

## Deploy

Aplicacao em producao:

- Frontend: [lockinpomodoro.vercel.app](https://lockinpomodoro.vercel.app)
- Backend: [lock-in-pomodoro.onrender.com](https://lock-in-pomodoro.onrender.com)

O deploy foi estruturado com variaveis de ambiente separadas para frontend e backend.

### Variaveis do Backend

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=sua-chave-segura
ORIGEM_FRONTEND=https://lockinpomodoro.vercel.app
```

### Variaveis do Frontend

```env
VITE_API_URL=https://lock-in-pomodoro.onrender.com
```

---

## Como Rodar Localmente

### 1. Subir o PostgreSQL

```bash
docker compose up -d
```

Banco local:

```text
postgresql://lock_in:lock_in@localhost:5433/lock_in_pomodoro?schema=public
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Backend:

```text
http://localhost:3333
```

Exemplo de `.env` para o backend:

```env
NODE_ENV=development
PORT=3333
HOST=0.0.0.0
ORIGEM_FRONTEND=http://localhost:5173
DATABASE_URL=postgresql://lock_in:lock_in@localhost:5433/lock_in_pomodoro?schema=public
DIRECT_URL=postgresql://lock_in:lock_in@localhost:5433/lock_in_pomodoro?schema=public
JWT_SECRET=chave-local-com-tamanho-seguro
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Exemplo de `.env.local` para o frontend:

```env
VITE_API_URL=http://localhost:3333
```

---

## Testes e CI

O projeto possui workflow de CI no GitHub Actions para validar backend e frontend em pushes e pull requests para a `main`.

### Backend

```bash
cd backend
npm run lint
npm run build
npm test
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

---

## Melhorias Futuras

- [ ] Adicionar testes automatizados end-to-end
- [ ] Criar graficos mais detalhados para estatisticas
- [ ] Adicionar historico completo de sessoes
- [ ] Permitir metas diarias ou semanais de foco
- [ ] Adicionar sons de alarme configuraveis

---

## Autor

Desenvolvido por **Joao Victor**.

- [LinkedIn](https://www.linkedin.com/in/joao-victor-moreira-almeida/)
- [GitHub](https://github.com/vavito)
