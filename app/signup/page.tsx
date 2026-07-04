import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { SignupForm } from "./SignupForm";
import type { AccountType } from "@/lib/types";

export const metadata = { title: "Create your account" };

export default function SignupPage({ searchParams }: { searchParams: { type?: string } }) {
  const initialType: AccountType =
    searchParams.type === "company" ? "company" : "individual";

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_1fr]">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-ink text-paper relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-sienna/20 blur-3xl" aria-hidden />
        <SahanMark size={22} className="text-paper relative" />
        <div className="relative max-w-md">
          <p className="section-eyebrow text-sienna-soft">Build something credible</p>
          <h2 className="font-serif text-[40px] tracking-[-0.02em] leading-[1.1] mt-3">
            Structured profile.<br />
            <span className="text-paper/70">Elegant document.</span>
          </h2>
          <p className="text-[14px] text-paper/70 mt-5 leading-relaxed">
            Free to start. Elegant CVs, company profiles and business cards. No spam, no ads, no public scraping.
          </p>
        </div>
        <p className="relative text-[12px] text-paper/40">By signing up you agree to our terms.</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10 bg-paper">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-block mb-8"><SahanMark /></Link>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Create your account</h1>
          <p className="text-[14px] text-muted mt-1">Pick the type that fits — you can&apos;t change this later in this MVP.</p>
          <SignupForm initialType={initialType} />
          <p className="mt-6 text-[13px] text-muted">
            Already have an account? <Link href="/login" className="text-sienna font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
