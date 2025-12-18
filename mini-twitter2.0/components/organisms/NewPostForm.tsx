'use client';

import React, { useState } from 'react';
import { createPost } from '@/lib/api/posts';
import { useAuth } from '@/context/AuthContext';

interface NewPostFormProps {
  addPost: (post: any) => void;
}

const NewPostForm: React.FC<NewPostFormProps> = ({ addPost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const isDisabled = !user || content.trim() === '';
  const buttonClass = isDisabled
    ? 'bg-blue-300 cursor-not-allowed'
    : 'bg-blue-500 hover:bg-blue-600 transition-colors';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || content.trim() === '') return;

    try {
      const newPost = await createPost(content);
      addPost(newPost);
      setContent('');
    } catch (err: any) {
      console.error('Errore invio post:', err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex-shrink-0" />

        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cosa sta succedendo?"
            rows={2}
            className="w-full bg-black text-white text-xl resize-none focus:outline-none placeholder-gray-500"
          />
          <div className="flex justify-end pt-2 border-t border-gray-800">
            <button
              type="submit"
              disabled={isDisabled}
              className={`text-white font-bold py-2 px-4 rounded-full ${buttonClass}`}
            >
              Posta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostForm;
