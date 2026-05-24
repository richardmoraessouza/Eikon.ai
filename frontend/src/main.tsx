import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./hooks/AuthContext/AuthContext.tsx";
import { FavoritesProvider } from "./hooks/FavoritesContext/FavoritesContext.tsx";
import App from "./App";
import NoLayout from "./components/NoLayout/NoLayout.tsx";
import Layout from "./components/Layout/Layout";
import Cadastra from "./components/Cadastra/Cadastra";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Entrar from "./components/Entrar/Entrar.tsx";
import Perfil from "./page/Perfil/Perfil.tsx";
import ProtectedRouter from "./components/BloqueamentoNoLogin/BloqueamentoNoLogin.tsx";
import CriacaoPerson from "./page/CriacaoPerson/CriacaoPerson.tsx";
import PublicRoute from "./components/BloqueamentoLogin/BloqueamentoLogin.tsx";
import OutroPerfil from "./page/OutroPerfil/OutroPerfil.tsx";
import Person_Ficticio from './page/Person_Ficticio/Person_Ficticio.tsx';
import Explorar from "./page/Explorar/Explorar.tsx";
import PersonagemPesquisado from "./page/PersonagemPesquisado/PersonagemPesquisado.tsx";

const CLIENT_ID =  import.meta.env.VITE_GOOGLE_CLIENT_ID || "default_client_id"

const router = createBrowserRouter([
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
            path: "/criacao-person",
            element: <CriacaoPerson />,
          },
          {
            path: "/person-ficticio",
            element: <Person_Ficticio/>,
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
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
