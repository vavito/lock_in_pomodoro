type Props = {
  texto?: string;
};

export function CarregandoPagina({ texto = "Carregando" }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-muted-foreground">
      <div className="animate-page-enter flex flex-col items-center gap-4">
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full border border-primary/25" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-3 rounded-full bg-primary/20" />
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span>{texto}</span>
          <span className="loading-dot">.</span>
          <span className="loading-dot delay-100">.</span>
          <span className="loading-dot delay-200">.</span>
        </div>
      </div>
    </div>
  );
}
