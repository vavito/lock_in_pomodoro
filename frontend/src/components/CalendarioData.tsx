import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { dataParaYYYYMMDD, hojeYYYYMMDD } from "@/lib/data";

type Props = {
  valor: string;
  onChange: (valor: string) => void;
};

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function dataLocal(valor: string) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function mesmoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatarData(valor: string) {
  return dataLocal(valor).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CalendarioData({ valor, onChange }: Props) {
  const [aberto, setAberto] = useState(false);
  const [mesAtual, setMesAtual] = useState(() => dataLocal(valor));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) setMesAtual(dataLocal(valor));
  }, [aberto, valor]);

  useEffect(() => {
    if (!aberto) return;

    const fecharAoClicarFora = (evento: MouseEvent) => {
      if (!containerRef.current?.contains(evento.target as Node)) setAberto(false);
    };

    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEsc);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEsc);
    };
  }, [aberto]);

  const dataSelecionada = dataLocal(valor);
  const hoje = dataLocal(hojeYYYYMMDD());
  const nomeMes = mesAtual.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const dias = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    const itens: (Date | null)[] = Array.from({ length: primeiroDiaSemana }, () => null);

    for (let dia = 1; dia <= ultimoDiaMes; dia += 1) {
      itens.push(new Date(ano, mes, dia));
    }

    while (itens.length % 7 !== 0) {
      itens.push(null);
    }

    return itens;
  }, [mesAtual]);

  const trocarMes = (quantidade: number) => {
    setMesAtual((data) => new Date(data.getFullYear(), data.getMonth() + quantidade, 1));
  };

  const selecionar = (data: Date) => {
    onChange(dataParaYYYYMMDD(data));
    setAberto(false);
  };

  const selecionarHoje = () => {
    onChange(hojeYYYYMMDD());
    setAberto(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((valorAtual) => !valorAtual)}
        className="flex h-10 w-full min-w-48 cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 text-left text-sm text-foreground outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:ring-2 focus:ring-primary sm:w-auto"
        aria-expanded={aberto}
      >
        <span>{formatarData(valor)}</span>
        <CalendarDays className="size-4 text-muted-foreground" />
      </button>

      {aberto && (
        <div className="animate-soft-pop absolute right-0 top-12 z-40 w-72 rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => trocarMes(-1)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground active:translate-y-0"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold capitalize text-foreground">{nomeMes}</span>
            <button
              type="button"
              onClick={() => trocarMes(1)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground active:translate-y-0"
              aria-label="Proximo mes"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
            {DIAS_SEMANA.map((dia, indice) => (
              <span key={`${dia}-${indice}`}>{dia}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia, indice) =>
              dia ? (
                <button
                  key={dataParaYYYYMMDD(dia)}
                  type="button"
                  onClick={() => selecionar(dia)}
                  className={
                    "flex aspect-square cursor-pointer items-center justify-center rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground active:translate-y-0 " +
                    (mesmoDia(dia, dataSelecionada)
                      ? "bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground"
                      : mesmoDia(dia, hoje)
                        ? "border border-primary/50 text-primary"
                        : "text-muted-foreground")
                  }
                >
                  {dia.getDate()}
                </button>
              ) : (
                <span key={`vazio-${indice}`} />
              ),
            )}
          </div>

          <button
            type="button"
            onClick={selecionarHoje}
            className="mt-4 w-full cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground hover:shadow-md active:translate-y-0"
          >
            Hoje
          </button>
        </div>
      )}
    </div>
  );
}
