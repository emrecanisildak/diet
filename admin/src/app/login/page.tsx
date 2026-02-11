"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { UtensilsCrossed, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      await refetch();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giris basarisiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 animate-fade-in">
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-xl shadow-green-600/30">
            <UtensilsCrossed size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">DietApp</h1>
          <p className="text-gray-600 mt-1 font-medium">Diyetisyen Yonetim Paneli</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Giris Yap</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <Input
              label="E-posta Adresi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Sifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sifrenizi girin"
              icon={<Lock size={18} />}
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              Giris Yap
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          DietApp v1.0 - Diyetisyen Yonetim Sistemi
        </p>
      </div>
    </div>
  );
}
