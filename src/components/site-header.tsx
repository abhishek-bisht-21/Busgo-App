"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function SiteHeader() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  async function signOut() {
    await authClient.signOut();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#8e1018]/15 bg-[#fff8f3]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c81d25] text-sm text-white shadow-md shadow-[#c81d25]/30">
            Bg
          </span>
          Busgo
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hidden text-[#6b3033] sm:inline">
            Find a bus
          </Link>
          {isPending ? (
            <span className="h-9 w-24 animate-pulse rounded-full bg-[#c81d25]/10" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-40 truncate rounded-full bg-white px-3 py-2 text-[#8e1018] shadow-sm">
                {user.name || user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="h-9 rounded-full px-3 text-[#6b3033] transition hover:bg-[#c81d25]/10"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="h-9 rounded-full bg-[#c81d25] px-4 leading-9 text-white shadow-md shadow-[#c81d25]/25 transition hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
