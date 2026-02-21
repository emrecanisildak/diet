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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-4 relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-2xl mb-5 shadow-2xl shadow-violet-500/40">
            <UtensilsCrossed size={36} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Nutrivaldi</h1>
          <p className="text-violet-300 mt-2 font-medium">Diyetisyen Yonetim Paneli</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 border border-white/20 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Giris Yap</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/20 text-rose-200 p-3 rounded-xl text-sm border border-rose-400/30">
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
              dark
            />

            <Input
              label="Sifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sifrenizi girin"
              icon={<Lock size={18} />}
              required
              dark
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              variant="gradient"
            >
              Giris Yap
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-violet-400 mt-6 font-medium">
          Nutrivaldi v1.0 - Diyetisyen Yonetim Sistemi
        </p>
      </div>
    </div>
  );
}
