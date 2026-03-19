import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Upload, Play, Clock, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=FAmM46vFn1Y');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleProcessUrl = async () => {
    if (!url) return;
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/video/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (response.ok && data.videoId) {
        navigate(`/learn/${data.videoId}`);
      } else {
        alert(`处理失败，请重试: ${data.details || data.error || '未知错误'}`);
      }
    } catch (error: any) {
      console.error('Error processing URL:', error);
      alert(`网络错误，请重试: ${error?.message || '未知错误'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      // Simulate file upload and process
      setTimeout(() => {
        setIsProcessing(false);
        navigate('/learn/demo-video-id');
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section / Input Area */}
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">开启沉浸式英语学习之旅</h1>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
          输入YouTube/Bilibili视频链接，或上传本地视频，我们将智能提取字幕和重点词汇，为您打造四阶段高效学习体验。
        </p>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all"
                placeholder="在此粘贴视频链接 (YouTube / Bilibili)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              onClick={handleProcessUrl}
              disabled={!url || isProcessing}
              className="px-8 py-4 bg-[#1e3a8a] text-white font-medium rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
            >
              {isProcessing ? '处理中...' : '开始学习'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或</span>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#1e3a8a] hover:bg-blue-50 transition-all cursor-pointer relative">
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-blue-100 text-[#1e3a8a] rounded-full">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-gray-700 font-medium">点击或拖拽上传本地视频</div>
              <p className="text-gray-500 text-sm">支持 MP4, MOV 格式，最大 500MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning History */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1e3a8a]" />
          最近学习
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock History Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/learn/demo-video-id')}>
            <div className="flex h-32">
              <div className="w-48 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&q=80&w=400&h=250" alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">12:10</div>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-2">泰国经济困局：从亚洲标杆到发展掉队者的陨落之路</h3>
                  <p className="text-xs text-gray-500 mt-1">Bloomberg Originals</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1e3a8a] font-medium">
                  <Play className="w-4 h-4" />
                  <span>继续学习</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>上次学习: 2小时前</span>
              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" /> 已完成 2/4 阶段</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/learn/demo-video-id')}>
            <div className="flex h-32">
              <div className="w-48 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=400&h=250" alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">08:45</div>
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-medium text-gray-900 line-clamp-2">如何像母语者一样流利地使用英语连读</h3>
                  <p className="text-xs text-gray-500 mt-1">English Mastery</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#1e3a8a] font-medium">
                  <Play className="w-4 h-4" />
                  <span>继续学习</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>上次学习: 昨天</span>
              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3 h-3" /> 已完成 4/4 阶段</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
