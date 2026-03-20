import { Router } from 'express';
import { learningStore } from '../lib/store.js';
import { fetchYoutubeSubtitles } from '../lib/youtube.js'; // reused to get callDoubaoAPI indirectly or we can export it

const router = Router();

// Re-implementing the Doubao call locally or we could refactor youtube.ts to export it
// For simplicity and speed, let's use a similar fetch call
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';
const API_KEY = '1d25b851-d0a9-4f36-a8f9-65a52527d3de';
const MODEL = 'doubao-seed-2-0-pro-260215';

async function callDoubao(systemPrompt: string, userPrompt: string): Promise<string> {
  const payload = {
    model: MODEL,
    input: [
      { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
      { role: "user", content: [{ type: "input_text", text: userPrompt }] }
    ]
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  const assistantMsg = data.output?.find((m: any) => m.role === 'assistant');
  return assistantMsg?.content?.find((c: any) => c.type === 'output_text')?.text || '抱歉，我无法回答这个问题。';
}

// POST /api/chat/ask
router.post('/ask', async (req, res) => {
  try {
    const { videoId, question, context } = req.body;
    
    const learningData = learningStore.get(videoId);
    const videoContext = learningData 
      ? `Video Title: ${context.title}\nKey Subtitles: ${learningData.subtitles.slice(0, 20).map((s: any) => s.english_text).join(' ')}`
      : `Current Context: ${context.currentSubtitle}`;

    const answer = await callDoubao(
      'You are a helpful English learning assistant. Use the provided video context to answer the user\'s question. If they ask about a specific word or phrase in the subtitle, explain its meaning and usage. Keep your answers concise and encouraging in Chinese, but use English for examples.',
      `Context:\n${videoContext}\n\nUser Question: ${question}`
    );

    res.json({ answer });
  } catch (error: any) {
    console.error('Chat Error:', error.message);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});

export default router;
