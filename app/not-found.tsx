import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 h-[60px] flex items-center">
          <Link href="/"><SahanMark /></Link>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-2xl px-5 sm:px-10 py-20 sm:py-32 text-center">
        <p className="section-eyebrow text-sienna">404</p>
        <h1 className="font-serif text-[40px] sm:text-[56px] tracking-[-0.025em] mt-4">Not here.</h1>
        <p className="mt-4 text-[15px] text-ink-soft max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist — or it&apos;s private. If you followed a link, the profile&apos;s owner may have changed their visibility settings.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/"><Button kind="primary" size="lg">Back to home</Button></Link>
          <Link href="/signup"><Button kind="secondary" size="lg">Create an account</Button></Link>
        </div>
      </main>
    </div>
  );
}
