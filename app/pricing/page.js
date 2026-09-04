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
    cta: "Coming soon",
    href: null,
    highlighted: true,
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
  },
];

export default function Pricing() {
  return (
    <>
      <Nav />
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-bone-100">Pricing</h1>
        <p className="text-bone-400 mt-2">
          Cancel anytime. No card required for the free tier.
        </p>

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
                  className="mt-7 text-center px-5 py-2.5 rounded font-medium transition-colors focus-ring border border-graphite-700 hover:border-bone-400 text-bone-100"
                >
                  {plan.cta}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="mt-7 text-center px-5 py-2.5 rounded font-medium bg-graphite-700/60 text-bone-400 cursor-not-allowed"
                >
                  {plan.cta}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-bone-400 mt-8">
          Checkout isn&apos;t wired up yet in this build — plug in Stripe using
          the notes in README.md before launch.
        </p>
      </section>
      <Footer />
    </>
  );
}
