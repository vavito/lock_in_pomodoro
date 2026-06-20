import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CampoNumero } from "@/components/CampoNumero";
import { resumosApi } from "@/services/api";
import type { ResumoDiario } from "@/types";
import { formatarTempoMinutos, hojeYYYYMMDD } from "@/lib/data";

type Props = {
  resumo: ResumoDiario | null;
  aoAtualizar: () => void | Promise<void>;
};

export function ResumoDoDia({ resumo, aoAtualizar }: Props) {
  const [editando, setEditando] = useState(false);
  const [poms, setPoms] = useState("0");
  const [curtos, setCurtos] = useState("0");
  const [longos, setLongos] = useState("0");
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    setPoms(String(resumo?.pomodorosRealizados ?? 0));
    setCurtos(String(resumo?.descansosCurtosRealizados ?? 0));
    setLongos(String(resumo?.descansosLongosRealizados ?? 0));
  }, [resumo]);

  const cancelarEdicao = () => {
    setPoms(String(resumo?.pomodorosRealizados ?? 0));
    setCurtos(String(resumo?.descansosCurtosRealizados ?? 0));
    setLongos(String(resumo?.descansosLongosRealizados ?? 0));
    setErros({});
    setEditando(false);
  };

  const validarContador = (valor: string, rotulo: string) => {
    if (valor.trim() === "") return 0;

    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 0 || numero > 1000) {
      return `${rotulo} deve estar entre 0 e 1000.`;
    }

    return numero;
  };

  const salvar = async () => {
    const pomodoros = validarContador(poms, "Pomodoros");
    const descansosCurtos = validarContador(curtos, "Descansos curtos");
    const descansosLongos = validarContador(longos, "Descansos longos");
    const novosErros = {
      poms: typeof pomodoros === "string" ? pomodoros : "",
      curtos: typeof descansosCurtos === "string" ? descansosCurtos : "",
      longos: typeof descansosLongos === "string" ? descansosLongos : "",
    };

    setErros(novosErros);
    if (
      typeof pomodoros === "string" ||
      typeof descansosCurtos === "string" ||
      typeof descansosLongos === "string"
    ) {
      return;
    }

    setSalvando(true);
    try {
      await resumosApi.atualizar(hojeYYYYMMDD(), {
        pomodorosRealizados: pomodoros,
        descansosCurtosRealizados: descansosCurtos,
        descansosLongosRealizados: descansosLongos,
      });
      toast.success("Contadores atualizados com sucesso.");
      setEditando(false);
      await aoAtualizar();
    } catch (e) {
      toast.error((e as Error).message);
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

        {!editando && (
          <button
            onClick={() => {
              setErros({});
              setEditando(true);
            }}
            className="self-start rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
          >
            Editar
          </button>
        )}
      </div>

      {editando && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <CampoNumero
              rotulo="Pomodoros"
              valor={poms}
              min={0}
              max={1000}
              erro={erros.poms}
              onChange={setPoms}
            />
            <CampoNumero
              rotulo="Descansos Curtos"
              valor={curtos}
              min={0}
              max={1000}
              erro={erros.curtos}
              onChange={setCurtos}
            />
            <CampoNumero
              rotulo="Descansos Longos"
              valor={longos}
              min={0}
              max={1000}
              erro={erros.longos}
              onChange={setLongos}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">Limite: 0 a 1000 por contador.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={salvar}
                disabled={salvando}
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={cancelarEdicao}
                disabled={salvando}
                className="cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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
