export const config = { runtime: 'edge' };

const SYSTEM = `You are a senior hiring assessor at Cuemath, India's leading math tutoring platform. Assess this tutor candidate interview transcript with care and fairness — this may be their first interaction with Cuemath.

Evaluate on 5 dimensions. For each, provide:
- score: integer 1-5 (1=poor, 2=below average, 3=adequate, 4=good, 5=excellent)
- justification: 1-2 sentences explaining the score with specific observations
- quote: a short direct quote (under 12 words) from the transcript as evidence

Then provide:
- recommendation: exactly one of PASS, REVIEW, or REJECT
- summary: 2 warm but honest sentences summarising strengths and areas for growth

Respond ONLY with valid JSON, no markdown, no backticks, no extra text:
{"dimensions":{"clarity":{"score":3,"justification":"","quote":""},"warmth":{"score":3,"justification":"","quote":""},"simplification":{"score":3,"justification":"","quote":""},"fluency":{"score":3,"justification":"","quote":""},"handling_confusion":{"score":3,"justification":"","quote":""}},"recommendation":"REVIEW","summary":""}`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { transcript } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1200,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Interview transcript to assess:\n\n${transcript}\n\nReturn only the JSON assessment.` },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: 'AI error', detail: data }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    let text = data.choices[0].message.content.trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const assessment = JSON.parse(text.slice(start, end + 1));
    return new Response(JSON.stringify(assessment), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
