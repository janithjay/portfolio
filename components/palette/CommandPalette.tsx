"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import site from "@/content/site.json";
import { Icon, type IconName } from "@/components/ui/Icon";
import { applySiteTokens, setMode, setScheme } from "@/lib/prefs";
import type { PaletteItem } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PaletteItem[];
  onAsk: () => void;
}

export default function CommandPalette({ open, onOpenChange, items, onAsk }: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const run = (fn: () => void, keepOpen = false) => () => {
    fn();
    if (!keepOpen) onOpenChange(false);
  };

  const go = (href: string) =>
    run(() => {
      if (/^https?:\/\//.test(href)) window.open(href, "_blank", "noopener,noreferrer");
      else if (href.endsWith(".pdf")) window.location.href = href;
      else router.push(href);
    });

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setToast(`Copied ${site.email}`);
    } catch {
      setToast(`Email: ${site.email}`);
    }
    window.setTimeout(() => {
      setToast(null);
      onOpenChange(false);
    }, 1100);
  };

  const groups = ["Pages", "Work", "Sections", "Links"] as const;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby="palette-desc"
          className="fixed left-1/2 top-[12vh] z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bg-elev text-text shadow-2xl shadow-black/30"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description id="palette-desc" className="sr-only">
            Search pages, projects and actions. Use the arrow keys to move and Enter to select.
          </Dialog.Description>
          <Command label="Command palette" loop>
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Icon name="search" className="text-muted" />
        <Command.Input
          autoFocus
          placeholder="Jump to a page, project or action…"
          className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
        />
        <kbd className="kbd">esc</kbd>
      </div>
      <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto overscroll-contain p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
          Nothing matches. Try “robot”, “cv” or “theme”.
        </Command.Empty>

        {groups.map((g) => {
          const list = items.filter((i) => i.group === g);
          if (!list.length) return null;
          return (
            <Group key={g} heading={g}>
              {list.map((i) => (
                <Item
                  key={i.id}
                  value={`${i.label} ${i.group}`}
                  keywords={i.keywords}
                  onSelect={go(i.href)}
                  icon={i.group === "Links" ? "arrowUpRight" : i.group === "Work" ? "layers" : "arrowRight"}
                  hint={i.hint}
                >
                  {i.label}
                </Item>
              ))}
            </Group>
          );
        })}

        <Group heading="Actions">
          <Item value="copy email address" icon={toast ? "check" : "copy"} onSelect={copyEmail} hint={toast ?? undefined}>
            Copy my email
          </Item>
          <Item value="download cv resume pdf" icon="download" onSelect={go(site.links.cvPdf)}>
            Download CV (PDF)
          </Item>
          <Item value="ask about me assistant question faq" icon="spark" onSelect={run(onAsk)}>
            Ask about me
          </Item>
          <Item value="skim mode recruiter 30 seconds" icon="arrowRight" onSelect={run(() => setMode("skim"))}>
            Switch to Skim mode
          </Item>
          <Item value="deep mode engineer case studies" icon="arrowRight" onSelect={run(() => setMode("deep"))}>
            Switch to Deep mode
          </Item>
          <Item value="theme light" icon="sun" onSelect={run(() => setScheme("light"))}>
            Light theme
          </Item>
          <Item value="theme dark" icon="moon" onSelect={run(() => setScheme("dark"))}>
            Dark theme
          </Item>
          <Item value="theme system auto" icon="monitor" onSelect={run(() => setScheme("system"))}>
            Match system theme
          </Item>
          <Item value="reset site design tokens theme accent" icon="reset" onSelect={run(() => applySiteTokens(null))}>
            Reset site design tokens
          </Item>
        </Group>
      </Command.List>
      <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2 font-mono text-[0.7rem] text-muted">
        <span>
          <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> to move · <kbd className="kbd">↵</kbd> to select
        </span>
        <span className="hidden sm:inline">jj / cmd</span>
      </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Group({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.7rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-muted"
    >
      {children}
    </Command.Group>
  );
}

function Item({
  children,
  value,
  keywords,
  onSelect,
  icon,
  hint,
}: {
  children: ReactNode;
  value: string;
  keywords?: string[];
  onSelect: () => void;
  icon: IconName;
  hint?: string;
}) {
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius)] px-3 text-[0.95rem] data-[selected=true]:bg-accent-soft data-[selected=true]:text-text"
    >
      <Icon name={icon} size={16} className="shrink-0 text-muted" />
      <span className="flex-1 truncate">{children}</span>
      {hint && <span className="truncate font-mono text-xs text-muted">{hint}</span>}
    </Command.Item>
  );
}
