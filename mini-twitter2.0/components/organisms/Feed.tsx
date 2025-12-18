'use client';

import React, { useEffect, useState } from 'react';
import PostCard from '@/components/molecules/PostCard';
import { getPosts } from '@/lib/api/posts';
import { getComments } from '@/lib/api/comments';
import { getLikes } from '@/lib/api/likes';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadFeed = async () => {
      try {
        setLoading(true);

        const res = await getPosts({ page: 1, limit: 20 });

            const list = res.items ?? [];

        const enriched = await Promise.all(
          list.map(async (post: any) => {
            const [likes, comments] = await Promise.all([
              getLikes(post.id),
              getComments({ post_id: post.id }),
            ]);

            return {
              ...post,
              likes_count: likes ?? 0,
              comment_count: comments?.total ?? 0,
            };
          })
        );

        if (alive) setPosts(enriched);
      } catch (e: any) {
        console.error('Errore feed:', e);
        if (alive) setError(e.message || 'Errore caricamento feed');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadFeed();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <p className="text-center p-4 text-gray-400">Caricamento post…</p>;
  }

  if (error) {
    return <p className="text-center p-4 text-red-500">{error}</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center p-4 text-gray-400">Nessun post disponibile.</p>;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          userId={post.user_id}
          content={post.content}
          username={post.users?.username || post.username || 'Utente'}
          createdAt={post.created_at}
          likesCount={post.likes_count}
          commentCount={post.comment_count}
        />
      ))}
    </div>
  );
};

export default Feed;
