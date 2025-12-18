'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Pencil, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useAuth } from '@/context/AuthContext';
import { updateComment, deleteComment } from '@/lib/api/comments';

interface Comment {
  id?: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    username?: string;
  };
}

interface CommentsListProps {
  comments: Comment[];
}

export default function CommentsList({ comments }: CommentsListProps) {
  const { user } = useAuth();

  // like locale 
  const [likedComments, setLikedComments] = useState<string[]>([]);

  // edit inline per commento
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const savedLikes = localStorage.getItem('likedComments');
    if (savedLikes) setLikedComments(JSON.parse(savedLikes));
  }, []);

  useEffect(() => {
    localStorage.setItem('likedComments', JSON.stringify(likedComments));
  }, [likedComments]);

  const toggleLike = (commentId?: string) => {
    if (!user) {
      alert('Devi essere loggato per mettere mi piace ai commenti!');
      return;
    }
    if (!commentId) return;

    setLikedComments((prev) =>
      prev.includes(commentId) ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
  };

  const startEdit = (c: Comment) => {
    if (!c.id) return;
    setEditingId(c.id);
    setEditText(c.content ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const next = (editText || '').trim();
    if (!next) return;

    setSaving(true);
    try {
      await updateComment(editingId, { content: next });
      setEditingId(null);
      setEditText('');
      window.location.reload();
    } catch (err) {
      console.error('[CommentsList] errore updateComment:', err);
      alert('Errore durante il salvataggio del commento');
    } finally {
      setSaving(false);
    }
  };

  const removeComment = async (id: string) => {
    const ok = confirm('Vuoi eliminare questo commento?');
    if (!ok) return;

    setDeletingId(id);
    try {
      await deleteComment(id);
      window.location.reload();
    } catch (err) {
      console.error('[CommentsList] errore deleteComment:', err);
      alert('Errore durante l’eliminazione del commento');
    } finally {
      setDeletingId(null);
    }
  };

  if (!comments || comments.length === 0) {
    return <p className="text-gray-400 p-4">Nessun commento disponibile.</p>;
  }

  return (
    <div className="divide-y divide-gray-800">
      {comments.map((comment, index) => {
        const isLiked = comment.id ? likedComments.includes(comment.id) : false;

        const isMine = useMemo(() => {
          return Boolean(
            user?.id && comment?.user?.id && String(user.id) === String(comment.user.id)
          );
        }, [user?.id, comment?.user?.id]);

        const profileHref = isMine ? '/profile/me' : `/profile/${comment.user?.id || ''}`;

        const isEditing = Boolean(comment.id && editingId === comment.id);

        return (
          <div key={comment.id ?? `temp-comment-${index}`} className="p-4 flex flex-col">
            {/* USER + AZIONI */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Link href={profileHref} className="font-semibold text-white hover:underline">
                  @{comment.user?.username || 'Utente'}
                </Link>

                {isMine && !isEditing && comment.id && (
                  <>
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-gray-400 hover:text-blue-400"
                      title="Modifica"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => removeComment(comment.id!)}
                      className="text-gray-400 hover:text-red-400"
                      title="Elimina"
                      disabled={deletingId === comment.id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString('it-IT')}
              </span>
            </div>

            {/* CONTENT */}
            {isEditing ? (
              <div className="space-y-2 mb-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-[#0b0f1d] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="text-green-400 hover:text-green-500"
                    title="Salva"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-400 hover:text-red-500"
                    title="Annulla"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-300 mb-2 prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {comment.content}
                </ReactMarkdown>
              </div>
            )}

            {/* LIKE (locale) */}
            <button
              onClick={() => toggleLike(comment.id)}
              disabled={!comment.id}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{isLiked ? '1' : '0'}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
