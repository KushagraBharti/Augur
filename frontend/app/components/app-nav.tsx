"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../lib/supabase-browser";

const links = [
  { href: "/dashboard", label: "Overview", code: "OV" },
  { href: "/runs", label: "Agent Runs", code: "AR" },
  { href: "/diagnostics", label: "Diagnostics", code: "DX" },
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
        <div className="navTop">
          <Link className="brandBlock" href="/dashboard">
            <span className="brandMark">A</span>
            <span>
              <strong>Augur</strong>
              <small>Texas expansion intelligence</small>
            </span>
          </Link>
          <nav aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                className={pathname.startsWith(link.href) ? "active" : ""}
                href={link.href}
                key={link.href}
              >
                <span className="navGlyph">{link.code}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="sessionBox">
          <span>Signed in</span>
          <strong>{userEmail ?? "Workspace user"}</strong>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="workspace">{children}</main>
    </div>
  );
}
