const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: 'Test-Api-Key',
});

const TWITTER_BEARER = 'Test-Api-Key';

app.get('/coins', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/list');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/market/:crypto/:days', async (req, res) => {
  const { crypto, days } = req.params;
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart`,
      { params: { vs_currency: 'usd', days } }
    );
    res.json(data.prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/summarize', async (req, res) => {
  const { crypto } = req.body;

  try {
    const tweetsRes = await axios.get(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(crypto)}&max_results=10&tweet.fields=text`,
      { headers: { Authorization: `Bearer ${TWITTER_BEARER}` } }
    );

    const tweets =  'No tweets found.';
    const prompt = `Write me a summary of the latest news about ${crypto}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    });

    const summary = completion.choices?.[0]?.message?.content;
    res.json({ summary });
  } catch (error) {
    console.error('Summary error:', error.message);
    res.status(500).json({ error: 'Failed to fetch Twitter or OpenAI data.' });
  }
});

app.listen(3000, () => console.log('Backend działa na porcie 3000'));
