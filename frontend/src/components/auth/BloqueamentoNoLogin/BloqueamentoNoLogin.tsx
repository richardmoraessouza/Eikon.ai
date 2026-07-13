"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { estaLogado, loading } = useAuth(); // Se tiver 'loading' no seu contexto, use aqui também
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento terminou e o usuário NÃO está logado,
    // manda ele para a tela de login
    if (!loading && !estaLogado) {
      router.replace("/login");
    }
  }, [estaLogado, loading, router]);

  // Enquanto verifica o login ou se não estiver logado, não renderiza o conteúdo privado
  if (loading || !estaLogado) {
    return null; // Ou um <LoadingSpinner />
  }

  // Se estiver logado, renderiza a página protegida
  return <>{children}</>;
};

export default ProtectedRoute;