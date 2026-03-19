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

  return (
    <div className="w-full h-[600px] flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-xl text-white">
      {/* Header */}
      <div className="px-4 py-2 bg-black/50 flex justify-between items-center text-sm border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-500">YouTube</span>
          <span className="text-gray-300">{data.title}</span>
        </div>
        <button onClick={onNext} className="text-blue-400 hover:text-blue-300">跳过演示</button>
      </div>

      {/* 4-Grid Layout */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-gray-800 p-px relative">
        {/* Background Image across the whole area */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${data.coverImage})` }}
        />

        {/* Top Left: Video Area (Mocked with image for now) */}
        <div className="bg-black/80 relative flex items-center justify-center p-4">
          <img src={data.coverImage} alt="Video" className="max-h-full max-w-full rounded" />
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-1 rounded">LIVE</div>
        </div>

        {/* Top Right: English Subtitles */}
        <div className="bg-black/60 relative flex items-center justify-center p-8 border-l border-b border-gray-700">
          <p className="text-3xl font-medium text-center drop-shadow-lg leading-relaxed">
            {currentSubtitle?.english_text}
          </p>
        </div>

        {/* Bottom Left: Vocabulary */}
        <div className="bg-black/70 relative p-6 flex flex-col border-r border-t border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            <h3 className="text-lg font-bold">重点词汇</h3>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {data.currentVocab?.map((v: any, idx: number) => (
              <div key={idx} className="text-sm">
                <span className="text-white font-medium">{v.word}</span>{' '}
                <span className="text-gray-400">{v.phonetic}</span>{' '}
                <span className="text-blue-300 text-xs">{v.pos}</span>{' '}
                <span className="text-gray-200">{v.definition || v.zh}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right: Chinese Translation & Insights */}
        <div className="bg-black/60 relative flex flex-col justify-center items-center p-8 border-t border-gray-700">
          <p className="text-2xl font-medium text-center text-gray-200 drop-shadow-md">
            {currentSubtitle?.chinese_text}
          </p>
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
