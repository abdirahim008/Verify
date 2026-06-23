import Link from "next/link";
import type { Metadata } from "next";
import { SahanMark } from "@/components/SahanMark";
import { Button } from "@/components/Button";

// Public marketing chrome for the guides section (no auth). Lightweight
// header + footer so each guide reads like a standalone resource page but
// still routes back into signup.
export const metadata: Metadata = {
  title: { default: "Guides", template: "%s · Sahan" },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur bg-paper/85 border-b border-border">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 sm:px-8 h-[60px]">
          <Link href="/" aria-label="Sahan home"><SahanMark /></Link>
          <nav className="flex items-center gap-3 text-[13px] text-ink-soft">
            <Link href="/guides" className="hidden sm:inline hover:text-ink">Guides</Link>
            <Link href="/login" className="hidden sm:inline hover:text-ink">Sign in</Link>
            <Link href="/signup"><Button kind="sienna" size="sm" className="rounded-full px-5 min-h-[44px]">Get started — free</Button></Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="bg-paper border-t border-border">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-3 text-[12.5px] text-muted">
          <div className="flex items-center gap-3">
            <SahanMark size={16} />
            <span>&copy; {new Date().getFullYear()} Sahan</span>
          </div>
          <Link href="/guides" className="sm:ml-auto hover:text-ink">All guides</Link>
          <Link href="/signup" className="hover:text-ink">Create an account</Link>
        </div>
      </footer>
    </div>
  );
}
