"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/");
    } catch (error: any) {
      console.error(error);
      setErro("Email ou senha incorretos.");
    }
  };

  return (
    // AQUI ESTÁ O SEGREDO: bg-navy-dark
    <div className="flex min-h-screen items-center justify-center bg-navy-dark p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-card p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-navy-primary">Ótica Web</h1>
          <p className="text-text-secondary">Acesso Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {erro && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700 text-center">
              {erro}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-navy-primary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-text-primary focus:border-blue-action focus:outline-none focus:ring-1 focus:ring-blue-action"
              placeholder="admin@otica.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-navy-primary">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-text-primary focus:border-blue-action focus:outline-none focus:ring-1 focus:ring-blue-action"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-navy-primary py-3 font-bold text-white transition hover:bg-navy-dark hover:shadow-lg"
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
}