import { NextResponse } from "next/server";
import {
  AIProvidersUnavailableError,
  generateWithFallback,
  parseJsonResponse,
} from "@/lib/ai";

function parsePostResponse(value) {
  const isValid =
    value &&
    typeof value.post === "string" &&
    value.post.trim() &&
    Array.isArray(value.hashtags) &&
    value.hashtags.every((tag) => typeof tag === "string");

  if (!isValid) {
    throw new Error("Response did not match the LinkedIn post schema.");
  }

  return {
    post: value.post.trim(),
    hashtags: value.hashtags
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean),
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
    const { background, postType } = body;

    if (typeof background !== "string" || !background.trim()) {
      return NextResponse.json(
        { error: "Tell us about the role, project, or achievement first." },
        { status: 400 }
      );
    }

    if (background.length > 20_000) {
      return NextResponse.json(
        { error: "Please keep the background under 20,000 characters." },
        { status: 400 }
      );
    }

    const typeLabel =
      {
        "open-to-work": "an 'open to work' post announcing a job search",
        achievement: "a post highlighting a specific achievement or project",
        milestone: "a post celebrating a career milestone (new role, promotion, anniversary)",
      }[postType] || "a career update post";

    const system = `You write short, specific LinkedIn posts in first person.
Rules:
- No invented facts — only use what's given.
- Avoid generic hustle-culture language ("thrilled to announce", "blessed", excessive emoji).
- Write like a person, not a press release. 80-160 words.
- Output ONLY valid JSON, no markdown fences: {"post": "...", "hashtags": ["..."]}
- hashtags: 3-5 relevant, lowercase, no # symbol in the string.`;

    const userMessage = `Write ${typeLabel}.\n\nBackground / details:\n${background}`;

    const result = await generateWithFallback({
      prompt: userMessage,
      systemPrompt: system,
      maxTokens: 800,
      validateResponse: (text) => parseJsonResponse(text, parsePostResponse),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("generate-post error:", err);
    const unavailable = err instanceof AIProvidersUnavailableError;
    return NextResponse.json(
      {
        error: unavailable
          ? "AI generation is temporarily unavailable. Please try again shortly."
          : "Something went wrong generating your post.",
      },
      { status: unavailable ? 503 : 500 }
    );
  }
}
