"use client";

import "./globals.css";
import "@/styles/themes.css";
import { AuthProvider } from "@/contexts/AuthContext/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { setupAxiosInterceptors } from "@/config/axiosConfig";

setupAxiosInterceptors();

const CLIENT_ID: string =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
if (!CLIENT_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_ID environment variable. Google OAuth cannot be initialized."
  );
}

console.log("Google OAuth Client ID:", CLIENT_ID);

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