"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SahanMark } from "./SahanMark";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FEATURES } from "@/lib/flags";
import type { AccountType } from "@/lib/types";

interface Props {
  accountType: AccountType | null;
  displayName: string;
  isAdmin: boolean;
}

// "Verification" is only in the nav when the feature is enabled (lib/flags.ts).
const ITEMS: Array<{ href: string; label: string }> = [
  { href: "/home", label: "Home" },
  { href: "/profile", label: "My profile" },
  ...(FEATURES.verification ? [{ href: "/verification", label: "Verification" }] : []),
];

export function TopNav({ accountType, displayName, isAdmin }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 h-[60px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-11">
          <Link href="/home" aria-label="Sahan home"><SahanMark size={22} /></Link>
          {/* Inline desktop nav. Pushed up from md→lg so tablet portrait
              (768–1023px) uses the mobile bottom-bar pattern instead of
              cramming 4–6 links + avatar across a 700px content area. */}
          <nav className="hidden lg:flex items-center gap-7">
            {ITEMS.map((it) => {
              const active = pathname === it.href || pathname.startsWith(it.href + "/");
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cn(
                    "text-[13.5px] pb-[3px] border-b-[1.5px] transition",
                    active ? "text-ink font-semibold border-sienna" : "text-muted border-transparent hover:text-ink",
                  )}
                >
                  {it.label}
                </Link>
              );
            })}
            {isAdmin && (
              <>
                {FEATURES.verification && (
                  <Link href="/admin" className={cn("text-[13.5px] pb-[3px] border-b-[1.5px] transition",
                    (pathname === "/admin" || (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/feed"))) ? "text-ink font-semibold border-sienna" : "text-muted border-transparent hover:text-ink")}>
                    Admin
                  </Link>
                )}
                <Link href="/admin/feed" className={cn("text-[13.5px] pb-[3px] border-b-[1.5px] transition",
                  pathname.startsWith("/admin/feed") ? "text-ink font-semibold border-sienna" : "text-muted border-transparent hover:text-ink")}>
                  Feed
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {accountType && (
            <span className="hidden sm:inline text-[11.5px] uppercase tracking-[0.12em] text-muted">{accountType}</span>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-border-soft"
            >
              <div className="w-8 h-8 rounded-full bg-sienna-soft text-sienna font-semibold flex items-center justify-center text-[12.5px]">
                {initials(displayName)}
              </div>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-paper shadow-card p-1 z-20">
                  <div className="px-3 py-2 text-[12.5px] text-muted">
                    Signed in as<br /><span className="text-ink font-medium">{displayName}</span>
                  </div>
                  <hr className="my-1 border-border" />
                  <MenuLink href="/profile">My profile</MenuLink>
                  <MenuLink href="/settings">Settings</MenuLink>
                  <hr className="my-1 border-border" />
                  <button onClick={signOut} className="block w-full text-left px-3 py-2 text-[13px] rounded-md hover:bg-border-soft">Sign out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / tablet-portrait nav row. Horizontally scrollable so any
          number of items fits regardless of viewport width. `scrollbar-hide`
          + smooth-scrolling CSS lives in globals.css. */}
      <nav className="lg:hidden border-t border-border-soft px-4 py-2 flex gap-5 overflow-x-auto scrollbar-hide -mx-px">
        {ITEMS.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn("text-[13px] whitespace-nowrap py-1.5 px-0.5 border-b-[1.5px] min-h-[36px] inline-flex items-center",
                active ? "text-ink font-semibold border-sienna" : "text-muted border-transparent")}
            >
              {it.label}
            </Link>
          );
        })}
        {isAdmin && (
          <>
            {FEATURES.verification && (
              <Link href="/admin" className={cn("text-[13px] whitespace-nowrap py-1.5 px-0.5 border-b-[1.5px] min-h-[36px] inline-flex items-center",
                (pathname === "/admin" || (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/feed"))) ? "text-ink font-semibold border-sienna" : "text-muted border-transparent")}>
                Admin
              </Link>
            )}
            <Link href="/admin/feed" className={cn("text-[13px] whitespace-nowrap py-1.5 px-0.5 border-b-[1.5px] min-h-[36px] inline-flex items-center",
              pathname.startsWith("/admin/feed") ? "text-ink font-semibold border-sienna" : "text-muted border-transparent")}>
              Feed
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 text-[13px] rounded-md hover:bg-border-soft">{children}</Link>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
