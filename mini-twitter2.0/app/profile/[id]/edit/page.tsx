'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateUser } from '@/lib/api/users';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/organisms/MainLayout';

export default function EditProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // BLOCCO SE NON LOGGATO
  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
    }
  }, [user, router]);

  // CARICA PROFILO 
  useEffect(() => {
    if (!user?.id) return;

    const loadUser = async () => {
      try {
        const data = await getUserById(user.id); 
        setUsername(data.username ?? '');
        setBio(data.bio ?? '');
      } catch (err: any) {
        console.error(err);
        setError('Errore nel caricamento del profilo');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setError('');

    try {
      const res = await updateUser(user.id, { username, bio });

// AGGIORNA AUTH CONTEXT
login({
  ...user,
  username: res.user.username,
});

// redirect
router.push('/profile/me');

    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="p-4 text-center text-gray-400">Caricamento profilo...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Modifica profilo
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1324] border border-gray-800 p-6 rounded-xl space-y-4"
        >
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-[#0b0f1d] border border-gray-700 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full p-3 bg-[#0b0f1d] border border-gray-700 rounded-md text-white"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md"
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/profile/me')}
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-md"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
