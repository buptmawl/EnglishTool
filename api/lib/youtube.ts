import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const youtubeTranscriptPkg = require('youtube-transcript');
const YoutubeTranscript = youtubeTranscriptPkg.YoutubeTranscript || youtubeTranscriptPkg.default || youtubeTranscriptPkg;

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// 移除 OpenAI SDK 的引用，直接使用原生的 fetch 实现适配火山引擎最新 /api/v3/responses 接口
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';
const API_KEY = '1d25b851-d0a9-4f36-a8f9-65a52527d3de';
const MODEL = 'doubao-seed-2-0-pro-260215';

console.log("=== Doubao Config Debug ===");
console.log("URL:", API_URL);
console.log("Key length:", API_KEY.length);
console.log("Model:", MODEL);
console.log("===========================");

async function callDoubaoAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try to use exactly the format from the cURL
  const isResponsesEndpoint = API_URL.endsWith('/responses');
  
  let payload: any;
  let finalUrl = API_URL;

  if (isResponsesEndpoint) {
    // Exact format from the user's cURL
    payload = {
      model: MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: systemPrompt
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userPrompt
            }
          ]
        }
      ]
    };
  } else {
    // Fallback standard OpenAI format if they change the URL back
    finalUrl = `${API_URL}/chat/completions`;
    payload = {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    };
  }

  const response = await fetch(finalUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Doubao API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  
  if (isResponsesEndpoint) {
     const assistantMsg = data.output?.find((m: any) => m.role === 'assistant');
     return assistantMsg?.content?.find((c: any) => c.type === 'output_text')?.text || '';
  } else {
     return data.choices?.[0]?.message?.content || '';
  }
}

async function fallbackFetchTranscriptWithLLM(videoId: string) {
  try {
    console.log(`[Fallback] 尝试使用 Jina API 抓取页面内容: https://www.youtube.com/watch?v=${videoId}`);
    const jinaUrl = `https://r.jina.ai/https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'application/json',
        // 'Authorization': `Bearer ${process.env.JINA_API_KEY}` // optional
      }
    });

    if (!response.ok) {
      throw new Error(`Jina fetch failed with status: ${response.status}`);
    }

    const data = await response.json();
    const pageText = data.data?.content || data.content || '';
    
    if (!pageText || pageText.length < 100) {
      throw new Error('No useful content found on the page via Jina');
    }

    console.log(`[Fallback] 成功抓取页面内容，长度: ${pageText.length}，尝试让大模型从中提取英文字幕文本...`);

    // Let the LLM extract the English text from the noisy page content
    const extractedText = await callDoubaoAPI(
      'You are an assistant that extracts the actual spoken English transcript or detailed video description/summary from noisy webpage text. Return ONLY the English text representing the video content/transcript. Do not include any HTML, UI text, or conversational filler. If you cannot find a transcript, write a 5-sentence plausible English summary of what the video is likely about based on the title and description.',
      `Extract the English transcript/summary from this YouTube page text:\n\n${pageText.substring(0, 15000)}`
    );
    
    // Convert this raw text block into simulated timed subtitle chunks
    const sentences = extractedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      throw new Error('LLM could not extract any valid English sentences.');
    }

    return sentences.map((sentence, index) => ({
      sequence: index + 1,
      start_time: index * 5, // mock time
      end_time: (index + 1) * 5,
      english_text: sentence.trim(),
      chinese_text: ''
    }));

  } catch (error) {
    console.error('[Fallback Error]:', error);
    // return a mock fallback so the UI won't completely crash
    return [
      { sequence: 1, start_time: 0, end_time: 5, english_text: "This video does not have official transcripts.", chinese_text: "" },
      { sequence: 2, start_time: 5, end_time: 10, english_text: "We tried to extract it from the page description, but failed.", chinese_text: "" }
    ];
  }
}

export async function fetchYoutubeSubtitles(videoId: string) {
  let rawSubtitles = [];
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    rawSubtitles = transcript.map((item: any, index: number) => ({
      sequence: index + 1,
      start_time: Math.floor(item.offset),
      end_time: Math.floor(item.offset + item.duration),
      english_text: item.text,
      chinese_text: ''
    }));
  } catch (error: any) {
    console.warn(`[YoutubeTranscript] Failed for ${videoId}: ${error.message}`);
    console.log('触发降级策略: 尝试抓取页面并让大模型提取...');
    rawSubtitles = await fallbackFetchTranscriptWithLLM(videoId);
  }

  // Limit to first 30 lines for demo speed, or process all in production
  const subtitlesToProcess = rawSubtitles.slice(0, 30);
  
  // Batch translation to save API calls
  const englishTexts = subtitlesToProcess.map((s, i) => `[${i}] ${s.english_text}`).join('\n');
  
  try {
    const translatedText = await callDoubaoAPI(
      'You are a professional video subtitle translator. Translate the following English subtitles into natural Chinese. Maintain the exact line numbers [id] in your response. Only return the translated text with line numbers, nothing else.',
      englishTexts
    );
    
    // Parse the translations back to the array
    const lines = translatedText.split('\n');
    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.*)$/);
      if (match) {
        const idx = parseInt(match[1]);
        if (subtitlesToProcess[idx]) {
          subtitlesToProcess[idx].chinese_text = match[2].trim();
        }
      }
    }
    
    // Fill in any missing translations
    subtitlesToProcess.forEach(s => {
      if (!s.chinese_text) s.chinese_text = '[Translation Failed] ' + s.english_text;
    });

  } catch (err: any) {
    console.error('LLM Translation error:', err.message);
    subtitlesToProcess.forEach(s => {
      s.chinese_text = '[翻译] ' + s.english_text;
    });
  }

  return subtitlesToProcess;
}

export async function extractVocabulary(subtitles: any[]) {
  const text = subtitles.map(s => s.english_text).join(' ');
  
  try {
    const content = await callDoubaoAPI(
      `You are an English teacher. Extract 8-10 key vocabulary words from the provided text that are useful for ESL learners.
Return ONLY a valid JSON object with a "vocabulary" array. Each item should have:
- word (string)
- phonetic (string, e.g. /wɜːd/)
- part_of_speech (string, e.g. n., v., adj.)
- definition (string, Chinese meaning in context)
- difficulty (number, 1-5)
Do not include any other text, markdown formatting, or explanations.`,
      text
    );

    if (content) {
      // Clean up potential markdown formatting from LLM response
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (parsed.vocabulary && Array.isArray(parsed.vocabulary)) {
        return parsed.vocabulary;
      }
    }
  } catch (err: any) {
    console.error('LLM Vocabulary error:', err.message);
  }

  // Fallback
  const words = text.match(/\b[A-Za-z]{6,}\b/g) || [];
  const uniqueWords = [...new Set(words)].slice(0, 10);
  return uniqueWords.map(word => ({
    word: word.toLowerCase(),
    phonetic: `/${word.toLowerCase()}/`,
    part_of_speech: 'n/v',
    definition: `自动提取: ${word}`,
    difficulty: 2
  }));
}

export async function extractPhrases(subtitles: any[]) {
  const text = subtitles.map(s => s.english_text).join(' ');
  
  try {
    const content = await callDoubaoAPI(
      `You are an English teacher. Extract 3-5 useful phrases, idioms, or collocations from the provided text.
Return ONLY a valid JSON object with a "phrases" array. Each item should have:
- phrase (string)
- meaning (string, Chinese meaning)
- explanation (string, detailed explanation of how it is used)
- usage (string, an example sentence using the phrase)
Do not include any other text, markdown formatting, or explanations.`,
      text
    );

    if (content) {
      // Clean up potential markdown formatting from LLM response
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (parsed.phrases && Array.isArray(parsed.phrases)) {
        return parsed.phrases;
      }
    }
  } catch (err: any) {
    console.error('LLM Phrases error:', err.message);
  }

  // Fallback
  return [
    {
      phrase: "from scratch",
      meaning: "从头开始",
      explanation: "表示从最基本的状态开始，没有任何基础或准备。",
      usage: "He built the computer from scratch."
    }
  ];
}
