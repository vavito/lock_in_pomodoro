import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/perfil")({
  ssr: false,
  head: () => ({ meta: [{ title: "Perfil - Lock In Pomodoro" }] }),
  component: PerfilPage,
});

function PerfilPage() {
  const { logado, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !logado) router.navigate({ to: "/login" });
  }, [logado, carregando, router]);

  if (carregando || !logado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">Os dados da conta serao editados aqui.</p>
      </div>
    </AppShell>
  );
}
