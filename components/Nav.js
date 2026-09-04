import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-graphite-700/60">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded">
          <span className="font-mono text-lg tracking-tight text-bone-100">
            thread<span className="text-redline">line</span>
          </span>
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link
            href="/pricing"
            className="text-bone-400 hover:text-bone-100 transition-colors focus-ring rounded"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-redline hover:bg-redline-dim text-graphite-950 font-medium rounded transition-colors focus-ring"
          >
            Open dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
