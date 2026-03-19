async function testDoubao() {
  const url = 'https://ark.cn-beijing.volces.com/api/v3/responses'; // Notice this is /responses, not /chat/completions!
  const apiKey = '1d25b851-d0a9-4f36-a8f9-65a52527d3de';

  console.log('Sending request to Doubao API...');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-260215',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Hello, testing the API.'
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testDoubao();