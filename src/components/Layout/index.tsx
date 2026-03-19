import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, User, Home } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-[#1e3a8a] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-200" />
                <span className="font-bold text-xl tracking-tight">鹿流精听</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${location.pathname === '/' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}
              >
                <Home className="w-4 h-4" />
                首页
              </Link>
              <Link 
                to="/profile" 
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${location.pathname === '/profile' ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}
              >
                <User className="w-4 h-4" />
                个人中心
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} 鹿流精听 - 智能视频英语学习平台. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
