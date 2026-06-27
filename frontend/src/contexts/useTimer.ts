import { useContext } from "react";
import { TimerContext } from "@/contexts/timer-contexto";

export function useTimer() {
  const contexto = useContext(TimerContext);
  if (!contexto) {
    throw new Error("useTimer deve ser usado dentro de TimerProvider.");
  }
  return contexto;
}
