"use client";

import { useState } from "react";
import { Input } from "@/components/atoms/Input";
import { registerUser, setupOtp } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterForm: React.FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Le password non corrispondono");
      return;
    }

    try {
      const res = await registerUser({ username, email, password });

      if (!res?.token) {
        console.error("❌ Nessun token ricevuto dalla registrazione!");
        alert("Registrazione riuscita, ma token mancante dal server.");
        return;
      }

      localStorage.setItem("token", res.token);

      const otpRes = await setupOtp();

      if (!otpRes?.secret || !otpRes?.otpauth_url) {
        console.error("❌ setupOtp non ha restituito i dati attesi:", otpRes);
        alert("Errore nel recupero del QR Code OTP");
        return;
      }

      // 🔗 Reindirizza alla pagina del QR code
      const otpUrl = `/otp-setup?otpSecret=${encodeURIComponent(
        otpRes.secret
      )}&otpAuthUrl=${encodeURIComponent(otpRes.otpauth_url)}`;

      router.push(otpUrl);
    } catch (err: any) {
      console.error("💥 Errore nel flusso di registrazione:", err); // 👈 LOG 5
      alert(err.message || "Errore durante la registrazione");
    }
  };

  return (
    <div className="p-10 border border-gray-800 rounded-xl shadow-2xl bg-[#0f172b] max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Crea un account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="text-sm text-gray-400">Username</label>
        <Input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="text-sm text-gray-400">Email</label>
        <Input
          type="email"
          placeholder="nome@esempio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="text-sm text-gray-400">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="text-sm text-gray-400">Conferma password</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors"
        >
          Continua
        </button>

        <div className="flex justify-center space-x-1 mt-2">
          <span className="text-gray-400">Hai già un account?</span>
          <Link href="/login" className="text-blue-500 underline">
            Accedi
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
