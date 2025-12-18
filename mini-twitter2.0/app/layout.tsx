'use client';

import './globals.css';
import { Sidebar } from '@/components/organisms/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import React from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="it">
      <body className="bg-[#020618] text-white flex min-h-screen">
        <AuthProvider>
          {/* CONTAINER PRINCIPALE */}
          <div className="flex w-full max-w-6xl mx-auto pl-24 pr-10">
            {/* SIDEBAR */}
            <aside className="hidden md:block w-60 mr-12 border-r border-gray-800 pr-6">
              <Sidebar />
            </aside>

            {/* FEED */}
            <main className="flex-1 max-w-3xl mx-auto">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
