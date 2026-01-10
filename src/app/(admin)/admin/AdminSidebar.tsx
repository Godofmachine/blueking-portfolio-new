"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@ui/button";

const navItems = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 flex-none">
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-background/60 p-3">
        <div className="px-2 pb-2 text-sm font-semibold text-zinc-900 dark:text-white">
          Admin
        </div>
        <div className="flex md:flex-col gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Button
                key={item.href}
                asChild
                variant={active ? "secondary" : "ghost"}
                className="rounded-full justify-start"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
