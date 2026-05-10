"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, getSupabaseBrowser } from "../lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    const response = await fetch("/api/dashboard", {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    router.replace(body?.onboarding?.usingDemo ? "/onboarding" : "/dashboard");
  }

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="brandKicker">Augur</p>
        <h1>Log in</h1>
        <p>Access your Texas expansion intelligence workspace.</p>
        <form onSubmit={login}>
          <label>
            Email
            <input autoComplete="email" inputMode="email" onChange={(event) => setEmail(event.target.value)} required type="text" value={email} />
          </label>
          <label>
            Password
            <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          {message ? <p className="formMessage">{message}</p> : null}
          <button className="primaryButton" disabled={busy} type="submit">
            <span>{busy ? "Signing in" : "Log in"}</span>
            <span>→</span>
          </button>
        </form>
        <Link className="textLink" href="/signup">
          Create an account
        </Link>
      </section>
    </main>
  );
}
