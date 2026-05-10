"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../lib/supabase-browser";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/runs", label: "Agent Runs" },
  { href: "/diagnostics", label: "Diagnostics" },
];

export function AppShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="appShell">
      <aside className="sideNav">
        <div>
          <p className="brandKicker">Texas expansion intelligence</p>
          <h1>Augur</h1>
        </div>
        <nav aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={pathname.startsWith(link.href) ? "active" : ""}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sessionBox">
          <span>{userEmail ?? "Signed in"}</span>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}
