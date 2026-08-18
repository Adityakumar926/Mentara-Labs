/**
 * Agentic State Graph AI Voice Tutor Engine
 * Inspired by LangGraph StateGraph design patterns.
 * 
 * Pipeline Nodes:
 * 1. RouterNode (Intent & Context Classification using groq/compound-mini)
 * 2. MemoryNode (State Graph Context & Memory Synthesizer)
 * 3. ActionToolNode (Class-Scoped Database Search & Navigation Tool Node)
 * 4. SpecialistNode (Multi-Model Deep Reasoning using groq/compound & openai/gpt-oss-120b)
 * 5. OutputFormatterNode (Voice, Action & Agent Metadata Synthesizer)
 */

const db = require('../config/db');

// Supported & Verified Active Groq Models
const ACTIVE_MODELS = {
  FAST_ROUTER: 'groq/compound-mini',
  MATH_LOGIC: 'openai/gpt-oss-20b',
  DEEP_REASONING: 'openai/gpt-oss-120b',
  GENERAL_TUTOR: 'openai/gpt-oss-120b'
};

function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

class AgenticTutorGraph {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  // Helper method for Groq API calls with response cleaning
  async callGroq(model, messages, temperature = 0.5, maxTokens = 350) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `Groq API call failed for model ${model}`);
    }

    let text = data.choices?.[0]?.message?.content || '';
    // Strip reasoning <think>...</think> blocks if present
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return text;
  }

  // Semantic search matching using fast active model
  async matchContentWithLLM(message, items, type) {
    if (!items || items.length === 0) return null;

    const itemsSummary = items.map(item => ({
      id: item.id,
      title: item.title,
      subject: item.subject_name || item.subject || '',
      topic: item.topic_name || item.topic || ''
    }));

    const systemPrompt = `You are the Semantic Retriever for Gogo AI Tutor.
Analyze the student's request and choose the single most relevant item from the provided list of ${type}s.
Only select an item if it is clearly relevant to what the student is asking to open, start, or view. 
If the student's request is general (e.g. asking about "exams" or "worksheets" in general without specifying a topic), or if there is no matching item in the list, return {"matchedId": null}.

Return a JSON object ONLY with the key:
{"matchedId": "selected-item-id-or-null"}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Student request: "${message}"\nAvailable ${type}s: ${JSON.stringify(itemsSummary)}` }
    ];

    try {
      const rawResult = await this.callGroq(ACTIVE_MODELS.FAST_ROUTER, messages, 0.1, 120);
      const cleaned = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.matchedId) {
        return items.find(item => item.id === parsed.matchedId) || null;
      }
    } catch (err) {
      console.warn('Semantic search LLM fallback used:', err.message);
    }
    return null;
  }

  /**
   * NODE 1: Router & Intent Classification Node
   */
  async routerNode(state) {
    const { message, history } = state;

    const routerSystemPrompt = `You are the Intent & Context Router for Gogo AI Tutor.
Analyze the student's current message alongside prior conversation history.
Classify the intent into ONE of the following categories:
- SEARCH_AND_NAVIGATE: Student asks to find, open, or take an exam, test, worksheet, course, certificate, or profile page.
- FOLLOW_UP: Student is continuing or clarifying a previous topic discussed in history.
- CONCEPT_EXPLANATION: Student wants to learn or understand a new concept or topic.
- QUIZ_OR_PRACTICE: Student wants a test, quiz question, or practice problem.
- CODE_OR_MATH: Student is asking for help with math calculation or coding.
- GENERAL_CONVERSATION: Greetings, small talk, or general warm interaction.
- OUT_OF_BOUNDS: Completely non-educational/inappropriate topic outside school learning.

Return a JSON object ONLY with the keys:
{"intent": "CATEGORY_NAME", "topic": "Short Topic Summary", "isFollowUp": true/false}`;

    const routerMessages = [
      { role: 'system', content: routerSystemPrompt },
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    try {
      const rawResult = await this.callGroq(ACTIVE_MODELS.FAST_ROUTER, routerMessages, 0.2, 120);
      const cleaned = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        ...state,
        intent: parsed.intent || 'CONCEPT_EXPLANATION',
        currentTopic: parsed.topic || 'General Learning',
        isFollowUp: Boolean(parsed.isFollowUp),
        routerStepExecuted: true
      };
    } catch (err) {
      console.warn('RouterNode LLM fallback:', err.message);
      return {
        ...state,
        intent: 'CONCEPT_EXPLANATION',
        currentTopic: 'General Learning',
        isFollowUp: false,
        routerStepExecuted: true
      };
    }
  }

  /**
   * NODE 2: Memory & Context Synthesizer Node
   */
  async memoryNode(state) {
    const { history, message } = state;
    const activeHistory = Array.isArray(history) ? history.slice(-6) : [];

    const contextSummary = activeHistory.length > 0
      ? `Recent Conversation Context: ${activeHistory.map(h => `${h.role}: ${h.content}`).join(' | ')}`
      : 'First turn of conversation.';

    return {
      ...state,
      contextSummary,
      activeHistory,
      memoryStepExecuted: true
    };
  }

  /**
   * NODE 3: Action & Database Search Tool Node
   */
  async actionToolNode(state) {
    const { message, intent, user } = state;
    let action = null;
    let foundDataSummary = '';

    if (intent !== 'SEARCH_AND_NAVIGATE') {
      const lower = message.toLowerCase();
      if (!lower.includes('take') && !lower.includes('open') && !lower.includes('go to') && !lower.includes('worksheet') && !lower.includes('exam')) {
        return { ...state, action: null, foundDataSummary: '', actionStepExecuted: true };
      }
    }

    const lowerMsg = message.toLowerCase();

    // Check static destinations
    if (lowerMsg.includes('profile') || lowerMsg.includes('account') || lowerMsg.includes('settings')) {
      action = { type: 'NAVIGATE', url: user?.role === 'teacher' ? '/profile' : '/student/profile', label: 'Profile Page' };
      foundDataSummary = 'Opening user profile page.';
    } else if (lowerMsg.includes('certificate') || lowerMsg.includes('cert')) {
      action = { type: 'NAVIGATE', url: '/student/certificates', label: 'Certificates Page' };
      foundDataSummary = 'Opening student certificates page.';
    } else if (lowerMsg.includes('dashboard') || lowerMsg.includes('home')) {
      action = { type: 'NAVIGATE', url: user?.role === 'teacher' ? '/courses' : '/student/dashboard', label: 'Dashboard' };
      foundDataSummary = 'Opening main dashboard.';
    } else if (lowerMsg.includes('exam') || lowerMsg.includes('test') || lowerMsg.includes('assessment')) {
      try {
        const examsRes = await db.query('SELECT id, title, subject_name FROM exams ORDER BY created_at DESC LIMIT 20');
        const matched = await this.matchContentWithLLM(message, examsRes.rows, 'exam');
        if (matched) {
          action = { type: 'NAVIGATE', url: `/exams/${matched.id}/take`, label: matched.title };
          foundDataSummary = `Found matching exam: "${matched.title}". Navigating now.`;
        } else {
          action = { type: 'NAVIGATE', url: '/exams', label: 'Exams Page' };
          foundDataSummary = 'Navigating to Exams page.';
        }
      } catch (err) {
        console.error('Error in actionToolNode exam lookup:', err);
        action = { type: 'NAVIGATE', url: '/exams', label: 'Exams Page' };
      }
    } else if (lowerMsg.includes('worksheet') || lowerMsg.includes('course') || lowerMsg.includes('subject') || lowerMsg.includes('topic') || lowerMsg.includes('practice')) {
      try {
        const subjectsRes = await db.query('SELECT id, name as title FROM subjects ORDER BY name ASC LIMIT 20');
        const matchedSubject = await this.matchContentWithLLM(message, subjectsRes.rows, 'subject');
        if (matchedSubject) {
          action = { type: 'NAVIGATE', url: `/subjects/${matchedSubject.id}`, label: matchedSubject.title };
          foundDataSummary = `Found matching subject: "${matchedSubject.title}". Navigating to topics.`;
        } else {
          action = { type: 'NAVIGATE', url: user?.role === 'teacher' ? '/courses' : '/student/dashboard', label: 'Courses' };
          foundDataSummary = 'Navigating to courses and study materials.';
        }
      } catch (err) {
        console.error('Error in actionToolNode subject lookup:', err);
        action = { type: 'NAVIGATE', url: '/courses', label: 'Courses Page' };
      }
    }

    return {
      ...state,
      action,
      foundDataSummary,
      actionStepExecuted: true
    };
  }

  /**
   * NODE 4: Specialist Agent Node (Multi-Model Deep Reasoning)
   */
  async specialistNode(state) {
    const { message, intent, contextSummary, activeHistory, currentTopic, action, foundDataSummary, user, dashboardOverview, examContext } = state;

    // Define Specialized Agent System Prompts based on Intent & Security Scoping
    let agentRolePrompt = `You are Gogo, a friendly, encouraging, and super-smart AI Voice Tutor for students (ages 5 to 14).
SECURITY BOUNDARY: You are assisting ${user?.name || 'the student'} in Class ID: ${user?.class_id || 'Enrolled Class'}.
You ONLY have access to study concepts, questions, and topics that exist in the student's enrolled dashboard subjects/topics.
Allowed Subjects and Topics: [${dashboardOverview || 'All Cambridge Primary Subjects Stage 1 to 5'}]

Strict Rules:
1. You MUST NOT teach, explain, or discuss educational concepts or lessons that are NOT related to school learning.
2. Keep your answer clear, engaging, friendly, and under 100 words.`;

    if (examContext) {
      const allQuestionContent = `${examContext.questionText || ''} ${examContext.extractedText || ''}`;
      const isListeningTest = /listening|listen|part 1|audio/i.test(allQuestionContent);

      agentRolePrompt += `\n\n[ACTIVE EXAM / WORKSHEET SOCRATIC ASSISTANT MODE]:
The student is currently taking an exam or worksheet.
Active Question Details:
- Question #${examContext.questionNumber || 1}: "${examContext.questionText || 'Active Question'}"
${examContext.options ? `- Options: ${JSON.stringify(examContext.options)}` : ''}
${examContext.extractedText ? `- Extracted Image/PDF Text: "${examContext.extractedText}"` : ''}

${isListeningTest ? `🎧 DYNAMIC LISTENING & AUDIO TEST MODE ACTIVE:
1. Dynamically analyze the "Active Question Details".
2. Generate a realistic, child-friendly audio script/passage for Question #${examContext.questionNumber || 1} where ONE of the exact options is correct.
3. State the correct option letter (A, B, or C) with explanation!` : `SOCRATIC TUTOR GUIDANCE RULES:
1. Provide an encouraging HINT and explain the concept FIRST. Do NOT give away the direct answer option immediately.
2. If student explicitly asks for the answer, provide the step-by-step working and state the correct option!`}`;
    } else if (action) {
      agentRolePrompt += `\n[ACTION REQUIRED]: You are taking the student to their requested page (${action.label}). ${foundDataSummary} Warmly tell the student that you found it and are opening it right now!`;
    } else if (intent === 'QUIZ_OR_PRACTICE') {
      agentRolePrompt += `\nProvide 1 fun practice question or mini-challenge based on ${currentTopic}, and ask the student to give their answer!`;
    } else if (intent === 'CODE_OR_MATH') {
      agentRolePrompt += `\nBreak down the math or logic problem into crystal clear, simple steps!`;
    } else if (intent === 'OUT_OF_BOUNDS') {
      agentRolePrompt += `\nPolitely guide the student back to educational topics with a warm smile!`;
    }

    const systemInstruction = `${agentRolePrompt}\n\n[STATE GRAPH MEMORY & TOOL DATA]: ${contextSummary} ${foundDataSummary}`;
    const payload = [
      { role: 'system', content: systemInstruction },
      ...activeHistory.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Dynamic Multi-Model Selector based on intent
    let primaryModel = process.env.GROQ_MODEL;
    if (!primaryModel) {
      if (intent === 'CODE_OR_MATH') {
        primaryModel = ACTIVE_MODELS.MATH_LOGIC;
      } else if (intent === 'CONCEPT_EXPLANATION' && message.length > 200) {
        primaryModel = ACTIVE_MODELS.DEEP_REASONING;
      } else {
        primaryModel = ACTIVE_MODELS.GENERAL_TUTOR;
      }
    }

    let rawResponse = '';
    let selectedModel = primaryModel;

    // Multi-tier Fallback Pipeline using active verified models
    const modelPipeline = [...new Set([
      primaryModel,
      ACTIVE_MODELS.GENERAL_TUTOR,
      ACTIVE_MODELS.DEEP_REASONING,
      ACTIVE_MODELS.MATH_LOGIC,
      ACTIVE_MODELS.FAST_ROUTER
    ])];

    for (const modelCandidate of modelPipeline) {
      try {
        rawResponse = await this.callGroq(modelCandidate, payload, 0.6, 350);
        if (rawResponse && rawResponse.length > 0) {
          selectedModel = modelCandidate;
          break;
        }
      } catch (err) {
        console.warn(`Groq Model (${modelCandidate}) failed: ${err.message}. Retrying fallback...`);
      }
    }

    // Safety fallback response if response is ever empty
    if (!rawResponse || rawResponse.length === 0) {
      rawResponse = "I'm Gogo, your AI Tutor! I'm ready to help you with your Cambridge Primary lessons. What would you like to explore?";
    }

    return {
      ...state,
      aiResponse: rawResponse,
      selectedModel,
      specialistStepExecuted: true
    };
  }

  /**
   * NODE 5: Voice Formatter & Metadata Synthesizer Node
   */
  async outputFormatterNode(state) {
    const { aiResponse, intent, selectedModel, currentTopic, isFollowUp, action } = state;

    return {
      success: true,
      response: aiResponse,
      agentMetadata: {
        intent,
        modelUsed: selectedModel,
        currentTopic,
        isFollowUp,
        action: action || null,
        graphNodesExecuted: ['RouterNode', 'MemoryNode', 'ActionToolNode', 'SpecialistNode', 'OutputFormatterNode']
      }
    };
  }

  /**
   * Execute State Graph Workflow Pipeline
   */
  async run(message, history = [], user = null, examContext = null) {
    let state = {
      message,
      history: Array.isArray(history) ? history : [],
      user,
      examContext,
      intent: null,
      currentTopic: null,
      isFollowUp: false,
      contextSummary: '',
      activeHistory: [],
      action: null,
      foundDataSummary: '',
      aiResponse: '',
      selectedModel: ''
    };

    state = await this.routerNode(state);
    state = await this.memoryNode(state);
    state = await this.actionToolNode(state);
    state = await this.specialistNode(state);
    return await this.outputFormatterNode(state);
  }
}

module.exports = AgenticTutorGraph;
