"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ items, className = "" }: { items: { label: string; href: string }[]; className?: string }) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {items.map((item) => {
        const base = item.href.split("#")[0] || "/";
        const current = !item.href.includes("#") && (pathname === base || (base !== "/" && pathname.startsWith(base + "/")));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className="relative inline-flex min-h-10 items-center px-2.5 text-[0.9rem] text-muted transition-colors hover:text-text aria-[current=page]:text-text aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2.5 aria-[current=page]:after:bottom-1.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-accent-ink"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
