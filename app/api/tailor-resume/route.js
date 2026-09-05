import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Type } from "@google/genai";
import { db } from "@/lib/db";
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Check usage limits
    const userRecord = await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: "placeholder@example.com", // Since Clerk doesn't pass email easily here, we just use placeholder or fetch via Clerk SDK later
      },
    });

    if (userRecord.subscriptionTier === "free" && userRecord.freeGenerationsUsed >= 2) {
      return NextResponse.json(
        { error: "Free generations limit reached." },
        { status: 403 }
      );
    }

    // Rate limiting: prevent abuse by limiting to 10 requests per rolling hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentGenerationsCount = await db.generation.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentGenerationsCount >= 10) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can only generate 10 items per hour." },
        { status: 429 }
      );
    }

    const system = `You tailor resumes and cover letters to a specific job description.
Rules:
- Never invent experience, employers, titles, or metrics the person did not provide.
- You may rephrase, reorder, and emphasize what they gave you to match the JD's language and priorities.
- Keep bullets concise (one line each) and results-oriented where the input supports it.
- Output ONLY valid JSON matching exactly this shape:
{"tailoredBullets": ["..."], "coverLetter": "...", "matchNotes": ["..."]}
- "matchNotes" is a short list (max 4) of what you emphasized and why it matches the JD.`;

    const userMessage = `JOB DESCRIPTION:\n${jobDescription}\n\nCANDIDATE BACKGROUND / CURRENT RESUME:\n${resume}`;

    const resumeSchema = {
      type: Type.OBJECT,
      properties: {
        tailoredBullets: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        coverLetter: {
          type: Type.STRING,
        },
        matchNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["tailoredBullets", "coverLetter", "matchNotes"],
    };

    const result = await generateWithFallback({
      prompt: userMessage,
      systemPrompt: system,
      maxTokens: 2000,
      schema: resumeSchema,
      validateResponse: (text) => parseJsonResponse(text, parseResumeResponse),
    });

    // Increment usage
    if (userRecord.subscriptionTier === "free") {
      await db.user.update({
        where: { id: userId },
        data: { freeGenerationsUsed: { increment: 1 } },
      });
    }

    // Save generation history
    await db.generation.create({
      data: {
        userId,
        type: "resume",
        input: JSON.stringify({ jobDescription, resume }),
        output: JSON.stringify(result),
      },
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
