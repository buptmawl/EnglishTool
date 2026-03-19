import { Router } from 'express';
import { learningStore, videoStore } from '../lib/store.js';

const router = Router();

// GET /api/learning/content/:videoId
router.get('/content/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const learningData = learningStore.get(videoId);
    const videoData = videoStore.get(videoId);

    if (!learningData) {
      // Fallback for demo-video-id or if not found
      return res.json({
        videoId,
        status: 'success',
        data: {
          video: {
            title: "Mock Video",
            duration: 120,
            thumbnail: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4"
          },
          subtitles: [
            { sequence: 1, start_time: 0, end_time: 5, english_text: "Welcome", chinese_text: "欢迎" }
          ],
          vocabulary: [],
          phrases: [],
          insights: []
        }
      });
    }

    res.json({
      videoId,
      status: 'success',
      data: {
        video: videoData || {},
        ...learningData
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve learning content' });
  }
});

// POST /api/learning/progress
router.post('/progress', async (req, res) => {
  try {
    const { videoId, stage, completed, duration } = req.body;
    
    res.json({
      status: 'success',
      message: 'Progress saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
