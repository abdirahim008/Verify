import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_1fr]">
      {/* Editorial side — collapses below lg */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-ink text-paper relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full bg-sienna/20 blur-3xl" aria-hidden />
        <SahanMark size={22} className="text-paper relative" />
        <div className="relative max-w-md">
          <p className="section-eyebrow text-sienna-soft">Welcome back</p>
          <h2 className="font-serif text-[40px] tracking-[-0.02em] leading-[1.1] mt-3">
            One profile.<br />A CV the room remembers.
          </h2>
          <p className="text-[14px] text-paper/70 mt-5 leading-relaxed">
            Pick up where you left off — your structured profile, your templates, your downloadable CV.
          </p>
        </div>
        <p className="relative text-[12px] text-paper/40">&copy; {new Date().getFullYear()} Sahan</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10 bg-paper">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-block mb-8"><SahanMark /></Link>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Sign in</h1>
          <p className="text-[14px] text-muted mt-1">Welcome back. Use your email and password, or get a magic link.</p>
          <LoginForm nextPath={searchParams.next} initialError={searchParams.error} />
          <p className="mt-6 text-[13px] text-muted">
            New here? <Link href="/signup" className="text-sienna font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
