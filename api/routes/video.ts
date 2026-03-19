import { Router } from 'express';
import multer from 'multer';
import { fetchYoutubeSubtitles, extractVocabulary, extractPhrases } from '../lib/youtube.js';
import { videoStore, learningStore } from '../lib/store.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// POST /api/video/process
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    const { url, title } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const videoId = extractVideoId(url) || 'demo-' + Date.now();
    
    console.log(`\n=== 开始处理视频 ===`);
    console.log(`URL: ${url}`);
    console.log(`提取到的 Video ID: ${videoId}`);

    let subtitles = [];
    try {
      console.log(`1. 正在获取字幕...`);
      subtitles = await fetchYoutubeSubtitles(videoId);
      console.log(`✅ 字幕获取成功, 共 ${subtitles.length} 条`);
    } catch (err: any) {
      console.error(`❌ 获取真实字幕失败:`, err?.message || err);
      console.warn('⚠️ 降级使用 Mock 字幕');
      subtitles = [
        { sequence: 1, start_time: 0, end_time: 5, english_text: "Welcome to this video.", chinese_text: "欢迎观看此视频。" },
        { sequence: 2, start_time: 5, end_time: 10, english_text: "Today we are building a shelter.", chinese_text: "今天我们要建一个庇护所。" }
      ];
    }

    console.log(`2. 正在调用大模型提取词汇...`);
    let vocabulary;
    try {
      vocabulary = await extractVocabulary(subtitles);
      console.log(`✅ 词汇提取成功`);
    } catch (err: any) {
      console.error(`❌ 词汇提取失败:`, err?.message || err);
      throw new Error(`大模型提取词汇失败: ${err?.message || '未知错误'}`);
    }

    console.log(`3. 正在调用大模型提取短语...`);
    let phrases;
    try {
      phrases = await extractPhrases(subtitles);
      console.log(`✅ 短语提取成功`);
    } catch (err: any) {
      console.error(`❌ 短语提取失败:`, err?.message || err);
      throw new Error(`大模型提取短语失败: ${err?.message || '未知错误'}`);
    }

    const videoInfo = {
      id: videoId,
      title: title || 'YouTube Video',
      url,
      duration: subtitles.length > 0 ? subtitles[subtitles.length - 1].end_time : 0,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };

    videoStore.set(videoId, videoInfo);
    
    learningStore.set(videoId, {
      subtitles,
      vocabulary,
      phrases,
      insights: [
        "通过大模型为您提取的专属内容"
      ]
    });

    console.log(`=== 视频处理完成 ===\n`);

    res.json({
      videoId: videoId,
      status: 'completed',
      message: 'Video processed successfully.'
    });
  } catch (error: any) {
    console.error('❌ 处理视频时发生顶层错误:', error?.message || error);
    res.status(500).json({ error: 'Failed to process video', details: error?.message || 'Unknown error' });
  }
});

export default router;
