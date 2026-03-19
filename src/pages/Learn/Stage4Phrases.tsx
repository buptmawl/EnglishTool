import React from 'react';
import { Home, RotateCcw, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Stage4Phrases({ data, onRestart }: { data: any, onRestart: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[600px] flex flex-col bg-white rounded-xl overflow-hidden shadow-xl text-gray-900">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-500" />
            短语与表达
          </h2>
          <p className="text-gray-500 mt-1">掌握地道表达，提升口语能力</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onRestart}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 重新学习
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> 返回首页
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
        <div className="space-y-6">
          {data.phrases?.map((p: any, idx: number) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-1/3">
                  <h3 className="text-xl font-bold text-[#1e3a8a] mb-1">{p.phrase}</h3>
                  <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-md text-sm font-medium">
                    {p.meaning}
                  </span>
                </div>
                <div className="md:w-2/3 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Explanation</h4>
                    <p className="text-gray-700 leading-relaxed">{p.explanation}</p>
                  </div>
                  {p.usage && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Example</h4>
                      <p className="text-gray-800 italic">"{p.usage}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!data.phrases || data.phrases.length === 0) && (
            <div className="text-center text-gray-500 py-10">
              未提取到相关短语
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
