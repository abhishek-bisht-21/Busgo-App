"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";

const demoEmail = "demo@busgo.app";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Sign in failed.");
      return;
    }

    router.push(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="rise-in space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-[#8e1018]">Sign in</h1>
        <p className="text-[#6b3033]">
          Demo account: {demoEmail} / BusgoDemo123!
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="rise-in flex flex-col gap-4 rounded-3xl border border-[#c81d25]/15 bg-white/80 p-6 shadow-xl shadow-[#c81d25]/10"
      >
        <label className="flex flex-col gap-1 text-sm text-[#6b3033]">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={demoEmail}
            className="h-12 rounded-2xl border border-[#c81d25]/20 bg-[#fff8f3] px-3 outline-none focus:border-[#c81d25]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#6b3033]">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            defaultValue="BusgoDemo123!"
            className="h-12 rounded-2xl border border-[#c81d25]/20 bg-[#fff8f3] px-3 outline-none focus:border-[#c81d25]"
          />
        </label>
        {error ? <p className="text-sm text-[#c81d25]">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-[#c81d25] font-semibold text-white shadow-md shadow-[#c81d25]/30 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
