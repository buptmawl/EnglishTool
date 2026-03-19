import React from 'react';
import { Volume2, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Stage3Vocabulary({ data, onNext }: { data: any, onNext: () => void }) {
  return (
    <div className="w-full h-[600px] flex flex-col bg-white rounded-xl overflow-hidden shadow-xl text-gray-900">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            词汇总结
          </h2>
          <p className="text-gray-500 mt-1">共提取 {data.vocabularies?.length || 0} 个核心词汇</p>
        </div>
        <button 
          onClick={onNext}
          className="px-6 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          进入短语学习 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.vocabularies?.map((v: any, idx: number) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1e3a8a] transition-colors">{v.word}</h3>
                <button className="text-gray-400 hover:text-[#1e3a8a] transition-colors p-1">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3 text-sm">
                <span className="text-gray-500 font-mono">{v.phonetic}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-[#1e3a8a] rounded text-xs">{v.pos || v.part_of_speech || 'n.'}</span>
              </div>
              <p className="text-gray-700 text-sm">{v.definition || v.zh}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
