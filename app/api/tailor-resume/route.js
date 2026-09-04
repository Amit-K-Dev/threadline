import { NextResponse } from "next/server";
import {
  AIProvidersUnavailableError,
  generateWithFallback,
  parseJsonResponse,
} from "@/lib/ai";

function parseResumeResponse(value) {
  const isValid =
    value &&
    Array.isArray(value.tailoredBullets) &&
    value.tailoredBullets.every((bullet) => typeof bullet === "string") &&
    value.tailoredBullets.length > 0 &&
    typeof value.coverLetter === "string" &&
    value.coverLetter.trim() &&
    Array.isArray(value.matchNotes) &&
    value.matchNotes.every((note) => typeof note === "string");

  if (!isValid) {
    throw new Error("Response did not match the resume schema.");
  }

  return {
    tailoredBullets: value.tailoredBullets.map((bullet) => bullet.trim()).filter(Boolean),
    coverLetter: value.coverLetter.trim(),
    matchNotes: value.matchNotes.map((note) => note.trim()).filter(Boolean).slice(0, 4),
  };
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }
    const { jobDescription, resume } = body;

    if (
      typeof jobDescription !== "string" ||
      typeof resume !== "string" ||
      !jobDescription.trim() ||
      !resume.trim()
    ) {
      return NextResponse.json(
        { error: "Both a job description and your resume/background are required." },
        { status: 400 }
      );
    }

    if (jobDescription.length > 20_000 || resume.length > 20_000) {
      return NextResponse.json(
        { error: "Please keep each field under 20,000 characters." },
        { status: 400 }
      );
    }

    const system = `You tailor resumes and cover letters to a specific job description.
Rules:
- Never invent experience, employers, titles, or metrics the person did not provide.
- You may rephrase, reorder, and emphasize what they gave you to match the JD's language and priorities.
- Keep bullets concise (one line each) and results-oriented where the input supports it.
- Output ONLY valid JSON, no markdown fences, matching exactly this shape:
{"tailoredBullets": ["..."], "coverLetter": "...", "matchNotes": ["..."]}
- "matchNotes" is a short list (max 4) of what you emphasized and why it matches the JD.`;

    const userMessage = `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE BACKGROUND / CURRENT RESUME:\n${resume}`;

    const result = await generateWithFallback({
      prompt: userMessage,
      systemPrompt: system,
      maxTokens: 2000,
      validateResponse: (text) => parseJsonResponse(text, parseResumeResponse),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("tailor-resume error:", err);
    const unavailable = err instanceof AIProvidersUnavailableError;
    return NextResponse.json(
      {
        error: unavailable
          ? "AI generation is temporarily unavailable. Please try again shortly."
          : "Something went wrong generating your tailored resume.",
      },
      { status: unavailable ? 503 : 500 }
    );
  }
}
