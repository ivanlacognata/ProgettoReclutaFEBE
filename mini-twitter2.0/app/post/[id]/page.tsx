'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PostCard from '@/components/molecules/PostCard';
import { getPostById } from '@/lib/api/posts';
import { getComments } from '@/lib/api/comments';
import CommentsList from '@/components/organisms/CommentsList';
import NewCommentForm from '@/components/organisms/NewCommentForm';
import { useAuth } from '@/context/AuthContext';


/* =========================
   TIPI
   ========================= */
interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  likes_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
  };
}

export default function PostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams();

  /* =========================
     NORMALIZZA ID POST
     ========================= */
  const postId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* =========================
     BLOCCO SE ID NON VALIDO
     ========================= */
  if (!postId) {
    return (
      <p className="p-4 text-center text-red-500">
        ID post non valido
      </p>
    );
  }

  /* =========================
     LOAD POST + COMMENTI
     ========================= */
  useEffect(() => {
    async function loadPostAndComments() {
      try {
        setLoading(true);
        setError('');

        /* ---------- POST ---------- */
        const postData = await getPostById(postId);

        const normalizedPost: Post = {
          id: postData.id,
          content: postData.content,
          created_at: postData.created_at,
          user_id: postData.user_id || postData.users?.id,
          username: postData.username || postData.users?.username || 'Utente',
          likes_count: postData.likes_count ?? 0,
        };

        setPost(normalizedPost);

        /* ---------- COMMENTI ---------- */
const commentsData = await getComments({ post_id: postId });

const normalizedComments = (commentsData.items || []).map((c: any) => ({
  id: c.id,
  content: c.content,
  created_at: c.created_at,
  user: {
    id: c.users.id,
    username: c.users.username,
  },
}));

setComments(normalizedComments);




      } catch (err: any) {
        console.error('Errore caricando post o commenti:', err);
        setError(err.message || 'Errore nel caricamento del post');
      } finally {
        setLoading(false);
      }
    }

    loadPostAndComments();
  }, [postId]);

  /* =========================
     STATI UI
     ========================= */
  if (loading)
    return (
      <p className="p-4 text-center text-gray-400">
        Caricamento post...
      </p>
    );

  if (error)
    return (
      <p className="p-4 text-center text-red-500">
        {error}
      </p>
    );

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="min-h-screen bg-[#020618] text-white">
      {/* HEADER */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="mr-4 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {/* POST */}
      {post && (
        <PostCard
          id={post.id}
          userId={post.user_id}
          content={post.content}
          username={post.username}
          createdAt={post.created_at}
          likesCount={post.likes_count ?? 0}
          commentCount={comments.length}
        />
      )}

      {/* NUOVO COMMENTO */}
      <NewCommentForm
  postId={postId}
  onNewComment={(newComment) =>
    setComments((prev) => [
      {
        id: newComment.id,
        content: newComment.content,
        created_at: newComment.created_at,
        user: {
          id: user!.id,                 
          username: user!.username,    
        },
      },
      ...prev,
    ])
  }
/>


      {/* LISTA COMMENTI */}
      <div className="mt-4">
        <CommentsList comments={comments} />
      </div>
    </div>
  );
}
