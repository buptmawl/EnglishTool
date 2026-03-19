import React from 'react';
import { Play } from 'lucide-react';

export default function Stage1Intro({ data, onNext }: { data: any, onNext: () => void }) {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${data.coverImage})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="mb-6 flex justify-center">
          <span className="px-4 py-1.5 bg-red-600 text-white text-sm font-bold tracking-wider rounded-full shadow-lg">
            {data.source || 'YouTube'}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          {data.title}
        </h1>
        <p className="text-xl text-gray-300 mb-12 drop-shadow">
          {data.subtitle || '沉浸式英语学习'}
        </p>
        
        <button 
          onClick={onNext}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-[#1e3a8a] border border-transparent rounded-full hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-xl shadow-blue-900/20"
        >
          <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="currentColor" />
          开始学习
        </button>

        <div className="mt-8 text-gray-400 flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            时长: {data.duration}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            中英双语
          </span>
        </div>
      </div>
    </div>
  );
}
