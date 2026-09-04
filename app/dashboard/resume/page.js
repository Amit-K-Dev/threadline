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

export default function ResumeTool() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [blocked, setBlocked] = useState(false);
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
      const res = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume }),
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

  return (
    <>
      <Nav />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
          Tool 01
        </p>
        <h1 className="text-2xl font-semibold text-bone-100">
          Tailor resume + cover letter
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
              Upgrade to keep tailoring resumes for every application.
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
                Job description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                rows={6}
                placeholder="Paste the full job posting here..."
                className="w-full bg-graphite-800 border border-graphite-700 rounded-lg p-4 text-sm text-bone-100 placeholder:text-bone-400/60 focus-ring resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bone-100 mb-2">
                Your background / current resume
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                required
                rows={8}
                placeholder="Paste your resume, or just list your roles and what you did..."
                className="w-full bg-graphite-800 border border-graphite-700 rounded-lg p-4 text-sm text-bone-100 placeholder:text-bone-400/60 focus-ring resize-y"
              />
            </div>

            {error && <p className="text-redline text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-redline hover:bg-redline-dim disabled:opacity-50 text-graphite-950 font-medium rounded transition-colors focus-ring"
            >
              {loading ? "Tailoring..." : "Tailor it"}
            </button>
          </form>
        )}

        {result && (
          <div className="mt-10 space-y-8">
            <div>
              <h2 className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
                Tailored bullets
              </h2>
              <ul className="space-y-2">
                {result.tailoredBullets?.map((bullet, i) => (
                  <li
                    key={i}
                    className="bg-graphite-800 border border-graphite-700 rounded p-3 text-sm text-bone-100"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
                Cover letter
              </h2>
              <p className="bg-graphite-800 border border-graphite-700 rounded-lg p-5 text-sm text-bone-100 whitespace-pre-wrap leading-relaxed">
                {result.coverLetter}
              </p>
            </div>

            {result.matchNotes?.length > 0 && (
              <div>
                <h2 className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
                  Why this matches
                </h2>
                <ul className="text-sm text-bone-400 list-disc pl-5 space-y-1">
                  {result.matchNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
