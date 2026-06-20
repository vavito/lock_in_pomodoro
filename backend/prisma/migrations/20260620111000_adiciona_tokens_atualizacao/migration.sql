CREATE TABLE "tokens_atualizacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "revogadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_atualizacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tokens_atualizacao_tokenHash_key" ON "tokens_atualizacao"("tokenHash");

CREATE INDEX "tokens_atualizacao_usuarioId_idx" ON "tokens_atualizacao"("usuarioId");

CREATE INDEX "tokens_atualizacao_expiraEm_idx" ON "tokens_atualizacao"("expiraEm");

ALTER TABLE "tokens_atualizacao" ADD CONSTRAINT "tokens_atualizacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
