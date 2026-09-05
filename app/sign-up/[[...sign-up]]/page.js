import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
      <SignUp fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
