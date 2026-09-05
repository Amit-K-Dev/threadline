"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Nav() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="border-b border-graphite-700/60">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded">
          <span className="font-mono text-lg tracking-tight text-bone-100">
            thread<span className="text-redline">line</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/pricing"
            className="text-bone-400 hover:text-bone-100 transition-colors focus-ring rounded"
          >
            Pricing
          </Link>
          
          {/* Always reserve space to prevent layout shift while loading auth state */}
          <div className={`flex items-center gap-6 transition-opacity duration-200 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}>
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="text-bone-400 hover:text-bone-100 transition-colors focus-ring rounded">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="px-4 py-2 bg-redline hover:bg-redline-dim text-graphite-950 font-medium rounded transition-colors focus-ring">
                    Start for free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-redline hover:bg-redline-dim text-graphite-950 font-medium rounded transition-colors focus-ring"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
