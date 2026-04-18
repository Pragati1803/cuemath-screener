export const config = { runtime: 'edge' };

const MATH_QUESTIONS = [
  "Can you walk me through how you'd explain fractions to a 9-year-old who has never heard the term before?",
  "How would you teach the concept of negative numbers to a student who finds it confusing?",
  "A student keeps making the same mistake in long division. How do you help them without making them feel bad?",
  "How would you explain the Pythagoras theorem to a 12-year-old using a real-life example?",
  "How do you make multiplication tables fun and engaging for a child who dreads them?",
  "A student says they hate word problems. How do you change their mindset about them?",
  "How would you explain what a percentage is to a 10-year-old using something from daily life?",
  "How do you teach algebra to a student who struggles with abstract thinking?",
  "A student understands concepts in class but blanks out during tests. What do you do?",
  "How would you explain the concept of zero and why it matters to a young child?",
  "A parent calls saying their child is losing confidence in maths. How do you handle that conversation?",
  "How do you approach a student who says 'I'm just not a maths person'?",
  "How would you make geometry feel exciting rather than just formulas and shapes?",
  "How do you explain ratio and proportion using something a child already loves — like food or games?",
  "A student finishes quickly and gets bored. How do you keep them challenged without overwhelming others?",
];

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const { messages, candidate } = await req.json();
    const questions = pickRandom(MATH_QUESTIONS, 5);
    const qList = questions.map((q, i) => `Question ${i + 1}: ${q}`).join('\n');

    const SYSTEM = `You are Aria, a warm, encouraging AI interviewer for Cuemath — India's leading math tutoring platform. You are interviewing ${candidate?.name || 'the candidate'} for a Mathematics tutor position.

Candidate details:
- Name: ${candidate?.name || 'Candidate'}
- Class level they want to teach: ${candidate?.classLevel || 'Not specified'}
- Preferred board: ${candidate?.board || 'Not specified'}
- Languages: ${candidate?.languages?.join(', ') || 'Not specified'}
- Experience: ${candidate?.experience || 'Not specified'}
- Expected rate: ₹${candidate?.rate || 'Not specified'}/month

You have exactly 5 questions to ask, one at a time:
${qList}

YOUR RULES:
1. Start with a warm, personal greeting using their name and mention you're excited to learn about their teaching style for ${candidate?.classLevel || 'students'}.
2. Ask ONE question at a time. Never list multiple questions.
3. After each answer, briefly acknowledge what they said (1 sentence), then move to the next question naturally.
4. If an answer is very short or vague, say something like "That's interesting — could you give me a specific example of how you'd do that?"
5. After they answer all 5 questions, give a warm closing: "That's all my questions, ${candidate?.name?.split(' ')[0] || 'friend'}! It was truly wonderful speaking with you today. We'll review your interview and be in touch soon. Best of luck — you've got this! 🌟"
6. Keep YOUR responses to 2-3 short sentences max. You are speaking aloud.
7. Never use bullet points, lists, or numbered items.
8. Be warm, human, encouraging — like a kind senior colleague, not a robot.
9. Never discuss salary, rate, or HR matters.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        temperature: 0.75,
        messages: [{ role: 'system', content: SYSTEM }, ...messages],
      }),
    });

    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: 'AI error', detail: data }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
