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

    const extractedText = await callDoubaoAPI(
      'You are an assistant that extracts the actual spoken English transcript or detailed video description/summary from noisy webpage text. Return ONLY the English text representing the video content/transcript. Do not include any HTML, UI text, or conversational filler. If you cannot find a transcript, write a 5-sentence plausible English summary of what the video is likely about based on the title and description.',
      `Extract the English transcript/summary from this YouTube page text:\n\n${pageText.substring(0, 15000)}`
    );
    
    const sentences = extractedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      throw new Error('LLM could not extract any valid English sentences.');
    }

    const result = sentences.map((sentence, index) => ({
      sequence: index + 1,
      start_time: index * 5, 
      end_time: (index + 1) * 5,
      english_text: sentence.trim(),
      chinese_text: ''
    }));

    console.log(`✅ [Fallback] LLM 提取成功, 共 ${result.length} 条句子`);
    return result;

  } catch (error) {
    console.error('[Fallback Error]:', error);
    return [
      { sequence: 1, start_time: 0, end_time: 5, english_text: "This video does not have official transcripts.", chinese_text: "" },
      { sequence: 2, start_time: 5, end_time: 10, english_text: "We tried to extract it from the page description, but failed.", chinese_text: "" }
    ];
  }
}

export async function fetchYoutubeSubtitles(videoId: string) {
  let rawSubtitles = [];
  try {
    console.log(`[YoutubeTranscript] 尝试常规获取字幕: ${videoId}`);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    rawSubtitles = transcript.map((item: any, index: number) => ({
      sequence: index + 1,
      start_time: Math.floor(item.offset),
      end_time: Math.floor(item.offset + item.duration),
      english_text: item.text,
      chinese_text: ''
    }));
    console.log(`✅ [YoutubeTranscript] 成功抓取官方字幕: ${rawSubtitles.length} 条`);
  } catch (error: any) {
    console.warn(`⚠️ [YoutubeTranscript] 常规抓取失败: ${error.message}`);
    
    try {
      console.log(`🔍 [Advanced] 尝试从网页源码深度搜索字幕轨道...`);
      const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      });
      const html = await pageResponse.text();
      
      // 更加鲁棒的正则，直接找 captionTracks 数组
      const tracksMatch = html.match(/"captionTracks":\s*(\[.+?\])/);
      if (tracksMatch) {
        const captionTracks = JSON.parse(tracksMatch[1]);
        if (captionTracks && captionTracks.length > 0) {
          // 找英文字幕（优先找非自动生成的，如果只有自动生成的就用它）
          const englishTrack = captionTracks.find((t: any) => t.languageCode === 'en' && !t.kind) || 
                               captionTracks.find((t: any) => t.languageCode === 'en') || 
                               captionTracks[0];
          
          console.log(`✅ [Advanced] 找到字幕轨道: ${englishTrack.name?.simpleText || 'Unknown'} (${englishTrack.languageCode})`);
          
          const transcriptResponse = await fetch(englishTrack.baseUrl + '&fmt=json3');
          const transcriptData = await transcriptResponse.json();
          
          rawSubtitles = transcriptData.events
            .filter((e: any) => e.segs)
            .map((e: any, index: number) => ({
              sequence: index + 1,
              start_time: Math.floor(e.tStartMs / 1000),
              end_time: Math.floor((e.tStartMs + (e.dDurationMs || 0)) / 1000),
              english_text: e.segs.map((s: any) => s.utf8).join(' ').replace(/\n/g, ' ').trim(),
              chinese_text: ''
            }));
          console.log(`✅ [Advanced] 成功提取到 ${rawSubtitles.length} 条原始字幕`);
        }
      } else {
        console.log('⚠️ [Advanced] 源码中未找到 captionTracks 标识');
      }
    } catch (innerError: any) {
      console.error(`❌ [Advanced] 深度搜索失败:`, innerError.message);
    }
  }

  if (rawSubtitles.length === 0) {
    console.log('🚀 [Last Resort] 触发降级策略: 使用 Jina + LLM...');
    rawSubtitles = await fallbackFetchTranscriptWithLLM(videoId);
  }

  // 获取前 100 条字幕（大约 6-8 分钟），既保证了内容完整也兼顾了处理速度
  const subtitlesToProcess = rawSubtitles.slice(0, 100);
  console.log(`--- 准备翻译 ${subtitlesToProcess.length} 条字幕 (总共 ${rawSubtitles.length} 条) ---`);
  
  // 分批翻译，每批 25 条，避免 LLM 上下文溢出或超时
  const batchSize = 25;
  for (let i = 0; i < subtitlesToProcess.length; i += batchSize) {
    const batch = subtitlesToProcess.slice(i, i + batchSize);
    const englishTexts = batch.map((s, idx) => `[${i + idx}] ${s.english_text}`).join('\n');
    
    try {
      console.log(`[Translation] 正在翻译第 ${i} 到 ${i + batch.length} 条...`);
      const translatedText = await callDoubaoAPI(
        'You are a professional video subtitle translator. Translate English into natural Chinese. Keep line numbers [id]. Return ONLY the translated lines.',
        englishTexts
      );
      
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
    } catch (err: any) {
      console.error(`Batch translation error at ${i}:`, err.message);
    }
  }

  // 补全翻译失败的条目
  subtitlesToProcess.forEach(s => {
    if (!s.chinese_text) s.chinese_text = s.english_text;
  });

  console.log('--- 字幕处理完成，预览前 5 条 ---');
  subtitlesToProcess.slice(0, 5).forEach(s => {
    console.log(`[${s.start_time}s] ${s.english_text} -> ${s.chinese_text}`);
  });

  return subtitlesToProcess;
}


export async function extractVocabulary(subtitles: any[]) {
  const text = subtitles.map(s => s.english_text).join(' ');
  console.log(`--- 正在从字幕中提取词汇 (文本长度: ${text.length}) ---`);
  
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (parsed.vocabulary && Array.isArray(parsed.vocabulary)) {
        console.log(`✅ 成功提取词汇: ${parsed.vocabulary.map((v: any) => v.word).join(', ')}`);
        console.log('详细词汇列表:', JSON.stringify(parsed.vocabulary, null, 2));
        return parsed.vocabulary;
      }
    }
  } catch (err: any) {
    console.error('LLM Vocabulary error:', err.message);
  }

  const words = text.match(/\b[A-Za-z]{6,}\b/g) || [];
  const uniqueWords = [...new Set(words)].slice(0, 10);
  const fallback = uniqueWords.map(word => ({
    word: word.toLowerCase(),
    phonetic: `/${word.toLowerCase()}/`,
    part_of_speech: 'n/v',
    definition: `自动提取: ${word}`,
    difficulty: 2
  }));
  console.log(`⚠️ 使用备选词汇提取逻辑: ${fallback.map(v => v.word).join(', ')}`);
  return fallback;
}

export async function extractPhrases(subtitles: any[]) {
  const text = subtitles.map(s => s.english_text).join(' ');
  console.log(`--- 正在从字幕中提取短语 ---`);
  
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
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (parsed.phrases && Array.isArray(parsed.phrases)) {
        console.log(`✅ 成功提取短语: ${parsed.phrases.map((p: any) => p.phrase).join(', ')}`);
        console.log('详细短语列表:', JSON.stringify(parsed.phrases, null, 2));
        return parsed.phrases;
      }
    }
  } catch (err: any) {
    console.error('LLM Phrases error:', err.message);
  }

  const fallback = [
    {
      phrase: "from scratch",
      meaning: "从头开始",
      explanation: "表示从最基本的状态开始，没有任何基础或准备。",
      usage: "He built the computer from scratch."
    }
  ];
  console.log(`⚠️ 使用备选短语提取逻辑`);
  return fallback;
}

