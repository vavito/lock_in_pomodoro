CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "TipoSessaoPomodoro" AS ENUM ('POMODORO', 'DESCANSO_CURTO', 'DESCANSO_LONGO');

CREATE TYPE "StatusSessaoPomodoro" AS ENUM ('CRIADA', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA');

CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuracoes_pomodoro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tempoPomodoroMinutos" INTEGER NOT NULL DEFAULT 25,
    "tempoDescansoCurtoMinutos" INTEGER NOT NULL DEFAULT 5,
    "tempoDescansoLongoMinutos" INTEGER NOT NULL DEFAULT 15,
    "pomodorosParaDescansoLongo" INTEGER NOT NULL DEFAULT 4,
    "iniciarDescansoAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "iniciarPomodoroAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pomodoro_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessoes_pomodoro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoSessaoPomodoro" NOT NULL,
    "status" "StatusSessaoPomodoro" NOT NULL DEFAULT 'CRIADA',
    "duracaoMinutos" INTEGER NOT NULL,
    "iniciadoEm" TIMESTAMP(3),
    "finalizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pomodoro_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "resumos_diarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "pomodorosRealizados" INTEGER NOT NULL DEFAULT 0,
    "descansosCurtosRealizados" INTEGER NOT NULL DEFAULT 0,
    "descansosLongosRealizados" INTEGER NOT NULL DEFAULT 0,
    "tempoEstudandoMinutos" INTEGER NOT NULL DEFAULT 0,
    "tempoDescansoMinutos" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumos_diarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

CREATE UNIQUE INDEX "configuracoes_pomodoro_usuarioId_key" ON "configuracoes_pomodoro"("usuarioId");

CREATE INDEX "sessoes_pomodoro_usuarioId_criadoEm_idx" ON "sessoes_pomodoro"("usuarioId", "criadoEm");

CREATE INDEX "resumos_diarios_usuarioId_data_idx" ON "resumos_diarios"("usuarioId", "data");

CREATE UNIQUE INDEX "resumos_diarios_usuarioId_data_key" ON "resumos_diarios"("usuarioId", "data");

ALTER TABLE "configuracoes_pomodoro" ADD CONSTRAINT "configuracoes_pomodoro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sessoes_pomodoro" ADD CONSTRAINT "sessoes_pomodoro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "resumos_diarios" ADD CONSTRAINT "resumos_diarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
