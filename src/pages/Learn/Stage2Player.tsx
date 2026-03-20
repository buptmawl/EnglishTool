import React, { useState, useEffect } from 'react';

export default function Stage2Player({ data, onNext }: { data: any, onNext: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  const subtitles = data.subtitles || [];
  const hasSubtitles = subtitles.length > 0;
  const duration = hasSubtitles ? subtitles[subtitles.length - 1].end_time : 10;

  // Simulate playback based on actual subtitle timestamps
  useEffect(() => {
    let currentTime = 0;
    const timer = setInterval(() => {
      currentTime += 0.5; // increment by 0.5s
      
      const newProgress = Math.min((currentTime / duration) * 100, 100);
      setProgress(newProgress);

      if (hasSubtitles) {
        const index = subtitles.findIndex((s: any) => currentTime >= s.start_time && currentTime < s.end_time);
        if (index !== -1) {
          setCurrentSubtitleIndex(index);
        } else if (currentTime > subtitles[subtitles.length - 1].end_time) {
          clearInterval(timer);
          onNext();
        }
      } else if (currentTime >= duration) {
        clearInterval(timer);
        onNext();
      }

    }, 500); 
    return () => clearInterval(timer);
  }, [onNext, duration, hasSubtitles, subtitles]);

  const currentSubtitle = hasSubtitles ? subtitles[currentSubtitleIndex] : { english_text: 'Instability, volatility, uncertainty.', chinese_text: '动荡，反复，未知。' };

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAsking) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAsking(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: data.id,
          question: userMsg,
          context: {
            currentSubtitle: currentSubtitle?.english_text,
            title: data.title
          }
        })
      });
      const result = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '抱歉，我遇到了点问题，请稍后再试。' }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="w-full h-[650px] flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-xl text-white">
      {/* Header */}
      <div className="px-4 py-2 bg-black/50 flex justify-between items-center text-sm border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-500">YouTube</span>
          <span className="text-gray-300">{data.title}</span>
        </div>
        <button onClick={onNext} className="text-blue-400 hover:text-blue-300">进入下一阶段</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section: Video and Subtitles */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
          <div className="flex-1 flex flex-col bg-gray-800">
            {/* Top: Video Area (YouTube Embed) */}
            <div className="flex-[3] bg-black relative min-h-[350px]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${data.id}?autoplay=1&mute=1&controls=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse pointer-events-none">
                YOUTUBE LIVE MODE
              </div>
            </div>

            {/* Middle: Dedicated Subtitle Window */}
            <div className="flex-[1] bg-black/40 border-y border-gray-700 flex flex-col items-center justify-center px-8 py-4 text-center">
              <div className="max-w-3xl w-full space-y-3">
                <p className="text-2xl font-bold text-white leading-relaxed">
                  {currentSubtitle?.english_text || 'Waiting for subtitles...'}
                </p>
                <p className="text-lg text-blue-300 font-medium">
                  {currentSubtitle?.chinese_text || '等待字幕翻译...'}
                </p>
              </div>
            </div>

            {/* Bottom: Vocabulary and Info */}
            <div className="flex-[2] bg-gray-900 p-6 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-lg font-bold">本段重点词汇</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto pr-2 custom-scrollbar pb-2">
                {data.currentVocab?.map((v: any, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors shrink-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-purple-300 font-bold">{v.word}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{v.part_of_speech || v.pos}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1 italic">{v.phonetic}</div>
                    <div className="text-sm text-gray-200">{v.definition || v.zh}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: AI Chat Sidebar */}
        <div className="w-80 bg-gray-900 flex flex-col border-l border-gray-800">
          <div className="p-4 bg-black/20 border-b border-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="font-bold text-sm">AI 助教在线</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatHistory.length === 0 && (
              <div className="text-center py-10 px-4 text-gray-500 text-sm">
                <div className="mb-3">👋 你好！我是你的英语助教。</div>
                <div>对视频内容有任何疑问？尽管问我，例如：<br/>"这句话里的单词怎么用？"</div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 border border-gray-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                AI 正在思考...
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="p-4 bg-black/30 border-t border-gray-800">
            <div className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="在此提问关于视频的内容..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={isAsking}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="h-16 bg-black/80 px-4 flex items-center gap-4 border-t border-gray-800">
        <div className="text-xs text-gray-400">{(progress * duration / 100).toFixed(0)}s / {duration}s</div>
        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-sm">中英字幕视频</div>
      </div>
    </div>
  );
}
