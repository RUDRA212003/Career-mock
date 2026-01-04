import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { jobPosition, jobDescription, duration, type } = await req.json();

    const FINAL_PROMPT = `
You are an expert interviewer AI.
Generate a JSON output with 10 interview questions for a ${jobPosition} role.
Job Description: ${jobDescription}
Duration: ${duration}
Type: ${type}
Output in this format:
\`\`\`json
{
  "interviewQuestions": [
    {"question": "string", "type": "behavioral"},
    {"question": "string", "type": "technical"}
  ]
}
\`\`\`
`;

    // ✅ Use GROQ API instead of OpenRouter
    const groq = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast & stable
      messages: [{ role: "user", content: FINAL_PROMPT }],
    });

    const content = completion.choices[0].message.content;
    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI Model Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
