"use client";

import "./globals.css";
import "@/styles/themes.css";
import { AuthProvider } from "@/contexts/AuthContext/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { setupAxiosInterceptors } from "@/config/axiosConfig";

setupAxiosInterceptors();

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}