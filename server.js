const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const AI_HORDE_API_KEY = process.env.AI_HORDE_API_KEY;
const AI_HORDE_API_URL = 'https://stablehorde.net/api/v2';

app.post('/generate-design', async (req, res) => {
  try {
    const { designType, designText } = req.body;

    // Create a generation request
    const generateResponse = await axios.post(`${AI_HORDE_API_URL}/generate/async`, {
      prompt: `${designType} with text: ${designText}`,
      params: {
        steps: 30,
        width: 512,
        height: 512,
      },
    }, {
      headers: {
        'apikey': AI_HORDE_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const { id: taskId } = generateResponse.data;

    // Instead of waiting, send the task ID back to the client
    res.json({ taskId });
  } catch (error) {
    console.error('Error initiating design generation:', error);
    res.status(500).json({ error: 'Failed to initiate design generation' });
  }
});

app.get('/check-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const checkResponse = await axios.get(`${AI_HORDE_API_URL}/generate/check/${taskId}`);
    
    if (checkResponse.data.done) {
      const getResponse = await axios.get(`${AI_HORDE_API_URL}/generate/status/${taskId}`);
      const imageUrl = getResponse.data.generations[0].img;
      res.json({ done: true, imageUrl });
    } else {
      res.json({ done: false });
    }
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
