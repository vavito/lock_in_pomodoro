import { Minus, Plus } from "lucide-react";

type Props = {
  rotulo: string;
  valor: string;
  min: number;
  max: number;
  erro?: string;
  onChange: (valor: string) => void;
};

export function CampoNumero({ rotulo, valor, min, max, erro, onChange }: Props) {
  const alterar = (novoValor: string) => {
    if (/^\d*$/.test(novoValor)) onChange(novoValor);
  };

  const somar = (quantidade: number) => {
    const atual = valor.trim() === "" ? min : Number(valor);
    const proximo = Math.max(min, Math.min(max, atual + quantidade));
    onChange(String(proximo));
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{rotulo}</span>
      <div
        className={
          "grid h-11 grid-cols-[2.75rem_1fr_2.75rem] overflow-hidden rounded-lg border bg-background transition-shadow focus-within:ring-2 " +
          (erro
            ? "border-destructive focus-within:ring-destructive"
            : "border-border focus-within:ring-primary")
        }
      >
        <button
          type="button"
          onClick={() => somar(-1)}
          className="flex cursor-pointer items-center justify-center border-r border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={`Diminuir ${rotulo}`}
        >
          <Minus className="size-4" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={valor}
          onChange={(e) => alterar(e.target.value)}
          aria-invalid={!!erro}
          className="min-w-0 bg-transparent px-3 text-center text-base font-medium text-foreground outline-none sm:text-sm"
        />
        <button
          type="button"
          onClick={() => somar(1)}
          className="flex cursor-pointer items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={`Aumentar ${rotulo}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
      {erro && <span className="text-xs text-destructive">{erro}</span>}
    </label>
  );
}
