/**
 * Agentic State Graph AI Voice Tutor Engine
 * Inspired by LangGraph StateGraph design patterns.
 * 
 * Pipeline Nodes:
 * 1. RouterNode (Intent & Context Classification using llama-3.1-8b-instant)
 * 2. MemoryNode (State Graph Context & Memory Synthesizer)
 * 3. ActionToolNode (Class-Scoped Database Search & Navigation Tool Node)
 * 4. SpecialistNode (Deep Educational Reasoning using llama-3.3-70b-versatile)
 * 5. OutputFormatterNode (Voice, Action & Agent Metadata Synthesizer)
 */

const db = require('../config/db');

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

  // Helper method for Groq API calls
  async callGroq(model, messages, temperature = 0.5, maxTokens = 200) {
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

    return data.choices?.[0]?.message?.content?.trim() || '';
  }

  // Semantic search matching using llama-3.1-8b-instant
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
      const rawResult = await this.callGroq('llama-3.1-8b-instant', messages, 0.1, 80);
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
   * Fast execution using llama-3.1-8b-instant
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
      const rawResult = await this.callGroq('llama-3.1-8b-instant', routerMessages, 0.2, 100);
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
      console.warn('RouterNode fallback used:', err.message);
      return {
        ...state,
        intent: history.length > 0 ? 'FOLLOW_UP' : 'CONCEPT_EXPLANATION',
        currentTopic: 'Learning Topic',
        isFollowUp: history.length > 0,
        routerStepExecuted: false
      };
    }
  }

  /**
   * NODE 2: Memory & Context Synthesizer Node
   * Prepares focused conversation state context
   */
  async memoryNode(state) {
    const { history, currentTopic, user } = state;

    const recentTurns = history.slice(-10);

    let contextSummary = '';
    if (recentTurns.length > 0) {
      const topicsDiscussed = recentTurns
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' | ');
      contextSummary = `Active Study Context: Previously discussed [${topicsDiscussed}]. Current Topic Focus: [${currentTopic}].`;
    } else {
      contextSummary = `Starting new conversation session on [${currentTopic}].`;
    }

    let dashboardOverview = 'No topics loaded.';
    if (user && user.class_id) {
      try {
        const { rows } = await db.query(
          `SELECT s.name AS subject_name, t.name AS topic_name
           FROM subjects s
           LEFT JOIN topics t ON t.subject_id = s.id
           WHERE s.class_id = $1
           ORDER BY s.name, t.name`,
          [user.class_id]
        );

        if (rows.length > 0) {
          const subjectsMap = {};
          rows.forEach(r => {
            if (!subjectsMap[r.subject_name]) {
              subjectsMap[r.subject_name] = [];
            }
            if (r.topic_name) {
              subjectsMap[r.subject_name].push(r.topic_name);
            }
          });

          dashboardOverview = Object.entries(subjectsMap)
            .map(([sub, tops]) => `${sub} (${tops.length > 0 ? tops.join(', ') : 'No topics yet'})`)
            .join(' | ');
        }
      } catch (dbErr) {
        console.error('Error fetching dashboard overview for memoryNode:', dbErr.message);
      }
    }

    return {
      ...state,
      contextSummary,
      activeHistory: recentTurns,
      dashboardOverview,
      memoryStepExecuted: true
    };
  }

  /**
   * NODE 3: Action & Database Search Tool Node
   * STRICT SECURITY ISOLATION: Strictly queries items scoped to req.user.class_id
   */
  async actionToolNode(state) {
    const { message, intent, user, examContext } = state;

    // SECURITY & OVERRIDE RULE: If the student is inside an ACTIVE EXAM or WORKSHEET, NEVER perform navigation actions!
    if (examContext) {
      return {
        ...state,
        action: null,
        foundDataSummary: `ACTIVE EXAM MODE: Student is currently taking Question #${examContext.questionNumber || 1}. Navigation disabled during active exam.`,
        actionStepExecuted: true
      };
    }

    let action = null;
    let foundDataSummary = '';

    const msgLower = message.toLowerCase();
    const isExamQuery = msgLower.includes('exam') || msgLower.includes('test') || msgLower.includes('quiz');
    const isWorksheetQuery = msgLower.includes('worksheet') || msgLower.includes('material') || msgLower.includes('note') || msgLower.includes('course') || msgLower.includes('subject') || msgLower.includes('simul') || msgLower.includes('game') || msgLower.includes('video') || msgLower.includes('play') || msgLower.includes('sheet') || msgLower.includes('resource');
    const isCertificateQuery = msgLower.includes('certificate');
    const isProfileQuery = msgLower.includes('profile') || msgLower.includes('setting');
    const isExploreQuery = msgLower.includes('explore');

    // Only run database tool actions if intent matches or navigation keywords detected
    if (intent === 'SEARCH_AND_NAVIGATE' || isExamQuery || isWorksheetQuery || isCertificateQuery || isProfileQuery || isExploreQuery) {

      // Certificate section navigation
      if (isCertificateQuery) {
        action = {
          type: 'NAVIGATE',
          url: user?.role === 'student' ? '/student/certificates' : '/admin/certificates',
          label: 'Opening Earned Certificates'
        };
        foundDataSummary = 'Navigating to Earned Certificates section.';
      }
      // Profile navigation
      else if (isProfileQuery) {
        action = {
          type: 'NAVIGATE',
          url: user?.role === 'student' ? '/student/profile' : '/profile',
          label: 'Opening Profile Settings'
        };
        foundDataSummary = 'Navigating to Profile Settings.';
      }
      // Explore section navigation
      else if (isExploreQuery) {
        action = {
          type: 'NAVIGATE',
          url: user?.role === 'student' ? '/student/dashboard' : '/explore',
          label: 'Opening Explore Content'
        };
        foundDataSummary = 'Navigating to Explore page.';
      }
      // Exam Search (STRICT CLASS-LEVEL & USER-LEVEL ISOLATION)
      else if (isExamQuery) {
        if (user && user.class_id) {
          try {
            // SQL Query strictly filtered by s.class_id = user.class_id
            const { rows } = await db.query(
              `SELECT e.id, e.title, e.description, s.name AS subject_name, t.name AS topic_name, e.status
               FROM exams e
               JOIN subjects s ON s.id = e.subject_id
               LEFT JOIN topics t ON t.id = e.topic_id
               WHERE s.class_id = $1
                 AND e.status IN ('live', 'scheduled', 'ended')
               ORDER BY e.created_at DESC`,
              [user.class_id]
            );
            const targetExamUrl = user?.role === 'student' 
              ? '/student/dashboard'
              : (user?.role === 'admin' ? '/admin/exams' : '/exams');

            let matchedExam = null;
            if (rows.length > 0) {
              matchedExam = await this.matchContentWithLLM(message, rows, 'exam') || rows[0];

              if (matchedExam) {
                action = {
                  type: 'NAVIGATE',
                  url: targetExamUrl,
                  label: `Opening ${matchedExam.title}`,
                  subject: matchedExam.subject_name,
                  topic: matchedExam.topic_name || null,
                  tab: 'exams',
                  matchedItem: matchedExam.title
                };
                foundDataSummary = `MATCH FOUND IN CLASS DASHBOARD: Found Exam "${matchedExam.title}" under Subject "${matchedExam.subject_name}". Status: ${matchedExam.status}.`;
              } else {
                action = {
                  type: 'NAVIGATE',
                  url: targetExamUrl,
                  label: 'Opening Available Exams Portal'
                };
                foundDataSummary = `Exams available for Class: [${rows.map(r => r.title).join(', ')}]. Navigating to Exams Portal.`;
              }
            } else {
              foundDataSummary = `No active exams currently posted in the dashboard for Class ID: ${user.class_id}.`;
              action = {
                type: 'NAVIGATE',
                url: targetExamUrl,
                label: 'Opening Exams Portal'
              };
            }
          } catch (dbErr) {
            console.error('ActionToolNode exam query error:', dbErr.message);
            action = { type: 'NAVIGATE', url: user?.role === 'student' ? '/student/dashboard' : '/exams', label: 'Opening Exams' };
          }
        } else {
          action = { type: 'NAVIGATE', url: user?.role === 'student' ? '/student/dashboard' : '/exams', label: 'Opening Exams' };
          foundDataSummary = 'User has no class assigned. Opening Exams portal.';
        }
      }
      // Course / Worksheet / Resource Search (STRICT CLASS-LEVEL ISOLATION)
      else if (isWorksheetQuery) {
        let requestedTab = 'worksheets';
        let contentTypes = ['worksheet'];
        if (msgLower.includes('simul')) {
          requestedTab = 'simulators';
          contentTypes = ['animation'];
        } else if (msgLower.includes('note') || msgLower.includes('video')) {
          requestedTab = 'notes';
          contentTypes = ['note', 'video'];
        }

        // Extract subject keyword from message if present
        let detectedSubject = null;
        if (msgLower.includes('science')) detectedSubject = 'Science';
        else if (msgLower.includes('math')) detectedSubject = 'Math';
        else if (msgLower.includes('english')) detectedSubject = 'English';
        else if (msgLower.includes('global') || msgLower.includes('perspective')) detectedSubject = 'Global Perspectives';

        if (user && user.class_id) {
          try {
            const { rows } = await db.query(
              `SELECT c.id, c.title, c.content_type, s.name AS subject_name, t.name AS topic_name
               FROM content c
               JOIN topics t ON t.id = c.topic_id
               JOIN subjects s ON s.id = t.subject_id
               WHERE s.class_id = $1
                 AND c.content_type = ANY($3)
               ORDER BY 
                 CASE 
                   WHEN s.name ILIKE $2 THEN 1
                   ELSE 2
                 END, c.created_at DESC
               LIMIT 100`,
              [user.class_id, `%${detectedSubject || ''}%`, contentTypes]
            );

            const matchedContent = await this.matchContentWithLLM(message, rows, requestedTab) || rows[0];

            const finalSubject = matchedContent?.subject_name || detectedSubject || 'Science';

            const tabLabelMap = {
              worksheets: 'Worksheets',
              simulators: 'Simulations',
              notes: 'Study Guides'
            };

            action = {
              type: 'NAVIGATE',
              url: user?.role === 'student' ? '/student/dashboard' : (user?.role === 'admin' ? '/admin/curriculum' : '/courses'),
              label: `Opening ${finalSubject} ${tabLabelMap[requestedTab] || 'Worksheets'}`,
              subject: finalSubject,
              topic: matchedContent?.topic_name || null,
              tab: requestedTab,
              matchedItem: matchedContent?.title || null
            };
            foundDataSummary = `FOUND IN CLASS DASHBOARD: ${tabLabelMap[requestedTab] || 'Resource'} "${matchedContent?.title || ''}" in Subject "${finalSubject}".`;
          } catch (dbErr) {
            console.error('ActionToolNode course query error:', dbErr.message);
            action = {
              type: 'NAVIGATE',
              url: user?.role === 'student' ? '/student/dashboard' : '/courses',
              label: `Opening ${detectedSubject || 'Science'} Worksheets`,
              subject: detectedSubject || 'Science',
              tab: requestedTab
            };
          }
        } else {
          action = {
            type: 'NAVIGATE',
            url: user?.role === 'student' ? '/student/dashboard' : '/courses',
            label: `Opening ${detectedSubject || 'Science'} Worksheets`,
            subject: detectedSubject || 'Science',
            tab: requestedTab
          };
        }
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
   * NODE 4: Specialist Agent Node (Deep Reasoning)
   * Executes using llama-3.3-70b-versatile with tailored agent persona
   */
  async specialistNode(state) {
    const { message, intent, contextSummary, activeHistory, currentTopic, action, foundDataSummary, user, dashboardOverview, examContext } = state;

    // Define Specialized Agent System Prompts based on Intent & Security Scoping
    let agentRolePrompt = `You are Gogo, a friendly, encouraging, and super-smart AI Voice Tutor for students (ages 5 to 14).
SECURITY BOUNDARY: You are assisting ${user?.name || 'the student'} in Class ID: ${user?.class_id || 'Enrolled Class'}.
You ONLY have access to study concepts, questions, and topics that exist in the student's enrolled dashboard subjects/topics.
Allowed Subjects and Topics: [${dashboardOverview || 'No subjects allocated'}]

Strict Rules:
1. You MUST NOT teach, explain, or discuss educational concepts or lessons that are NOT related to the subjects and topics listed under "Allowed Subjects and Topics".
2. If the student asks about a concept, topic, or subject NOT present in the allowed list, you must politely decline and state that you are only allowed to teach them lessons from their active classroom dashboard. Recommend one of their allowed subjects.
3. You can reply warmly to general greetings or conversational small talk (e.g. "hello", "how are you", "thank you") without declining.
4. Keep your answer clear, engaging, friendly, and under 100 words.`;

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
You are dynamically analyzing a Cambridge Primary Listening/Audio test question from the student's active screen.

PURELY DYNAMIC AI INSTRUCTIONS:
1. Dynamically analyze the "Active Question Details" (Question Text, Options, and Extracted Image/PDF Text).
2. Dynamically identify the specific active question prompt (e.g. Question #${examContext.questionNumber || 1}) and its options (A, B, C).
3. Generate a realistic, child-friendly audio script/passage for Question #${examContext.questionNumber || 1} where ONE of the exact options dynamically present in the active question is the correct answer.
4. DO NOT invent objects, characters, or options that do not exist in the active question details.
5. When asked "which option" or for the answer, dynamically identify and state the exact correct option letter (A, B, or C) with a clear explanation!` : `SOCRATIC TUTOR GUIDANCE RULES:
1. When the student asks for help, concept explanation, or a hint, ALWAYS provide an encouraging HINT and explain the concept FIRST. Do NOT give away the direct answer option immediately.
2. Encourage the student to give it a try with the hint.
3. IF AND ONLY IF the student explicitly asks for the answer (e.g., "tell me the answer of 1st one", "what is the answer", "tell me answer", "give me the answer"), OR says they are completely stuck, provide the full step-by-step working and state the correct option/answer clearly!`}`;
    } else if (action) {
      agentRolePrompt += `\n[ACTION REQUIRED]: You are automatically taking the student to their requested dashboard page (${action.label}). ${foundDataSummary} Warmly tell the student that you found it in their dashboard and are opening it right now!`;
    } else if (intent === 'QUIZ_OR_PRACTICE') {
      agentRolePrompt += `\nProvide 1 fun practice question or mini-challenge based on ${currentTopic}, and ask the student to give their answer!`;
    } else if (intent === 'CODE_OR_MATH') {
      agentRolePrompt += `\nBreak down the math or logic problem into crystal clear, simple steps!`;
    } else if (intent === 'OUT_OF_BOUNDS') {
      agentRolePrompt += `\nPolitely guide the student back to educational and school topics with a warm smile!`;
    }

    // Assemble state graph messages payload
    const systemInstruction = `${agentRolePrompt}\n\n[STATE GRAPH MEMORY & TOOL DATA]: ${contextSummary} ${foundDataSummary}`;
    const payload = [
      { role: 'system', content: systemInstruction },
      ...activeHistory.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const modelToUse = 'llama-3.3-70b-versatile';
    const rawResponse = await this.callGroq(modelToUse, payload, 0.6, 220);

    return {
      ...state,
      aiResponse: rawResponse,
      selectedModel: modelToUse,
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

    // Step 1: Router Node
    state = await this.routerNode(state);

    // Step 2: Memory Node
    state = await this.memoryNode(state);

    // Step 3: Action & Class-Scoped Database Tool Node
    state = await this.actionToolNode(state);

    // Step 4: Specialist Agent Node
    state = await this.specialistNode(state);

    // Step 5: Output Formatter Node
    return await this.outputFormatterNode(state);
  }
}

module.exports = AgenticTutorGraph;
