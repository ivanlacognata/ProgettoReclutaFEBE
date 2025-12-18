'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/organisms/MainLayout';
import Feed from '@/components/organisms/Feed';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const title = user ? 'Il tuo Feed' : 'Discover';

  return (
    <MainLayout>
      {/* HEADER */}
      <div
        className="
          sticky top-0 z-20 
          backdrop-blur-sm bg-[#020618]/80
          border-b border-gray-800
          w-full
        "
      >
        <div className="px-6 py-3">
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </div>

      {/* FEED */}
      <div className="w-full">
        <Feed />
      </div>
    </MainLayout>
  );
}
