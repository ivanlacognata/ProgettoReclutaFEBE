'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Home, Heart, User, Plus, LogOut } from 'lucide-react';
import SidebarItem from '@/components/molecules/SidebarItem';

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="p-4 flex flex-col h-full sticky top-0 text-white w-60 items-end pr-6">
      {/* TITOLO */}
      <div className="p-3 mb-6 text-3xl font-black text-white text-right w-full">
        Mini Twitter
      </div>

      {/* UTENTE LOGGATO */}
      {user && (
        <div className="text-right mb-8 w-full">
          <p className="text-lg font-semibold">@{user.username}</p>
          <p className="text-gray-400 text-xs">{user.email}</p>
        </div>
      )}

      {/* LINK PRINCIPALI */}
      <ul className="space-y-2 w-full flex flex-col items-end">
        {/* SE NON LOGGATO */}
        {!user && (
          <>
            <SidebarItem
              href="/register"
              label="Crea Account"
              bgColor="bg-blue-500"
              hoverColor="hover:bg-blue-600"
            />
            <SidebarItem
              href="/login"
              label="Accedi"
              bgColor="bg-slate-950"
              hoverColor="hover:bg-slate-900"
            />
          </>
        )}

        {/* SE LOGGATO */}
        {user && (
          <>
            {/* HOME */}
            <li className="w-full flex justify-end">
              <Link
                href="/"
                className={`flex items-center justify-center gap-3 p-3 rounded-lg transition-colors w-full text-center
                  ${isActive('/') ? 'bg-[#1d2a44] text-blue-400' : 'hover:bg-gray-800'}`}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
            </li>

            {/* LIKES */}
            <li className="w-full flex justify-end">
              <Link
                href="/likes"
                className={`flex items-center justify-center gap-3 p-3 rounded-lg transition-colors w-full text-center
                  ${isActive('/likes') ? 'bg-[#1d2a44] text-blue-400' : 'hover:bg-gray-800'}`}
              >
                <Heart size={20} />
                <span>Likes</span>
              </Link>
            </li>

            {/* PROFILO */}
            {user?.id && (
              <li className="w-full flex justify-end">
                <Link
                  href={`/profile/me`}
                  className={`flex items-center justify-center gap-3 p-3 rounded-lg transition-colors w-full text-center
                    ${pathname === `/profile/${user.id}` 
                      ? 'bg-[#1d2a44] text-blue-400' 
                      : 'hover:bg-gray-800'}`}
                >
                  <User size={20} />
                  <span>Profilo</span>
                </Link>
              </li>
            )}
          </>
        )}
      </ul>

      {/* PULSANTE NUOVO POST */}
      {user && (
        <Link
          href="/new-post"
          className="mt-6 bg-blue-500 text-white font-bold py-3 px-6 rounded-full w-full hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Nuovo Post
        </Link>
      )}

      {/* LOGOUT */}
      {user && (
        <button
          onClick={logout}
          className="mt-auto flex items-center justify-center gap-2 text-gray-300 py-3 px-6 rounded-full hover:bg-[#1d2a44] transition-colors w-full"
        >
          <LogOut size={18} />
          Esci
        </button>
      )}
    </nav>
  );
}
