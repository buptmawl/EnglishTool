import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Stage1Intro from './Stage1Intro';
import Stage2Player from './Stage2Player';
import Stage3Vocabulary from './Stage3Vocabulary';
import Stage4Phrases from './Stage4Phrases';

export default function Learn() {
  const { videoId } = useParams();
  const [currentStage, setCurrentStage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/learning/content/${videoId}`);
        const result = await res.json();
        
        // Transform backend format to match frontend expectation
        const formattedData = {
          id: result.videoId,
          title: result.data.video?.title || 'Video Title',
          subtitle: '沉浸式英语学习',
          source: 'YouTube',
          duration: `${Math.floor((result.data.video?.duration || 0) / 60)}:${(result.data.video?.duration || 0) % 60}`,
          coverImage: result.data.video?.thumbnail || 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4',
          currentVocab: result.data.vocabulary?.slice(0, 4) || [],
          vocabularies: result.data.vocabulary || [],
          phrases: result.data.phrases || [],
          subtitles: result.data.subtitles || []
        };
        setData(formattedData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (videoId) {
      fetchData();
    }
  }, [videoId]);

  const nextStage = () => {
    if (currentStage < 4) {
      setCurrentStage(currentStage + 1);
    }
  };

  const restart = () => {
    setCurrentStage(1);
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto py-20 text-center text-xl text-gray-600">正在加载学习内容...</div>;
  }

  if (!data) {
    return <div className="max-w-6xl mx-auto py-20 text-center text-xl text-red-600">无法加载数据</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1e3a8a] rounded-full -z-10 transition-all duration-500"
            style={{ width: `${((currentStage - 1) / 3) * 100}%` }}
          />
          
          {[1, 2, 3, 4].map((stage) => (
            <div key={stage} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                  ${currentStage > stage ? 'bg-[#1e3a8a] text-white' : 
                    currentStage === stage ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'}`}
              >
                {stage}
              </div>
              <span className={`text-xs font-medium ${currentStage >= stage ? 'text-[#1e3a8a]' : 'text-gray-400'}`}>
                {stage === 1 ? '介绍' : stage === 2 ? '学习' : stage === 3 ? '词汇' : '短语'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
        {currentStage === 1 && <Stage1Intro data={data} onNext={nextStage} />}
        {currentStage === 2 && <Stage2Player data={data} onNext={nextStage} />}
        {currentStage === 3 && <Stage3Vocabulary data={data} onNext={nextStage} />}
        {currentStage === 4 && <Stage4Phrases data={data} onRestart={restart} />}
      </div>
    </div>
  );
}
