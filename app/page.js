import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />

      {/* Hero — the signature moment: a generic bullet gets struck through
          and replaced with a tailored one, live, on load. */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-xs tracking-widest text-redline uppercase mb-6">
              Resume · Cover letter · LinkedIn post
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-bone-100">
              One career story.
              <br />
              Tailored everywhere
              <br />
              you apply.
            </h1>
            <p className="mt-6 text-bone-400 text-lg max-w-md">
              Paste a job description. Threadline rewrites your resume
              bullets to match it, drafts the cover letter, and turns the
              same story into a LinkedIn post — in one pass.
            </p>
            <div className="mt-9 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-redline hover:bg-redline-dim text-graphite-950 font-medium rounded transition-colors focus-ring"
              >
                Try it free
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 text-bone-100 border border-graphite-700 hover:border-bone-400 rounded transition-colors focus-ring"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-bone-400">
              2 free tailored generations. No card required.
            </p>
          </div>

          <div className="bg-graphite-800 border border-graphite-700 rounded-lg p-8 bg-ledger-lines">
            <p className="font-mono text-xs text-bone-400 mb-4">
              {"// resume_bullet.txt"}
            </p>
            <p className="font-mono text-sm text-bone-400 leading-relaxed">
              <span className="redline-strike">
                Responsible for managing a team and improving processes.
              </span>
            </p>
            <p className="redline-reveal font-mono text-sm text-bone-100 leading-relaxed mt-3">
              Led a 6-person eng team through a migration that cut deploy
              time 40% — directly matching the &quot;platform reliability&quot;
              requirement in the JD.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — a real 3-step sequence, so numbering earns its keep */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-graphite-700/60">
        <h2 className="font-mono text-xs tracking-widest text-redline uppercase mb-10">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-mono text-3xl text-bone-400 mb-3">01</p>
            <h3 className="font-medium text-bone-100 mb-2">
              Paste the job description
            </h3>
            <p className="text-sm text-bone-400">
              Along with your current resume or a rough list of what you have
              done.
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl text-bone-400 mb-3">02</p>
            <h3 className="font-medium text-bone-100 mb-2">
              Get a tailored draft
            </h3>
            <p className="text-sm text-bone-400">
              Bullets rewritten to match the JD&apos;s language, plus a short
              cover letter. Nothing invented — only reframed.
            </p>
          </div>
          <div>
            <p className="font-mono text-3xl text-bone-400 mb-3">03</p>
            <h3 className="font-medium text-bone-100 mb-2">
              Post the same story
            </h3>
            <p className="text-sm text-bone-400">
              One click turns the same achievements into a LinkedIn
              &quot;open to work&quot; or project post.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-graphite-700/60">
        <div className="bg-graphite-800 border border-graphite-700 rounded-lg p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-medium text-bone-100">
              Stop rewriting the same story from scratch.
            </h2>
            <p className="text-bone-400 mt-2">
              Start free — no card, no setup.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-redline hover:bg-redline-dim text-graphite-950 font-medium rounded transition-colors whitespace-nowrap focus-ring"
          >
            Open dashboard
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
