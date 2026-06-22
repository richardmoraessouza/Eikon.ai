import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import Profile from "./page/profile/Profile.tsx";
import ProtectedRouter from "./components/BloqueamentoNoLogin/BloqueamentoNoLogin.tsx";
import PublicRoute from "./components/BloqueamentoLogin/BloqueamentoLogin.tsx";
import UserProfile from "./page/UserProfile/UserProfile.tsx";
import Explorar from "./page/Explorar/Explorar.tsx";
import SearchResults from "./page/SearchResults/SearchResults.tsx";
import CreateCharacter from "./page/CreateCharacter/CreateCharacter.tsx";
import TermsPage from "./page/TermsPage/TermsPage.tsx";
import PrivacyPage from "./page/PrivacyPage/PrivacyPage.tsx";
import SafetyPage from "./page/SafetyPage/SafetyPage.tsx";
import AboutPage from "./page/AboutPage/AboutPage.tsx";
import HelpCenter from "./page/HelpCenter/HelpCenter.tsx";
import Feedback from "./page/Feedback/Feedback.tsx";

setupAxiosInterceptors();

const CLIENT_ID = "468506770340-qbj9keh8dkeu2467qtq207ob1to3esog.apps.googleusercontent.com";

const router = createBrowserRouter([
  // 1. ROTAS COM LAYOUT (Menu, Barra Lateral e Footer)
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Explorar />,
      },
      {
        path: "explorar", 
        element: <Explorar />,
      },
      {
        path: "procurar",
        element: <SearchResults />,
      },
      {
        element: <ProtectedRouter />,
        children: [
          {
            path: "perfil/:usuario_id",
            element: <Profile />,
          },
          {
            path: "create-character",
            element: <CreateCharacter />,
          },
          {
            path: "OutroPerfil/:id",
            element: <UserProfile />,
          },
        ],
      },
    ],
  },
  
  // 2. ROTAS TELA CHEIA (Sem Menu, Sem Botão Voltar e Sem Footer)
  {
    element: <NoLayout />,
    children: [
      {
        path: "personagem/:id",
        element: <App />,
      },
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
      {
        path: "safety",
        element: <SafetyPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "help",
        element: <HelpCenter />,
      },
      {
        path: "feedback",
        element: <Feedback />,
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: "cadastra",
            element: <Cadastra />,
          },
          {
            path: "entrar",
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