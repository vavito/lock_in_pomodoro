import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  carregando?: boolean;
  textoCarregando: string;
  children: ReactNode;
};

export function BotaoFormulario({
  carregando = false,
  textoCarregando,
  children,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || carregando}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold tracking-widest text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {carregando ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>{textoCarregando}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
