"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  password: z.string().min(8, "At least 8 characters"),
  confirm: z.string().min(8, "At least 8 characters"),
}).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type FormValues = z.infer<typeof schema>;

// Step 2 of the reset flow. The recovery link has already been exchanged for
// a session by /auth/callback, so the user lands here authenticated and we
// just set the new password. If there's no session (link expired, opened on
// another device, or visited directly) we say so rather than failing on save.
export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setHasSession(false); return; }
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setServerError("Supabase isn't configured yet."); return; }
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) { setServerError(error.message); return; }
    setDone(true);
    setTimeout(() => { router.replace("/home"); router.refresh(); }, 1200);
  }

  if (hasSession === false) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-cream p-5">
        <p className="section-eyebrow text-sienna">Link expired</p>
        <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
          This reset link is invalid or has expired. Reset links work once and only on the device you open them on.
        </p>
        <Link href="/forgot-password" className="mt-3 inline-block text-[13px] text-sienna font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-cream p-5">
        <p className="section-eyebrow text-sienna">Password updated</p>
        <p className="mt-2 text-[14px] text-ink-soft">Taking you to your home…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="password">New password</label>
        <input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" className="field" {...register("password")} />
        {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <label className="label" htmlFor="confirm">Confirm new password</label>
        <input id="confirm" type="password" autoComplete="new-password" className="field" {...register("confirm")} />
        {errors.confirm && <p className="helper text-red-600">{errors.confirm.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}

      <Button type="submit" kind="primary" size="lg" className="w-full" disabled={isSubmitting || hasSession === null}>
        {isSubmitting ? "Updating…" : "Set new password"}
      </Button>
    </form>
  );
}
