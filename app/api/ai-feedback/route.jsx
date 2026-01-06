// app/api/ai-feedback/route.jsx
import { FEEDBACK_PROMPT } from "@/services/Constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { conversation } = await req.json();
    console.debug("[ai-feedback] Received request, conversation length:",
      conversation ? (typeof conversation === 'string' ? conversation.length : JSON.stringify(conversation).length) : 0
    );

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

    console.debug("[ai-feedback] Raw LLM feedback:", feedback);

    if (!feedback) {
      console.error("[ai-feedback] Empty feedback from LLM response", completion);
      throw new Error("Empty feedback from LLM");
    }

    // Try to parse the assistant content as JSON to return structured data to the client.
    let parsed = null;
    try {
      parsed = JSON.parse(feedback);
      console.debug("[ai-feedback] Parsed feedback JSON successfully");
    } catch (e) {
      console.warn("[ai-feedback] Feedback is not valid JSON, returning raw string");
    }

    return NextResponse.json({ content: parsed ?? feedback, raw: feedback, parsed: !!parsed });
  } catch (error) {
    console.error("🔥 AI FEEDBACK ERROR:", error);

    return NextResponse.json(
      { error: "Feedback generation failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
