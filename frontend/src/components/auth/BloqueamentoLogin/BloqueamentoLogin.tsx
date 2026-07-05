"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { estaLogado, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e o usuário já estiver logado,
    // redireciona para a página inicial
    if (!loading && estaLogado) {
      router.replace("/");
    }
  }, [estaLogado, loading, router]);

  // Enquanto carrega ou se estiver logado (esperando o redirecionamento),
  // não renderiza nada (ou um spinner/loading)
  if (loading || estaLogado) {
    return null; 
  }

  // Se não estiver logado, renderiza os filhos (as páginas públicas, ex: Login)
  return <>{children}</>;
};

export default PublicRoute;