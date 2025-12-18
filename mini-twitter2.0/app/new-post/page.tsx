'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/organisms/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { createPost } from '@/lib/api/posts'; 

export default function NewPostPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Il contenuto del post non può essere vuoto');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createPost(content);

      router.push('/');
    } catch (err: any) {
      console.error('Errore pubblicazione post:', err);
      setError('Errore durante la pubblicazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Crea un nuovo post</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="w-full p-3 rounded-lg bg-[#0d111c] border border-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Scrivi qui il tuo post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        <p className="text-sm text-gray-500 mt-2">
            Supporta Markdown: **grassetto**, _corsivo_, liste, ecc.
        </p>


          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Pubblicazione...' : 'Pubblica'}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
