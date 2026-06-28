import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12 bg-paper">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block mb-8"><SahanMark /></Link>
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Reset your password</h1>
        <p className="text-[14px] text-muted mt-1">Enter your email and we&apos;ll send you a link to set a new password.</p>
        <ForgotPasswordForm />
        <p className="mt-6 text-[13px] text-muted">
          Remembered it? <Link href="/login" className="text-sienna font-medium hover:underline">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
