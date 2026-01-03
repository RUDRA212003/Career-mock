// app/api/ai-feedback/route.jsx
import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { conversation } = await req.json();

    if (!conversation) {
      return NextResponse.json(
        { error: "No conversation provided" },
        { status: 400 }
      );
    }

    const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
      "{{conversation}}",
      typeof conversation === "string"
        ? conversation
        : JSON.stringify(conversation)
    );

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // ✅ STABLE & WORKING
      messages: [
        {
          role: "system",
          content:
            "You are an interview evaluator. Return structured, clear feedback.",
        },
        {
          role: "user",
          content: FINAL_PROMPT,
        },
      ],
      temperature: 0.3,
    });

    const feedback = completion.choices?.[0]?.message?.content;

    if (!feedback) {
      throw new Error("Empty feedback from LLM");
    }

    return NextResponse.json({ content: feedback });
  } catch (error) {
    console.error("🔥 AI FEEDBACK ERROR:", error);

    return NextResponse.json(
      { error: "Feedback generation failed" },
      { status: 500 }
    );
  }
}
