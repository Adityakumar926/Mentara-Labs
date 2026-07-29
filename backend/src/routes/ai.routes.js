const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.post('/voice-tutor', protect, async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'Groq API Key is not configured on the server.' });
  }

  try {
    const systemPrompt = `You are an AI tutor for Cambridge Primary school students (ages 5 to 11).
Explain concepts in extremely simple, friendly, and engaging language suitable for children.
Keep your answers brief, simple, and under 100 words.
Use cute and relatable examples whenever possible.
If the question is completely outside school curriculum subjects (such as science, math, history, literature, geography, etc.), politely tell the student that you can only answer educational and curriculum-related questions, and ask them to try asking a school topic!`;

    // Construct the messages payload including the system prompt and conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Append past history if it exists
    if (Array.isArray(history)) {
      history.forEach(msg => {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Append the current message
    messages.push({ role: 'user', content: message });

    // Call the Groq Chat Completions API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.6,
        max_tokens: 150
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error Details:', data);
      throw new Error(data.error?.message || 'Failed to get response from Groq API');
    }

    const aiMessage = data.choices?.[0]?.message?.content || '';
    
    return res.json({
      success: true,
      response: aiMessage.trim()
    });

  } catch (error) {
    console.error('AI Voice Tutor error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while calling the AI Voice Tutor.'
    });
  }
});

module.exports = router;
