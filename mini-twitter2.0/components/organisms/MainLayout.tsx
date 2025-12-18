'use client';

import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#020618] text-white grid grid-cols-[240px_minmax(0,680px)_1fr]">
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-[680px] px-4">
          {children}
        </div>
      </main>

      <div />
    </div>
  );
}
