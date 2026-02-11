import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DietApp - Diyetisyen Paneli",
  description: "Diyetisyen yonetim paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
