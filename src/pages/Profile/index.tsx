import React from 'react';
import { User, Clock, BookOpen, Star, Settings, LogOut } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* User Info Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-[#1e3a8a]">
          <User className="w-12 h-12" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">英语学习者</h1>
          <p className="text-gray-500 mt-1">user@example.com</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
              普通用户
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
              连续学习 5 天
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
            <Settings className="w-4 h-4" /> 账号设置
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-[#1e3a8a]">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">累计学习时长</div>
            <div className="text-2xl font-bold text-gray-900">12.5 <span className="text-base font-normal text-gray-500">小时</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">学习视频数</div>
            <div className="text-2xl font-bold text-gray-900">18 <span className="text-base font-normal text-gray-500">个</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-purple-50 rounded-lg text-purple-600">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">掌握词汇量</div>
            <div className="text-2xl font-bold text-gray-900">342 <span className="text-base font-normal text-gray-500">词</span></div>
          </div>
        </div>
      </div>

      {/* Saved Vocabulary Section (Mock) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            收藏词汇夹
          </h2>
          <button className="text-[#1e3a8a] text-sm font-medium hover:underline">查看全部</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { word: 'volatility', pos: 'n.', zh: '波动，易变，不稳定性' },
            { word: 'catalyst', pos: 'n.', zh: '催化剂，促成因素' },
            { word: 'entrench', pos: 'v.', zh: '使根深蒂固，确立' },
            { word: 'upend', pos: 'v.', zh: '颠覆，倒放' },
          ].map((v, i) => (
            <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
              <div>
                <div className="font-bold text-gray-900">{v.word}</div>
                <div className="text-sm text-gray-500 mt-1">
                  <span className="text-blue-600 mr-2">{v.pos}</span>
                  {v.zh}
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                移除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
