"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AccountType } from "@/lib/types";
import { cn } from "@/lib/cn";

const schema = z.object({
  account_type: z.enum(["individual", "company"]),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  display_name: z.string().min(2, "Enter your name").max(120),
});
type FormValues = z.infer<typeof schema>;

export function SignupForm({ initialType }: { initialType: AccountType }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { account_type: initialType, email: "", password: "", display_name: "" },
  });
  const accountType = watch("account_type");

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setServerError("Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."); return; }

    // Stash account_type + display_name in auth metadata so the DB trigger
    // (see supabase/migrations/0001_init.sql) can create the profile row
    // server-side with the correct type. Avoids client-side INSERT against RLS.
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
        data: { account_type: values.account_type, display_name: values.display_name },
      },
    });
    if (error) { setServerError(error.message); return; }

    // If email confirmation is required, session will be null until they
    // click the link. Otherwise we have a session immediately.
    if (!data.session) { setVerifyEmail(values.email); return; }
    router.replace("/home");
    router.refresh();
  }

  if (verifyEmail) {
    return (
      <div className="mt-8 rounded-lg border border-border bg-cream p-5">
        <p className="section-eyebrow text-sienna">One last step</p>
        <p className="mt-2 text-[14px] text-ink-soft">
          We sent a confirmation link to <span className="font-medium text-ink">{verifyEmail}</span>.
          Click it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      <div>
        <label className="label">I&apos;m signing up as</label>
        <div className="grid grid-cols-2 gap-2">
          {(["individual", "company"] as AccountType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("account_type", t, { shouldDirty: true })}
              className={cn(
                "rounded-lg border px-3 py-3 text-left transition",
                accountType === t
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper hover:border-muted",
              )}
            >
              <div className="text-[13px] font-semibold">{t === "individual" ? "An individual" : "An organisation"}</div>
              <div className={cn("text-[12px] mt-0.5", accountType === t ? "text-paper/70" : "text-muted")}>
                {t === "individual" ? "Build a CV." : "Build a company profile."}
              </div>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("account_type")} />
      </div>

      <div>
        <label className="label" htmlFor="display_name">
          {accountType === "company" ? "Organisation name" : "Your full name"}
        </label>
        <input id="display_name" className="field" autoComplete={accountType === "company" ? "organization" : "name"} {...register("display_name")} />
        {errors.display_name && <p className="helper text-red-600">{errors.display_name.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className="field" {...register("email")} />
        {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="new-password" className="field" {...register("password")} />
        {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}

      <Button type="submit" kind="primary" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
