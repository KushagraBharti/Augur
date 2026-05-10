"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, getSignedInUser } from "../lib/supabase-browser";

const defaultCities = ["Austin", "Dallas", "Houston", "San Antonio"];

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("LoneStar Retail Group");
  const [vertical, setVertical] = useState("retail landlord / strip-mall developer");
  const [businessGoal, setBusinessGoal] = useState("Develop or expand retail centers across Texas");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getSignedInUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? null);
      const response = await fetch("/api/dashboard", {
        headers: await getAuthHeaders(),
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!body?.onboarding?.usingDemo) {
        router.replace("/dashboard");
      }
    }
    load().catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, [router]);

  async function createCompany(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({
        name,
        vertical,
        businessGoal,
        targetCities: defaultCities,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(body.error ?? "Company creation failed.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <main className="authShell">
      <section className="authCard wide">
        <p className="brandKicker">Company onboarding</p>
        <h1>Create your company profile</h1>
        <p>{email ? `${email} will be connected to one primary company profile for this MVP.` : "Loading session."}</p>
        <form onSubmit={createCompany}>
          <label>
            Company name
            <input onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          <label>
            Business type
            <input onChange={(event) => setVertical(event.target.value)} required value={vertical} />
          </label>
          <label>
            Business goal
            <textarea onChange={(event) => setBusinessGoal(event.target.value)} rows={4} value={businessGoal} />
          </label>
          <div className="cityChips" aria-label="Target cities">
            {defaultCities.map((city) => (
              <span key={city}>{city}</span>
            ))}
          </div>
          {message ? <p className="formMessage">{message}</p> : null}
          <button className="primaryButton" disabled={busy} type="submit">
            <span>{busy ? "Creating profile" : "Continue to dashboard"}</span>
            <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
