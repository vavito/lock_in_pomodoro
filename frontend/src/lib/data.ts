export function hojeYYYYMMDD(): string {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function dataParaYYYYMMDD(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function formatarMMSS(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatarTempoMinutos(minutos: number): string {
  const minutosValidos = Number.isFinite(minutos) && minutos > 0 ? Math.floor(minutos) : 0;
  const h = Math.floor(minutosValidos / 60);
  const m = minutosValidos % 60;
  if (h === 0 && m === 0) return "0h 0min";
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
