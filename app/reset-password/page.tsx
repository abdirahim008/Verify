import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12 bg-paper">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block mb-8"><SahanMark /></Link>
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Set a new password</h1>
        <p className="text-[14px] text-muted mt-1">Choose a new password for your Sahan account.</p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
