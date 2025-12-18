'use client';

import { useState } from 'react';
import { Input } from '@/components/atoms/Input';
import Link from 'next/link';
import { loginUser, verifyOtp, getMe } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [tmpToken, setTmpToken] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!requiresOtp) {
        const res = await loginUser({ username, password });

        if (res.requires_otp) {
          setRequiresOtp(true);
          setTmpToken(res.temp_token);
          return;
        }

        localStorage.setItem('token', res.token);

        const userData = await getMe();
        localStorage.setItem('user', JSON.stringify(userData));
        login(userData);

        router.push('/'); 
      } else {
        const res = await verifyOtp({ temp_token: tmpToken, otp_code: otp });
        localStorage.setItem('token', res.token);

        const userData = await getMe();
        localStorage.setItem('user', JSON.stringify(userData));
        login(userData);

        router.push('/');
      }
    } catch (err: any) {
      alert(err.message || 'Errore durante il login');
    }
  };

  return (
    <div className="p-10 border border-gray-800 rounded-xl shadow-2xl bg-[#0f172b] max-w-md mx-auto">
      {!requiresOtp ? (
        <>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Accedi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full"
            >
              Continua
            </button>
          </form>
          <div className="flex justify-center mt-4">
            <span className="text-gray-400">Non hai un account?</span>
            <Link href="/register" className="text-blue-500 underline ml-1">Registrati</Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-center mb-2">Verifica OTP</h2>
          <p className="text-sm text-gray-400 text-center mb-4">
            Inserisci il codice OTP da Google Authenticator
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full"
            >
              Verifica e Accedi
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default LoginForm;
