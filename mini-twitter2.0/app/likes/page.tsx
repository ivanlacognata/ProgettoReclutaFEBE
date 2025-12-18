'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/organisms/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { getPosts } from '@/lib/api/posts';
import { getLikes } from '@/lib/api/likes';
import { getUserById } from '@/lib/api/users';
import { UserCircle } from 'lucide-react';
import Link from 'next/link';
import PostCard from '@/components/molecules/PostCard'

type Notification = {
  id: string;           
  postId: string;
  postContent: string;
  likerId: string;
  likerUsername: string;
  createdAt: string;    
};

export default function LikesNotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      setError('');

      try {
        const myPostsRes = await getPosts({ user_id: user.id, limit: 50 });
        const myPosts = myPostsRes?.items ?? [];

        const perPostNotifs = await Promise.all(
          myPosts.map(async (p: any) => {
            try {
              const likesRes = await getLikes(p.id);
              const likes = likesRes?.items ?? [];

              const notifsForPost = await Promise.all(
                likes.map(async (lk: any, idx: number) => {
                  try {
                    const liker = await getUserById(lk.user_id);
                    return {
                      id: lk.id || `like-${p.id}-${idx}`, 
                      postId: p.id,
                      postContent: p.content || '(Post senza contenuto)',
                      likerId: lk.user_id,
                      likerUsername: liker?.username || 'Utente',
                      createdAt: lk.created_at || p.created_at || new Date().toISOString(),
                    } as Notification;
                  } catch {
                    return {
                      id: lk.id || `like-${p.id}-${idx}`,
                      postId: p.id,
                      postContent: p.content || '(Post senza contenuto)',
                      likerId: lk.user_id,
                      likerUsername: 'Utente',
                      createdAt: lk.created_at || p.created_at || new Date().toISOString(),
                    } as Notification;
                  }
                })
              );

              return notifsForPost;
            } catch {
              return [] as Notification[];
            }
          })
        );

        const flat = perPostNotifs.flat();
        flat.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setItems(flat);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Errore nel caricamento delle notifiche.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6 text-center text-gray-400">
          Effettua il login per vedere chi ha messo mi piace ai tuoi post.
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 text-center text-gray-400">Caricamento…</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 text-center text-red-500">{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">I tuoi Mi piace</h1>

        {items.length === 0 ? (
          <p className="text-gray-400 text-center">
            Nessun utente ha ancora messo mi piace ai tuoi post.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((n) => (
  <div
    key={n.id}
    className="flex flex-col gap-3 bg-[#0b1224] rounded-xl p-4 border border-gray-800"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center bg-gray-700 w-10 h-10 rounded-full">
          <span className="text-sm font-bold">@</span>
        </div>
        <div>
          <p className="text-gray-200">
            <span className="font-semibold text-white">@{n.likerUsername}</span>{' '}
            ha messo mi piace al tuo post
          </p>
        </div>
      </div>

      <div className="text-xs text-gray-500 whitespace-nowrap">
        {new Date(n.createdAt).toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>

    <div className="ml-12">
      <PostCard
        id={n.postId}
        userId={user?.id || ''}
        content={n.postContent}
        username={user?.username || 'Tu'}
        createdAt={n.createdAt}
        likesCount={undefined}
        commentCount={undefined}
      />
    </div>
  </div>
))}

          </div>
        )}
      </div>
    </MainLayout>
  );
}
