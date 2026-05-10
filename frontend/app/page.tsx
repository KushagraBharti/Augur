"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, getSupabaseBrowser } from "./lib/supabase-browser";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeUser() {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/dashboard", {
        headers: await getAuthHeaders(),
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (cancelled) {
        return;
      }
      router.replace(body?.onboarding?.usingDemo ? "/onboarding" : "/dashboard");
    }

    routeUser().catch(() => router.replace("/login"));
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="routeLoading">
      <div>
        <p className="brandKicker">Augur</p>
        <h1>Routing to your workspace</h1>
      </div>
    </main>
  );
}
