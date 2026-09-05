"use client";

import { useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "Try it before you commit to a job search.",
    features: ["2 tailored generations total", "Resume + cover letter tool", "LinkedIn post tool"],
    cta: "Start free",
    href: "/dashboard",
    highlighted: false,
    action: null,
  },
  {
    name: "Job Search",
    price: "₹799",
    period: "/month",
    description: "For an active search — cancel once you land the role.",
    features: [
      "Unlimited tailored generations",
      "Resume + cover letter tool",
      "LinkedIn post tool",
      "Priority generation speed",
    ],
    cta: "Upgrade to Pro",
    href: null,
    highlighted: true,
    action: "checkout",
  },
  {
    name: "Always On",
    price: "₹1,499",
    period: "/month",
    description: "For consultants and freelancers applying continuously.",
    features: [
      "Everything in Job Search",
      "Saved story library",
      "Multiple resume versions",
    ],
    cta: "Coming soon",
    href: null,
    highlighted: false,
    action: null,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleCheckout = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-bone-100">Pricing</h1>
        <p className="text-bone-400 mt-2">
          Cancel anytime. No card required for the free tier.
        </p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-7 border flex flex-col ${
                plan.highlighted
                  ? "border-redline bg-graphite-800"
                  : "border-graphite-700 bg-graphite-800/60"
              }`}
            >
              {plan.highlighted && (
                <p className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
                  Most common
                </p>
              )}
              <h2 className="text-lg font-medium text-bone-100">
                {plan.name}
              </h2>
              <p className="mt-3">
                <span className="text-3xl font-semibold text-bone-100">
                  {plan.price}
                </span>
                <span className="text-bone-400 text-sm">{plan.period}</span>
              </p>
              <p className="text-sm text-bone-400 mt-2">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-sm text-bone-100 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-redline">—</span>
                    {f}
                  </li>
                ))}
              </ul>
              
              {plan.href ? (
                <a
                  href={plan.href}
                  className="mt-7 block text-center px-5 py-2.5 rounded font-medium transition-colors focus-ring border border-graphite-700 hover:border-bone-400 text-bone-100"
                >
                  {plan.cta}
                </a>
              ) : plan.action === "checkout" ? (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="mt-7 w-full text-center px-5 py-2.5 rounded font-medium transition-colors focus-ring bg-redline hover:bg-redline-dim text-graphite-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Redirecting..." : plan.cta}
                </button>
              ) : (
                <span
                  aria-disabled="true"
                  className="mt-7 block text-center px-5 py-2.5 rounded font-medium bg-graphite-700/60 text-bone-400 cursor-not-allowed"
                >
                  {plan.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
