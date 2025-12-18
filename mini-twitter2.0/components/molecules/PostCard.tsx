'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Pencil, Trash2, Check, X } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useAuth } from '@/context/AuthContext';
import { createLike, deleteLike, getMyLike } from '@/lib/api/likes';
import { updatePost, deletePost } from '@/lib/api/posts';

interface PostCardProps {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  commentCount?: number;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  userId,
  username,
  content,
  createdAt,
  likesCount = 0,
  commentCount = 0,
}) => {
  const { user } = useAuth();

  const isMine = useMemo(() => {
    return Boolean(user?.id && userId && String(user.id) === String(userId));
  }, [user?.id, userId]);

  // username click: se è mio profilo → /profile/me
  const profileHref = isMine ? '/profile/me' : `/profile/${userId}`;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCountState, setLikesCountState] = useState<number>(likesCount);
  const [loadingLike, setLoadingLike] = useState(false);

  // edit inline
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // sync contatore e contenuto quando arriva dal feed
  useEffect(() => {
    setLikesCountState(likesCount ?? 0);
  }, [likesCount]);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // carica stato like
  useEffect(() => {
    if (!user || !id) return;

    let cancelled = false;

    const loadLikeState = async () => {
      try {
        const liked = await getMyLike(id);
        if (!cancelled) setIsLiked(Boolean(liked));
      } catch (err) {
        console.error('[PostCard] errore stato like:', err);
      }
    };

    loadLikeState();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  // toggle like
  const handleLike = async () => {
    if (!user || loadingLike) return;

    setLoadingLike(true);
    try {
      if (isLiked) {
        await deleteLike(id);
        setIsLiked(false);
        setLikesCountState((c) => Math.max(0, c - 1));
      } else {
        await createLike(id);
        setIsLiked(true);
        setLikesCountState((c) => c + 1);
      }
    } catch (err) {
      console.error('[PostCard] errore like:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  // salva modifica post
  const handleSaveEdit = async () => {
    if (!isMine || savingEdit) return;
    const next = (editContent || '').trim();
    if (!next) return;

    setSavingEdit(true);
    try {
      await updatePost(id, { content: next });
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error('[PostCard] errore updatePost:', err);
      alert('Errore durante il salvataggio del post');
    } finally {
      setSavingEdit(false);
    }
  };

  // elimina post
  const handleDeletePost = async () => {
    if (!isMine || deleting) return;

    const ok = confirm('Vuoi eliminare questo post?');
    if (!ok) return;

    setDeleting(true);
    try {
      await deletePost(id);
      window.location.reload();
    } catch (err) {
      console.error('[PostCard] errore deletePost:', err);
      alert('Errore durante l’eliminazione del post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[#0b1224] p-4 rounded-xl border border-gray-800">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <Link href={profileHref} className="font-semibold text-white hover:underline">
            @{username}
          </Link>
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleString('it-IT')}
          </span>
        </div>

        {/* AZIONI POST (solo se mio) */}
        {isMine && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-400"
              title="Modifica"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDeletePost}
              className="text-gray-400 hover:text-red-400"
              title="Elimina"
              disabled={deleting}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* CONTENUTO */}
      {isEditing ? (
        <div className="space-y-2 mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="w-full p-3 bg-[#0b0f1d] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="text-green-400 hover:text-green-500"
              title="Salva"
            >
              <Check size={18} />
            </button>

            <button
              onClick={() => {
                setEditContent(content);
                setIsEditing(false);
              }}
              className="text-red-400 hover:text-red-500"
              title="Annulla"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-200 mb-4 prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}

      {/* AZIONI */}
      <div className="flex items-center gap-6 text-gray-400">
        {/* LIKE */}
        <button
          onClick={handleLike}
          disabled={!user || loadingLike}
          className={`flex items-center gap-1 transition-colors ${
            isLiked ? 'text-red-500' : 'hover:text-red-400'
          }`}
        >
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
          <span>{likesCountState}</span>
        </button>

        {/* COMMENTI */}
        <Link
          href={`/post/${id}`}
          className="flex items-center gap-1 hover:text-blue-400 transition-colors"
        >
          <MessageCircle size={18} />
          <span>{commentCount}</span>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
