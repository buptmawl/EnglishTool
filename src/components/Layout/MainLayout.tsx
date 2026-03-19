import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { PlaySquare, User, Home } from 'lucide-react';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-[#1e3a8a] text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <PlaySquare className="w-6 h-6" />
            <span>EngVision Learning</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <Home className="w-4 h-4" />
              <span>首页</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-1 hover:text-blue-200 transition-colors">
              <User className="w-4 h-4" />
              <span>个人中心</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} EngVision Learning. All rights reserved.</p>
      </footer>
    </div>
  );
}
