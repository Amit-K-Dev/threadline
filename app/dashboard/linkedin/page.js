"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  hasFreeGenerationsLeft,
  recordGeneration,
  remainingFree,
} from "@/lib/usage";

const POST_TYPES = [
  { value: "achievement", label: "Achievement / project" },
  { value: "milestone", label: "Milestone (new role, promotion)" },
  { value: "open-to-work", label: "Open to work" },
];

export default function LinkedInTool() {
  const [background, setBackground] = useState("");
  const [postType, setPostType] = useState("achievement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(2);

  useEffect(() => {
    const id = setTimeout(() => {
      setRemaining(remainingFree());
      setBlocked(!hasFreeGenerationsLeft());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!hasFreeGenerationsLeft()) {
      setBlocked(true);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background, postType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
      const usage = recordGeneration();
      setRemaining(Math.max(0, 2 - usage.count));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.post) return;
    const hashtags = (result.hashtags || []).map((h) => `#${h}`).join(" ");
    try {
      await navigator.clipboard.writeText(`${result.post}\n\n${hashtags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy automatically. Please select and copy the draft.");
    }
  }

  return (
    <>
      <Nav />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
          Tool 02
        </p>
        <h1 className="text-2xl font-semibold text-bone-100">
          Write a LinkedIn post
        </h1>
        <p className="text-bone-400 mt-2 text-sm">
          {remaining} of 2 free generations left in this browser.
        </p>

        {blocked && (
          <div className="mt-6 bg-graphite-800 border border-redline/50 rounded-lg p-6">
            <p className="text-bone-100 font-medium">
              You&apos;ve used your free generations.
            </p>
            <p className="text-bone-400 text-sm mt-1">
              Upgrade to keep posting your story as it happens.
            </p>
            <Link
              href="/pricing"
              className="inline-block mt-4 px-5 py-2.5 bg-redline hover:bg-redline-dim text-graphite-950 font-medium rounded transition-colors focus-ring"
            >
              See pricing
            </Link>
          </div>
        )}

        {!blocked && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-bone-100 mb-2">
                Post type
              </label>
              <div className="flex flex-wrap gap-2">
                {POST_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setPostType(t.value)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors focus-ring ${
                      postType === t.value
                        ? "bg-redline border-redline text-graphite-950 font-medium"
                        : "border-graphite-700 text-bone-400 hover:border-bone-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bone-100 mb-2">
                What happened
              </label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                required
                rows={6}
                placeholder="e.g. Shipped a migration that cut deploy time 40%, led a 6-person team, learned a lot about..."
                className="w-full bg-graphite-800 border border-graphite-700 rounded-lg p-4 text-sm text-bone-100 placeholder:text-bone-400/60 focus-ring resize-y"
              />
            </div>

            {error && <p className="text-redline text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-redline hover:bg-redline-dim disabled:opacity-50 text-graphite-950 font-medium rounded transition-colors focus-ring"
            >
              {loading ? "Writing..." : "Write it"}
            </button>
          </form>
        )}

        {result && (
          <div className="mt-10">
            <h2 className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
              Draft post
            </h2>
            <p className="bg-graphite-800 border border-graphite-700 rounded-lg p-5 text-sm text-bone-100 whitespace-pre-wrap leading-relaxed">
              {result.post}
            </p>
            {result.hashtags?.length > 0 && (
              <p className="mt-3 text-sm text-signal">
                {result.hashtags.map((h) => `#${h}`).join("  ")}
              </p>
            )}
            <button
              onClick={handleCopy}
              className="mt-4 px-5 py-2.5 border border-graphite-700 hover:border-bone-400 text-bone-100 text-sm rounded transition-colors focus-ring"
            >
              {copied ? "Copied" : "Copy to clipboard"}
            </button>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
