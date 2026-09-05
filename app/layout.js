import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("http://localhost:3000"), // Change to production URL later
  title: {
    default: "Threadline — One story, tailored everywhere you apply",
    template: "%s | Threadline",
  },
  description:
    "Paste a job description. Get a tailored resume, a cover letter, and the LinkedIn post to go with it — all pulled from the same career story.",
  keywords: ["Resume Builder", "Cover Letter Generator", "LinkedIn Post", "AI Career Tools", "Job Search"],
  authors: [{ name: "Threadline" }],
  openGraph: {
    title: "Threadline — One story, tailored everywhere you apply",
    description: "Paste a job description. Get a tailored resume, a cover letter, and the LinkedIn post to go with it.",
    url: "http://localhost:3000",
    siteName: "Threadline",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Threadline — One story, tailored everywhere you apply",
    description: "Paste a job description. Get a tailored resume, a cover letter, and the LinkedIn post to go with it.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" data-scroll-behavior="smooth">
        <body className="font-sans bg-graphite-900 text-bone-100 antialiased">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
