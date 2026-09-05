"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function HistoryPage() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error("Failed to load history.");
        const data = await res.json();
        setGenerations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getPreview = (gen) => {
    try {
      const output = JSON.parse(gen.output);
      if (gen.type === "resume") {
        return output.coverLetter?.substring(0, 150) + "...";
      } else if (gen.type === "linkedin_post") {
        return output.post?.substring(0, 150) + "...";
      }
    } catch {
      return "Unable to parse preview.";
    }
    return "No preview available.";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-bone-100 mb-2">History</h1>
          <p className="text-bone-400">
            Your saved cover letters and LinkedIn posts.
          </p>
        </div>

        {loading ? (
          <div className="text-bone-400 animate-pulse">Loading history...</div>
        ) : error ? (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        ) : generations.length === 0 ? (
          <div className="p-8 text-center bg-graphite-800 rounded-lg border border-graphite-700">
            <p className="text-bone-400">No generations saved yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="bg-graphite-800 border border-graphite-700 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono tracking-widest text-redline uppercase">
                    {gen.type === "resume" ? "Cover Letter" : "LinkedIn Post"}
                  </span>
                  <span className="text-xs text-bone-500">
                    {formatDate(gen.createdAt)}
                  </span>
                </div>
                <div className="bg-graphite-900 rounded border border-graphite-700 p-4 relative group">
                  <p className="text-bone-300 text-sm whitespace-pre-wrap font-mono">
                    {getPreview(gen)}
                  </p>
                  
                  {/* Expanded details could go here, but for now we show preview */}
                  <details className="mt-4 text-sm text-bone-100">
                    <summary className="cursor-pointer text-redline hover:text-redline-dim outline-none">
                      View full output
                    </summary>
                    <div className="mt-4 pt-4 border-t border-graphite-700">
                      <pre className="whitespace-pre-wrap font-mono text-xs text-bone-300 bg-graphite-950 p-4 rounded overflow-x-auto">
                        {(() => {
                          try {
                            const parsed = JSON.parse(gen.output);
                            return JSON.stringify(parsed, null, 2);
                          } catch {
                            return gen.output;
                          }
                        })()}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
