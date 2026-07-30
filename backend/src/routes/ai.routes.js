const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const AgenticTutorGraph = require('../services/agenticTutorGraph');

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
    // Instantiate State Graph Agentic Tutor
    const agentGraph = new AgenticTutorGraph(apiKey);

    // Execute multi-node workflow (RouterNode -> MemoryNode -> ActionToolNode -> SpecialistNode -> FormatterNode)
    const result = await agentGraph.run(message, history, req.user);

    return res.json({
      success: true,
      response: result.response,
      agentMetadata: result.agentMetadata
    });

  } catch (error) {
    console.error('Agentic AI Voice Tutor error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while executing the Agentic AI Voice Tutor graph.'
    });
  }
});

module.exports = router;
