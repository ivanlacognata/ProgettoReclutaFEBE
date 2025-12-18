'use client';
import { useState } from 'react';
import { createComment } from '@/lib/api/comments';
import { useAuth } from '@/context/AuthContext';

interface NewCommentFormProps {
  postId: string;
  onNewComment: (comment: any) => void;
}

export default function NewCommentForm({ postId, onNewComment }: NewCommentFormProps) {
  const [content, setContent] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postId) {
      alert('Errore: ID del post mancante.');
      return;
    }

    if (!content.trim()) {
      alert('Scrivi qualcosa prima di commentare!');
      return;
    }

    try {
      const res = await createComment(postId, content);
      onNewComment(res.comment);

      setContent('');
    } catch (err: any) {
      console.error('Errore durante la creazione del commento:', err);
      alert(err.message || 'Errore durante la creazione del commento');
    }
  };

  if (!user) {
    return <p className="p-4 text-gray-400">Effettua il login per commentare.</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-800 flex gap-3"
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Scrivi un commento..."
        className="flex-1 bg-gray-900 text-white p-2 rounded-lg outline-none"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold"
      >
        Commenta
      </button>
    </form>
  );
}
