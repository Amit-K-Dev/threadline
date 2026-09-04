import "./globals.css";

export const metadata = {
  title: "Threadline — One story, tailored everywhere you apply",
  description:
    "Paste a job description. Get a tailored resume, a cover letter, and the LinkedIn post to go with it — all pulled from the same career story.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans bg-graphite-900 text-bone-100 antialiased">
        {children}
      </body>
    </html>
  );
}
