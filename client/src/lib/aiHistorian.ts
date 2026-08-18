import { searchEntitiesServer } from './searchServer';
import type {
  AIHistorianResponse,
  AIHistorianCitation,
} from './types/database.types';

const userRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = userRateLimitMap.get(userId) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    userRateLimitMap.set(userId, validTimestamps);
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  userRateLimitMap.set(userId, validTimestamps);
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - validTimestamps.length,
  };
}

export function resetRateLimits() {
  userRateLimitMap.clear();
}

export async function queryAIHistorian(
  question: string,
  userId: string = 'anon-user'
): Promise<AIHistorianResponse> {
  const trimmed = question.trim();
  if (!trimmed) {
    return {
      answer: 'Please enter a valid historical question.',
      citations: [],
      refused: true,
      refusalReason: 'Empty question provided.',
    };
  }

  // 1. Rate Limit Check
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      answer:
        'Rate limit exceeded. To preserve server capacity, maximum 10 questions per 5-minute window are allowed.',
      citations: [],
      refused: true,
      refusalReason: 'Rate limit exceeded.',
    };
  }

  // 2. Retrieval Pass via Server Search
  const retrievedEntities = await searchEntitiesServer(trimmed, 6);

  // 3. Grounding Refusal if no relevant database entities found
  if (retrievedEntities.length === 0) {
    return {
      answer:
        'This topic is not covered in the current Atlas of Time dataset. As a grounded navigator, I only state facts directly backed by active database records.',
      citations: [],
      refused: true,
      refusalReason: 'No matching records in dataset.',
    };
  }

  // 4. Synthesize Grounded Answer & Citations
  const citations: AIHistorianCitation[] = retrievedEntities.map((e) => ({
    id: e.id,
    entityType: e.entityType,
    slug: e.slug,
    title: e.title,
    targetUrl: e.targetUrl,
  }));

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  let answerProse = '';

  if (apiKey && !apiKey.includes('placeholder')) {
    try {
      const contextText = retrievedEntities
        .map(
          (e) =>
            `Title: ${e.title}\nType: ${e.entityType}\nEra/Year: ${e.year}\nSummary: ${e.summary}`
        )
        .join('\n\n');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are Atlas of Time AI Historian, a grounded retrieval navigator over the historical database. Synthesize a concise, accurate answer strictly using only the provided database context records. Do not introduce outside facts not in the context. Format mentioned entity names with bold **Title**.',
            },
            {
              role: 'user',
              content: `Question: ${trimmed}\n\nRetrieved Database Context:\n${contextText}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const llmAnswer = json.choices?.[0]?.message?.content;
        if (llmAnswer) {
          answerProse = llmAnswer.trim();
        }
      }
    } catch {
      // Fallback gracefully on fetch error
    }
  }

  // Fallback to deterministic synthesis if LLM API is unavailable or unconfigured
  if (!answerProse) {
    const mainEntity = retrievedEntities[0];
    if (mainEntity.entityType === 'event') {
      answerProse = `Based on records in Atlas of Time, **${mainEntity.title}** (${mainEntity.year || 'Historic Era'}) — ${mainEntity.summary}`;
    } else if (mainEntity.entityType === 'person') {
      answerProse = `According to active entity records, **${mainEntity.title}** is documented in the knowledge graph as: ${mainEntity.summary}`;
    } else {
      answerProse = `Based on regional territory records, **${mainEntity.title}** is recorded as: ${mainEntity.summary}`;
    }

    if (retrievedEntities.length > 1) {
      const secondaryTitles = retrievedEntities
        .slice(1, 3)
        .map((e) => `**${e.title}**`)
        .join(', ');
      answerProse += ` Related dataset entries include ${secondaryTitles}.`;
    }
  }

  return {
    answer: answerProse,
    citations,
    refused: false,
  };
}
