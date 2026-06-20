import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Timer } from "@/components/Timer";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lock In Pomodoro" },
      {
        name: "description",
        content: "Temporizador Pomodoro com resumo diário e estatísticas.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { logado, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !logado) {
      router.navigate({ to: "/login" });
    }
  }, [carregando, logado, router]);

  if (carregando || !logado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <AppShell>
      <Timer />
    </AppShell>
  );
}
