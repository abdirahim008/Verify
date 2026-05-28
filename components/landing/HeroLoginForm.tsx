"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  keep_signed_in: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

// LinkedIn-style inline sign-in card on the landing page. The dedicated
// /login route still exists for direct visits / magic-link callbacks;
// this is the marketing-page entrypoint.
export function HeroLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { keep_signed_in: true },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setServerError("Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email, password: values.password,
    });
    if (error) { setServerError(error.message); return; }
    router.replace("/home");
    router.refresh();
  }

  async function continueWithGoogle() {
    setServerError(null);
    setOauthPending(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setServerError("Supabase isn't configured yet."); setOauthPending(false); return;
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
    });
    if (error || !data?.url) {
      setServerError(error?.message || "Google sign-in isn't enabled on this Supabase project yet.");
      setOauthPending(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div id="signin" className="rounded-[14px] bg-paper border border-border shadow-[0_30px_60px_-30px_rgba(28,28,28,0.18)] p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-[22px] tracking-tightish font-medium">Sign in to Sahan</h2>
      </div>
      <p className="text-[12.5px] text-muted mt-1">Stay verified, stay current.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3" noValidate>
        <div>
          <label className="label uppercase tracking-[0.08em] text-[10.5px]" htmlFor="hero-email">Email or phone</label>
          <input id="hero-email" type="email" autoComplete="email" placeholder="ifrah.abdi@example.so" className="field" {...register("email")} />
          {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label uppercase tracking-[0.08em] text-[10.5px]" htmlFor="hero-password">Password</label>
            <Link href="/login" className="text-[12px] text-sienna font-medium hover:underline">Forgot?</Link>
          </div>
          <input id="hero-password" type="password" autoComplete="current-password" placeholder="••••••••••••" className="field" {...register("password")} />
          {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-[13px] text-ink-soft pt-1">
          <input type="checkbox" className="rounded border-border accent-sienna" {...register("keep_signed_in")} />
          Keep me signed in
        </label>

        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
        )}

        <Button type="submit" kind="sienna" size="lg" className="w-full" disabled={isSubmitting || oauthPending}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-4 text-[11px] text-muted">
        <span className="flex-1 h-px bg-border" />
        <span>OR</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <Button type="button" kind="secondary" size="lg" className="w-full" onClick={continueWithGoogle} disabled={oauthPending}>
        <GoogleG />
        {oauthPending ? "Redirecting..." : "Continue with Google"}
      </Button>

      <p className="mt-5 text-[12.5px] text-muted text-center">
        New to Sahan? <Link href="/signup" className="text-sienna font-medium hover:underline">Join now</Link>
      </p>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 5.8 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 5.8 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4 5.7l6.2 5.2C41.4 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
