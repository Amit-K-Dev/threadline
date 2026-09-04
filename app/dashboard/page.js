import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <>
      <Nav />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-bone-100">Dashboard</h1>
        <p className="text-bone-400 mt-2">
          Pick a tool. Both work from the same idea — one story, reframed for
          where it&apos;s going.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          <Link
            href="/dashboard/resume"
            className="block bg-graphite-800 border border-graphite-700 hover:border-redline rounded-lg p-7 transition-colors focus-ring"
          >
            <p className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
              Tool 01
            </p>
            <h2 className="text-lg font-medium text-bone-100">
              Tailor resume + cover letter
            </h2>
            <p className="text-sm text-bone-400 mt-2">
              Paste a job description and your background. Get bullets and a
              cover letter matched to it.
            </p>
          </Link>

          <Link
            href="/dashboard/linkedin"
            className="block bg-graphite-800 border border-graphite-700 hover:border-redline rounded-lg p-7 transition-colors focus-ring"
          >
            <p className="font-mono text-xs text-redline uppercase tracking-widest mb-3">
              Tool 02
            </p>
            <h2 className="text-lg font-medium text-bone-100">
              Write a LinkedIn post
            </h2>
            <p className="text-sm text-bone-400 mt-2">
              Turn a role, project, or milestone into a post that sounds like
              you, not a press release.
            </p>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
