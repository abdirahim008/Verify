"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

// Step 1 of the reset flow: email → Supabase recovery email. The link in
// that email lands on /auth/callback (PKCE code exchange) and bounces to
// /reset-password, where the user sets a new password. Mirrors the magic-
// link request UX so the two feel like one family.
export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setServerError("Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    // Don't leak whether an account exists — show the same confirmation
    // regardless, unless Supabase itself is unreachable/misconfigured.
    if (error && /not configured|fetch|network/i.test(error.message)) { setServerError(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-cream p-5">
        <p className="section-eyebrow text-sienna">Check your inbox</p>
        <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
          If an account exists for <span className="font-medium text-ink">{getValues("email")}</span>, we&apos;ve sent a
          link to reset your password. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" placeholder="you@example.so" className="field" {...register("email")} />
        {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}

      <Button type="submit" kind="primary" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
