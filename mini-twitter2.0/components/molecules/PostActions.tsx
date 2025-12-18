'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createLike, deleteLike, getLikes } from '@/lib/api/likes';
import { useAuth } from '@/context/AuthContext';

interface PostActionsProps {
  postId: string;
}

const PostActions: React.FC<PostActionsProps> = ({ postId }) => {
  const { user } = useAuth();
  const router = useRouter();

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    async function fetchLikes() {
      try {
        const data = await getLikes({ post_id: postId });
        setLikesCount(data.count || 0);

        if (user && data.items?.some((like: any) => like.user_id === user.id)) {
          setHasLiked(true);
        } else {
          setHasLiked(false);
        }
      } catch (err) {
        console.error('Errore caricando i like:', err);
      }
    }

    fetchLikes();
  }, [postId, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); 

    if (!user) {
      alert('Devi essere loggato per mettere like.');
      return;
    }

    try {
      if (hasLiked) {
        await deleteLike(postId);
        setLikesCount((prev) => prev - 1);
      } else {
        await createLike(postId);
        setLikesCount((prev) => prev + 1);
      }

      setHasLiked((prev) => !prev);
    } catch (err) {
      console.error('Errore nel like:', err);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    router.push(`/post/${postId}`); 
  };

  return (
    <div className="flex items-center space-x-6 mt-3 text-gray-400">
      {/* Pulsante Like */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 transition-colors ${
          hasLiked ? 'text-red-500' : 'hover:text-red-400'
        }`}
      >
        <Heart
          size={18}
          className={hasLiked ? 'fill-red-500 text-red-500' : ''}
        />
        <span>{likesCount}</span>
      </button>

      {/* Pulsante Commenti */}
      <button
        onClick={handleCommentClick}
        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
      >
        <MessageCircle size={18} />
        <span>Commenti</span>
      </button>
    </div>
  );
};

export default PostActions;
