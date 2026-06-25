"use client";

import "./globals.css";
import "@/styles/themes.css";
import { AuthProvider } from "@/hooks/AuthContext/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { setupAxiosInterceptors } from "@/config/axiosConfig";

setupAxiosInterceptors();

const CLIENT_ID = "921532693870-aj4mm1u6blg21blnq0pmr8p611jce9ja.apps.googleusercontent.com";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}