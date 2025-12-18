'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/organisms/MainLayout';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { getUserById } from '@/lib/api/users';
import { getPosts } from '@/lib/api/posts';
import { getCommentsByUser } from '@/lib/api/comments';
import { getLikesByUser } from '@/lib/api/likes';

import PostCard from '@/components/molecules/PostCard';
import { FileText, MessageCircle, Heart } from 'lucide-react';

type Tab = 'posts' | 'comments' | 'likes';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  const paramId = params?.id;
const rawId =
  typeof paramId === 'string'
    ? paramId
    : Array.isArray(paramId)
    ? paramId[0]
    : '';


  const isMeRoute = rawId === 'me';

  // ID effettivo del profilo: se /me usa user.id
  const profileId = useMemo(() => {
    if (!rawId) return '';
    if (isMeRoute) return user?.id ?? '';
    return rawId;
  }, [rawId, isMeRoute, user?.id]);

  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // se /profile/me e user NON è pronto, aspetta 
  useEffect(() => {
    if (!isMeRoute) return;

    // se dopo un attimo user è ancora null → allora sì, vai a login
    const t = setTimeout(() => {
      if (!user) router.push('/login');
    }, 250);

    return () => clearTimeout(t);
  }, [isMeRoute, user, router]);

  // carica dati solo quando ho un profileId valido
  useEffect(() => {
    async function load() {
      if (!profileId) return;

      try {
        setLoading(true);
        setError('');

        // 1) profilo
        const u = await getUserById(profileId);
        setProfile(u);

        // 2) post di quell’utente (IMPORTANTE: deve filtrare davvero)
        const postsRes = await getPosts({ user_id: profileId, limit: 50, offset: 0 });
        setPosts(postsRes?.items ?? []);

        // 3) SOLO sul mio profilo carico tab extra
        if (isMeRoute) {
          const cRes = await getCommentsByUser(profileId);
          setComments(cRes?.items ?? []);

          const lRes = await getLikesByUser(profileId);

          // normalizza
          const liked = (lRes?.items ?? [])
            .map((x: any) => x.post || x.posts || x)
            .filter(Boolean);

          setLikedPosts(liked);
        } else {
          setComments([]);
          setLikedPosts([]);
        }
      } catch (e: any) {
  console.error('[ProfilePage] load error RAW:', e);
  console.error('[ProfilePage] typeof error:', typeof e);
  console.error('[ProfilePage] keys:', e && Object.keys(e));

  setError(
    e?.message ||
    e?.body?.error ||
    'Errore caricando profilo'
  );

  setProfile(null);
}
 finally {
        setLoading(false);
      }
    }

    load();
  }, [profileId, isMeRoute]);

  if (loading) {
    return (
      <MainLayout>
        <p className="p-6 text-center text-gray-400">Caricamento profilo…</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="p-6 text-center text-red-500">{error}</p>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <p className="p-6 text-center text-red-500">Profilo non trovato.</p>
      </MainLayout>
    );
  }

  const renderTab = () => {
    if (!isMeRoute) {
      // profilo altri => SOLO post
      return posts.length ? (
        posts.map((p) => (
          <PostCard
            key={p.id}
            id={p.id}
            userId={p.user_id}
            content={p.content}
            username={p.users?.username || profile.username}
            createdAt={p.created_at}
            likesCount={p.likes_count ?? 0}
            commentCount={p.comment_count ?? 0}
          />
        ))
      ) : (
        <p className="text-gray-400">Nessun post pubblicato.</p>
      );
    }

    // mio profilo => tab
    switch (activeTab) {
      case 'posts':
        return posts.length ? (
          posts.map((p) => (
            <PostCard
              key={p.id}
              id={p.id}
              userId={p.user_id}
              content={p.content}
              username={profile.username}
              createdAt={p.created_at}
              likesCount={p.likes_count ?? 0}
              commentCount={p.comment_count ?? 0}
            />
          ))
        ) : (
          <p className="text-gray-400">Non hai ancora pubblicato post.</p>
        );

      case 'comments':
        return comments.length ? (
          comments.map((c: any) => (
            <div key={c.id} className="border-b border-gray-800 p-4">
              <p className="text-gray-300">{c.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(c.created_at).toLocaleString('it-IT')}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Non hai ancora scritto commenti.</p>
        );

      case 'likes':
        return likedPosts.length ? (
          likedPosts.map((p: any) => (
            <PostCard
              key={p.id}
              id={p.id}
              userId={p.user_id}
              content={p.content}
              username={p.users?.username || 'Utente'}
              createdAt={p.created_at}
              likesCount={p.likes_count ?? 0}
              commentCount={p.comment_count ?? 0}
            />
          ))
        ) : (
          <p className="text-gray-400">Non hai ancora messo Mi piace.</p>
        );
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-[#0b1224] p-6 rounded-2xl border border-gray-800 mb-8">
          <h1 className="text-2xl font-bold mb-1">@{profile.username}</h1>
          <p className="text-gray-400 mb-2">{profile.email}</p>

          <p className="text-gray-400 mb-3">
            Si è unito{' '}
            {profile.created_at
              ? new Date(profile.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
              : '—'}
          </p>

          <p className="text-gray-300 mb-4">{profile.bio || 'Nessuna bio aggiunta.'}</p>

          {/* BOTTONI SOLO SU /profile/me */}
          {isMeRoute && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push(`/profile/${profile.id}/edit`)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Modifica profilo
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* TAB SOLO SU /profile/me */}
        {isMeRoute && (
          <div className="flex justify-around border-b border-gray-800 mb-6">
            <button
              className={`pb-2 font-medium ${activeTab === 'posts' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('posts')}
            >
              <FileText className="inline mr-1" size={16} />
              Post ({posts.length})
            </button>

            <button
              className={`pb-2 font-medium ${activeTab === 'comments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageCircle className="inline mr-1" size={16} />
              Commenti ({comments.length})
            </button>

            <button
              className={`pb-2 font-medium ${activeTab === 'likes' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('likes')}
            >
              <Heart className="inline mr-1" size={16} />
              Mi piace ({likedPosts.length})
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">{renderTab()}</div>
      </div>
    </MainLayout>
  );
}
