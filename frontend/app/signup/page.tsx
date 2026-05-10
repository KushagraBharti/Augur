"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function signup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (!data.session) {
      setMessage("Account created. Check your email if confirmation is enabled, then log in.");
      return;
    }
    router.replace("/onboarding");
  }

  return (
    <main className="authShell">
      <section className="authCard">
        <p className="brandKicker">Augur</p>
        <h1>Create account</h1>
        <p>Start with a company profile, then run Augur Analyst against public Texas data.</p>
        <form onSubmit={signup}>
          <label>
            Email
            <input autoComplete="email" inputMode="email" onChange={(event) => setEmail(event.target.value)} required type="text" value={email} />
          </label>
          <label>
            Password
            <input autoComplete="new-password" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          {message ? <p className="formMessage">{message}</p> : null}
          <button className="primaryButton" disabled={busy} type="submit">
            <span>{busy ? "Creating" : "Sign up"}</span>
            <span>→</span>
          </button>
        </form>
        <Link className="textLink" href="/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
