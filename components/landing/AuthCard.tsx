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

// The marketing-page auth panel. Signup is the default surface (most landing
// visitors are new), with a "sign in" switch underneath for returning users.
// The Supabase calls mirror app/signup/SignupForm.tsx and app/login/LoginForm.tsx
// exactly — this is the same flow, surfaced inline on the landing page.

const signupSchema = z.object({
  account_type: z.enum(["individual", "company"]),
  display_name: z.string().min(2, "Enter your name").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type SignupValues = z.infer<typeof signupSchema>;

const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").optional().or(z.literal("")),
});
type SigninValues = z.infer<typeof signinSchema>;

type Mode = "signup" | "signin";

export function AuthCard({ defaultType = "individual" }: { defaultType?: AccountType }) {
  const [mode, setMode] = useState<Mode>("signup");

  return (
    <div
      id="get-started"
      className="rounded-2xl bg-paper border border-border shadow-[0_30px_70px_-34px_rgba(28,28,28,0.32)] p-5 sm:p-6"
    >
      {mode === "signup" ? (
        <SignupPanel defaultType={defaultType} onSwitch={() => setMode("signin")} />
      ) : (
        <SigninPanel onSwitch={() => setMode("signup")} />
      )}
    </div>
  );
}

// ── Signup ──────────────────────────────────────────────────────────────
function SignupPanel({ defaultType, onSwitch }: { defaultType: AccountType; onSwitch: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { account_type: defaultType, display_name: "", email: "", password: "" },
  });
  const accountType = watch("account_type");

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setServerError(NO_SUPABASE); return; }
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
        data: { account_type: values.account_type, display_name: values.display_name },
      },
    });
    if (error) { setServerError(error.message); return; }
    if (!data.session) { setVerifyEmail(values.email); return; }
    router.replace("/home");
    router.refresh();
  }

  if (verifyEmail) {
    return <CheckInbox eyebrow="One last step" lead="We sent a confirmation link to" email={verifyEmail} tail="Click it to finish creating your account." />;
  }

  return (
    <div>
      <p className="section-eyebrow text-sienna">Free · no card needed</p>
      <h2 className="font-serif text-[23px] tracking-tightish mt-1 leading-tight">Create your profile</h2>
      <p className="text-[12.5px] text-muted mt-1">Build a verified CV or company profile in minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3.5" noValidate>
        <div>
          <label className="label">I&apos;m signing up as</label>
          <div className="grid grid-cols-2 gap-2">
            {(["individual", "company"] as AccountType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue("account_type", t, { shouldDirty: true })}
                aria-pressed={accountType === t}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition min-h-[44px]",
                  accountType === t ? "border-ink bg-ink text-paper" : "border-border bg-paper hover:border-muted",
                )}
              >
                <div className="text-[13px] font-semibold">{t === "individual" ? "An individual" : "An organisation"}</div>
                <div className={cn("text-[11.5px] mt-0.5", accountType === t ? "text-paper/70" : "text-muted")}>
                  {t === "individual" ? "Build a CV." : "Company profile."}
                </div>
              </button>
            ))}
          </div>
          <input type="hidden" {...register("account_type")} />
        </div>

        <div>
          <label className="label" htmlFor="su-name">{accountType === "company" ? "Organisation name" : "Your full name"}</label>
          <input id="su-name" className="field" autoComplete={accountType === "company" ? "organization" : "name"} {...register("display_name")} />
          {errors.display_name && <p className="helper text-red-600">{errors.display_name.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="su-email">Email</label>
          <input id="su-email" type="email" autoComplete="email" placeholder="you@example.so" className="field" {...register("email")} />
          {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="su-password">Password</label>
          <input id="su-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" className="field" {...register("password")} />
          {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
        </div>

        {serverError && <ErrorNote>{serverError}</ErrorNote>}

        <Button type="submit" kind="sienna" size="lg" className="w-full" disabled={isSubmitting || oauthPending}>
          {isSubmitting ? "Creating…" : "Create account"}
        </Button>
      </form>

      <OrDivider />
      <GoogleButton mode="signup" pending={oauthPending} setPending={setOauthPending} setError={setServerError} />

      <SwitchRow
        prompt="Already signed up?"
        action="Sign in"
        onClick={onSwitch}
      />
    </div>
  );
}

// ── Sign in ─────────────────────────────────────────────────────────────
function SigninPanel({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"password" | "magic">("password");
  const [serverError, setServerError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
  });

  async function onSubmit(values: SigninValues) {
    setServerError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setServerError(NO_SUPABASE); return; }
    if (authMode === "password") {
      if (!values.password) { setServerError("Enter your password, or switch to a magic link."); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
      if (error) { setServerError(error.message); return; }
      router.replace("/home");
      router.refresh();
    } else {
      const redirectTo = `${window.location.origin}/auth/callback?next=/home`;
      const { error } = await supabase.auth.signInWithOtp({ email: values.email, options: { emailRedirectTo: redirectTo } });
      if (error) { setServerError(error.message); return; }
      setMagicSent(true);
    }
  }

  if (magicSent) {
    return <CheckInbox eyebrow="Check your inbox" lead="We sent a sign-in link to" email={getValues("email")} tail="Click the link to finish signing in." />;
  }

  return (
    <div>
      <p className="section-eyebrow text-sienna">Welcome back</p>
      <h2 className="font-serif text-[23px] tracking-tightish mt-1 leading-tight">Sign in to Sahan</h2>
      <p className="text-[12.5px] text-muted mt-1">Pick up where you left off.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3.5" noValidate>
        <div>
          <label className="label" htmlFor="si-email">Email</label>
          <input id="si-email" type="email" autoComplete="email" placeholder="you@example.so" className="field" {...register("email")} />
          {errors.email && <p className="helper text-red-600">{errors.email.message}</p>}
        </div>

        {authMode === "password" && (
          <div>
            <label className="label" htmlFor="si-password">Password</label>
            <input id="si-password" type="password" autoComplete="current-password" className="field" {...register("password")} />
            {errors.password && <p className="helper text-red-600">{errors.password.message}</p>}
          </div>
        )}

        {serverError && <ErrorNote>{serverError}</ErrorNote>}

        <Button type="submit" kind="sienna" size="lg" className="w-full" disabled={isSubmitting || oauthPending}>
          {isSubmitting ? "Signing in…" : authMode === "password" ? "Sign in" : "Send magic link"}
        </Button>

        <button
          type="button"
          onClick={() => setAuthMode(authMode === "password" ? "magic" : "password")}
          className="text-[12.5px] text-sienna hover:underline w-full text-center min-h-[36px]"
        >
          {authMode === "password" ? "Use a magic link instead" : "Use a password instead"}
        </button>
      </form>

      <OrDivider />
      <GoogleButton mode="signin" pending={oauthPending} setPending={setOauthPending} setError={setServerError} />

      <SwitchRow prompt="New to Sahan?" action="Create an account" onClick={onSwitch} />
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────
const NO_SUPABASE = "Supabase isn't configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.";

function ErrorNote({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{children}</div>;
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-4 text-[11px] text-muted">
      <span className="flex-1 h-px bg-border" />
      <span>OR</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function SwitchRow({ prompt, action, onClick }: { prompt: string; action: string; onClick: () => void }) {
  return (
    <p className="mt-5 text-center text-[13px] text-muted">
      {prompt}{" "}
      <button type="button" onClick={onClick} className="text-sienna font-semibold hover:underline">
        {action}
      </button>
    </p>
  );
}

function CheckInbox({ eyebrow, lead, email, tail }: { eyebrow: string; lead: string; email: string; tail: string }) {
  return (
    <div className="py-4">
      <div className="w-11 h-11 rounded-full bg-verified-soft text-verified flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
        </svg>
      </div>
      <p className="section-eyebrow text-sienna mt-4">{eyebrow}</p>
      <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
        {lead} <span className="font-medium text-ink">{email}</span>. {tail}
      </p>
    </div>
  );
}

function GoogleButton({
  mode, pending, setPending, setError,
}: {
  mode: "signup" | "signin";
  pending: boolean;
  setPending: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  async function go() {
    setError(null);
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError(NO_SUPABASE); setPending(false); return; }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
    });
    if (error || !data?.url) {
      setError(error?.message || "Google sign-in isn't enabled on this Supabase project yet.");
      setPending(false);
      return;
    }
    window.location.href = data.url;
  }
  return (
    <Button type="button" kind="secondary" size="lg" className="w-full" onClick={go} disabled={pending}>
      <GoogleG />
      {pending ? "Redirecting…" : mode === "signup" ? "Sign up with Google" : "Continue with Google"}
    </Button>
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
