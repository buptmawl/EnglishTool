import { fetchYoutubeSubtitles, extractVocabulary, extractPhrases } from './api/lib/youtube.js';

async function run() {
  console.log("Fetching subtitles...");
  try {
    const subs = await fetchYoutubeSubtitles('R1vskiVDwl4');
    console.log("Subtitles fetched:", subs.length);
    console.log(subs.slice(0, 2));

    console.log("Extracting vocabulary...");
    const vocab = await extractVocabulary(subs);
    console.log("Vocab:", vocab);

    console.log("Extracting phrases...");
    const phrases = await extractPhrases(subs);
    console.log("Phrases:", phrases);
  } catch (err) {
    console.error("Test script failed:", err);
  }
}

run();