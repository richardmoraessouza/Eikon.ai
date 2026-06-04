import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import "./styles/themes.css";
import { AuthProvider } from "./hooks/AuthContext/AuthContext.tsx";
import { setupAxiosInterceptors } from "./config/axiosConfig.ts";
import App from "./App";
import NoLayout from "./components/NoLayout/NoLayout.tsx";
import Layout from "./components/Layout/Layout";
import Cadastra from "./components/Cadastra/Cadastra";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Entrar from "./components/Entrar/Entrar.tsx";
import Perfil from "./page/Perfil/Perfil.tsx";
import ProtectedRouter from "./components/BloqueamentoNoLogin/BloqueamentoNoLogin.tsx";
import PublicRoute from "./components/BloqueamentoLogin/BloqueamentoLogin.tsx";
import OutroPerfil from "./page/OutroPerfil/OutroPerfil.tsx";
import Explorar from "./page/Explorar/Explorar.tsx";
import PersonagemPesquisado from "./page/PersonagemPesquisado/PersonagemPesquisado.tsx";
import CreateCharacter from "./page/CreateCharacter/CreateCharacter.tsx";

// Configura interceptadores globais do axios
setupAxiosInterceptors();

const CLIENT_ID =  "468506770340-qbj9keh8dkeu2467qtq207ob1to3esog.apps.googleusercontent.com";

const router = createBrowserRouter([
  // Rota raiz redireciona para /explorar
  // {
  //   path: "/",
  //   element: <Navigate to="/explorar" replace />,
  // },
  // Rotas com layout principal
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        element: <ProtectedRouter />,
        children: [
          {
            path: "/perfil/:usuario_id",
            element: <Perfil />,
          },
          {
            path: "/create-character",
            element: <CreateCharacter />,
          },
          {
            path: "/OutroPerfil/:id",
            element: <OutroPerfil />,
          },
        ],
      },
      {
         path: "/explorar",
         element: <Explorar />,
      },
      {
        path: "/procurar",
        element: <PersonagemPesquisado />,
      }
    ],
  },
  
  // Rotas sem layout (públicas)
  {
    element: <NoLayout />,
    children: [
      {
        path: `/personagem/:id`,
        element: <App />,
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/cadastra",
            element: <Cadastra />,
          },
          {
            path: "/entrar",
            element: <Entrar />,
          },
        ],
      },
    ],
  },
]);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
