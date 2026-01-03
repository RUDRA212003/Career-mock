// app/api/ai-feedback/route.jsx
import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { conversation } = await req.json();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation missing" },
        { status: 400 }
      );
    }

    const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
      "{{conversation}}",
      JSON.stringify(conversation)
    );

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1",
      messages: [
        {
          role: "user",
          content: FINAL_PROMPT,
        },
      ],
    });

    const feedbackText =
      completion?.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      content: feedbackText, // ✅ IMPORTANT
    });
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return NextResponse.json(
      { error: "Feedback generation failed" },
      { status: 500 }
    );
  }
}
