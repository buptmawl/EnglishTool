import OpenAI from 'openai';
const client = new OpenAI({
  apiKey: '1d25b851-d0a9-4f36-a8f9-65a52527d3de',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: 'doubao-pro-32k', // usually needs ep-xxx
      messages: [{ role: 'user', content: 'hello' }],
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();
