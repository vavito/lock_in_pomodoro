import { useEffect, useState } from "react";
import { resumosApi } from "@/services/api";
import type { ResumoDiario } from "@/types";
import { formatarTempoMinutos, hojeYYYYMMDD } from "@/lib/data";

type Props = {
  resumo: ResumoDiario | null;
  aoAtualizar: () => void | Promise<void>;
};

export function ResumoDoDia({ resumo, aoAtualizar }: Props) {
  const [editando, setEditando] = useState(false);
  const [poms, setPoms] = useState(0);
  const [curtos, setCurtos] = useState(0);
  const [longos, setLongos] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    setPoms(resumo?.pomodorosRealizados ?? 0);
    setCurtos(resumo?.descansosCurtosRealizados ?? 0);
    setLongos(resumo?.descansosLongosRealizados ?? 0);
  }, [resumo]);

  const limitar = (n: number) => Math.max(0, Math.min(1000, Math.floor(n || 0)));

  const salvar = async () => {
    setSalvando(true);
    setMensagem(null);
    try {
      await resumosApi.atualizar(hojeYYYYMMDD(), {
        pomodorosRealizados: limitar(poms),
        descansosCurtosRealizados: limitar(curtos),
        descansosLongosRealizados: limitar(longos),
      });
      setMensagem("Contadores atualizados.");
      setEditando(false);
      await aoAtualizar();
    } catch (e) {
      setMensagem((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono-timer text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Resumo do Dia
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-8 sm:gap-12">
          <Metrica
            rotulo="Pomodoros"
            valor={String(resumo?.pomodorosRealizados ?? 0).padStart(2, "0")}
          />
          <Metrica
            rotulo="Descansos Curtos"
            valor={String(resumo?.descansosCurtosRealizados ?? 0).padStart(2, "0")}
          />
          <Metrica
            rotulo="Descansos Longos"
            valor={String(resumo?.descansosLongosRealizados ?? 0).padStart(2, "0")}
          />
          <Metrica
            rotulo="Tempo Focado"
            valor={formatarTempoMinutos(resumo?.tempoEstudandoMinutos ?? 0)}
            destaque
          />
          <Metrica
            rotulo="Tempo Descanso"
            valor={formatarTempoMinutos(resumo?.tempoDescansoMinutos ?? 0)}
          />
        </div>

        <button
          onClick={() => setEditando((v) => !v)}
          className="self-start rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
        >
          {editando ? "Cancelar" : "Editar"}
        </button>
      </div>

      {editando && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoNumero rotulo="Pomodoros" valor={poms} setValor={setPoms} />
            <CampoNumero rotulo="Descansos Curtos" valor={curtos} setValor={setCurtos} />
            <CampoNumero rotulo="Descansos Longos" valor={longos} setValor={setLongos} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {mensagem ?? "Limite: 0 a 1000 por contador."}
            </p>
            <button
              onClick={salvar}
              disabled={salvando}
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      )}

      {!editando && mensagem && <p className="mt-3 text-xs text-muted-foreground">{mensagem}</p>}
    </div>
  );
}

function Metrica({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={"font-mono-timer text-2xl " + (destaque ? "text-primary" : "text-foreground")}
      >
        {valor}
      </span>
      <span className="font-mono-timer text-[9px] uppercase tracking-widest text-muted-foreground">
        {rotulo}
      </span>
    </div>
  );
}

function CampoNumero({
  rotulo,
  valor,
  setValor,
}: {
  rotulo: string;
  valor: number;
  setValor: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{rotulo}</span>
      <input
        type="number"
        min={0}
        max={1000}
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}
