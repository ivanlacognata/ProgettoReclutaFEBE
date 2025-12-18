
'use client'; 

import LoginForm from '@/components/organisms/LoginForm';
import { Sidebar } from '@/components/organisms/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]); 

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#020618]"> 
      <div className="flex-1 flex items-center justify-center bg-[#020618]"> 
        <LoginForm />
      </div>

    </div>
  );
}