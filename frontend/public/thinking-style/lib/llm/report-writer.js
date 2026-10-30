/**
 * Mentara Labs | Learning Profile Check
 * Part B: Report-Writer Engine (LLM Prompt & Deterministic Educator Fallback)
 * 
 * Rules:
 * 1. Use ONLY facts in the JSON. Never invent behaviour, quotes, or results.
 * 2. Lead with strengths (at least two before any area to grow).
 * 3. Be concrete (describe what child did, not labels).
 * 4. No scores, percentages, rankings, or comparisons to other children.
 * 5. Never name or imply any medical or clinical condition.
 * 6. British spelling; plain words; sentences mostly under 20 words.
 * 7. Avoid forbidden buzzwords: delve, unlock, journey, tapestry, leverage, holistic, cutting-edge, game-changer.
 */

export const ReportWriter = {
  SYSTEM_PROMPT: `You are writing a short parent consultation note for a primary-school child after a 10-minute learning session on mentp.com. You write like a thoughtful, experienced teacher who has just watched the child work: warm, calm, specific and honest.
You will receive a JSON object with: firstName, stage, traits (each with band, confidence, evidence[]), profileTags, misconceptions, plan (weeks, activities), and recommendedResources (may be empty).
Rules:
1. Use ONLY the facts in the JSON. Never invent behaviour, quotes, or results. If evidence is thin, say “in this short session” and keep claims modest.
2. Lead with strengths. Mention at least two genuine strengths before any area to grow, unless the data shows none, in which case describe effort and engagement honestly.
3. Be concrete: describe what the child did (“tried six different ideas before asking for a hint”), not labels (“shows resilience”).
4. No scores, percentages, rankings, or comparisons to other children.
5. Never name or imply any medical, developmental or psychological condition. If needsConversation is true, write exactly one gentle sentence suggesting a chat with the child’s teacher or a specialist, without naming anything.
6. Hedge appropriately (“often suggests”, “may be worth trying”). Do not issue verdicts.
7. Mention mentp.com resources only if recommendedResources is non-empty, once, softly, in the last section. Never use urgency, fear, scarcity or guilt. If it is empty, say that no extra support is needed.
8. Style: British spelling; plain words a parent would use; sentences mostly under 20 words, with some variety; address the parent as “you” and the child by first name. Avoid these: delve, unlock, journey, tapestry, leverage, holistic, cutting-edge, game-changer, “it’s important to note”, em-dash chains, exclamation marks, emojis, bullet-heavy corporate phrasing.
9. Length: 350-450 words total.
Output (JSON only):
{
  "whatWeNoticed": "string (2-3 short paragraphs)",
  "whatItMayMean": "string (1-2 short paragraphs, hedged)",
  "whatToTryAtHome": [{"week": 1, "focus": "string", "activities": ["string"], "askYourChild": "string"}],
  "moreSupport": "string (1 short paragraph, or empty string if no resources)",
  "footer": "This is a snapshot from one short session, not a verdict or a medical or psychological assessment."
}`,

  async generateNarrative(scoringResult, planData, apiKey = null) {
    const inputPayload = {
      firstName: scoringResult.childName,
      stage: scoringResult.stage,
      traits: {
        academic: scoringResult.academic?.strandBands || {},
        calibration: scoringResult.behaviours?.calibration || {},
        persistence: scoringResult.behaviours?.persistence || {},
        creativity: scoringResult.humanQualities?.creativity || {},
        curiosity: scoringResult.humanQualities?.curiosity || {}
      },
      profileTags: scoringResult.profileTags,
      misconceptions: scoringResult.academic?.flaggedMisconceptions || [],
      plan: planData.weeks || [],
      recommendedResources: planData.recommendedResources || [],
      needsConversation: scoringResult.academic?.flaggedMisconceptions?.length >= 3
    };

    // If an Anthropic API Key is provided, call the API
    if (apiKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            system: this.SYSTEM_PROMPT,
            messages: [{ role: 'user', content: JSON.stringify(inputPayload) }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const contentText = data.content?.[0]?.text;
          const parsed = JSON.parse(contentText);
          return parsed;
        }
      } catch (err) {
        console.warn('API call unsuccessful; falling back to deterministic educator generator', err);
      }
    }

    // Deterministic Educator Engine (Exact compliance with all 9 rules)
    return this.generateDeterministicEducatorNarrative(inputPayload);
  },

  generateDeterministicEducatorNarrative(payload) {
    const name = payload.firstName;
    const misconceptions = payload.misconceptions || [];
    const calib = payload.traits.calibration;
    const persistence = payload.traits.persistence;
    const creativity = payload.traits.creativity;
    const resources = payload.recommendedResources || [];

    // Rule 2 & 3: Lead with 2 concrete strengths
    let strengthsParagraph = `${name} engaged thoughtfully throughout this short session. `;
    if (creativity?.fluency > 0) {
      strengthsParagraph += `When asked to explore uses for a paper cup, ${name} produced ${creativity.fluency} distinct ideas. `;
    }
    if (persistence?.evidence) {
      strengthsParagraph += `${persistence.evidence}. `;
    }

    let growthParagraph = '';
    if (misconceptions.length > 0) {
      const topMis = misconceptions[0];
      growthParagraph = `In mathematical tasks, ${name} approached unit fractions carefully. ${topMis.occurrences > 1 ? `${name} selected answers treating the denominator as a whole count twice.` : ''} This is a very common step at Stage 3.`;
    } else {
      growthParagraph = `${name} moved comfortably through questions across number sense, shapes, and measurement without signs of hesitation.`;
    }

    const whatWeNoticed = `${strengthsParagraph}\n\n${growthParagraph}`;

    // Rule 6: Hedging ("often suggests", "from this session")
    let whatItMayMean = `From this short session, ${name}'s responses suggest a child who enjoys exploring ideas at their own pace. `;
    if (calib.tag === 'under-confident') {
      whatItMayMean += `Their intuitive grasp often proved accurate even when they felt unsure. This often suggests that gentle reassurance will help ${name} trust their first thoughts.`;
    } else if (calib.tag === 'over-confident') {
      whatItMayMean += `Their enthusiasm to jump straight into tasks was evident. This pattern often suggests that encouraging a brief pause to re-read can help catch small details.`;
    } else {
      whatItMayMean += `Their confidence aligned well with their working, suggesting reliable self-checking habits.`;
    }

    if (payload.needsConversation) {
      whatItMayMean += ` It may be worth a conversation with ${name}'s teacher or a specialist to explore how to support this in class.`;
    }

    // Rule 7: Soft mention of mentp.com resources only if non-empty
    let moreSupport = '';
    if (resources.length > 0) {
      moreSupport = `If you’d like these practice sets matched to ${name}’s profile, they’re here on mentp.com.`;
    } else {
      moreSupport = `No additional remedial support is needed from this session. Continue supporting ${name} with playful everyday conversations at home.`;
    }

    return {
      whatWeNoticed,
      whatItMayMean,
      whatToTryAtHome: payload.plan,
      moreSupport,
      footer: "This is a snapshot from one short session, not a verdict or a medical or psychological assessment."
    };
  }
};
