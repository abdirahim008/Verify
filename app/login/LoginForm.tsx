"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm({ nextPath, initialError }: { nextPath?: string; initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [serverError, setServerError] = useState<string | null>(initialError ?? null);
  const [magicSent, setMagicSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setServerError("Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."); return; }

    if (mode === "password") {
      if (!values.password) { setServerError("Enter your password, or switch to magic link."); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      if (error) { setServerError(error.message); return; }
      router.replace(nextPath || "/home");
      router.refresh();
    } else {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath || "/home")}`;
      const { error } = await supabase.auth.signInWithOtp({ email: values.email, options: { emailRedirectTo: redirectTo } });
      if (error) { setServerError(error.message); return; }
      setMagicSent(true);
    }
  }

  if (magicSent) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-cream p-5">
        <p className="section-eyebrow text-sienna">Check your inbox</p>
        <p className="mt-2 text-[14px] text-ink-soft">
          We sent a sign-in link to <span className="font-medium text-ink">{getValues("email")}</span>.
          Click the link to finish signing in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className="field" {...register("email")} />
        {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
      </div>

      {mode === "password" && (
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-[12.5px] text-sienna hover:underline">Forgot password?</Link>
          </div>
          <input id="password" type="password" autoComplete="current-password" className="field" {...register("password")} />
          {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
        </div>
      )}

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}

      <Button type="submit" kind="primary" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : mode === "password" ? "Sign in" : "Send magic link"}
      </Button>

      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
        className="text-[13px] text-sienna hover:underline w-full text-center"
      >
        {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
      </button>
    </form>
  );
}
