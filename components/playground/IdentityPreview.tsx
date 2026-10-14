"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import playground from "@/content/playground.json";

/**
 * A mock self-service identity flow in the style of the SDK components.
 * Mock auth only: nothing leaves the browser, no credentials are checked.
 */

type User = typeof playground.mockUser;

const pad = (n: number) => `calc(${n}rem * var(--density))`;

export function IdentityPreview() {
  const [user, setUser] = useState<User | null>(null);
  return user ? <UserProfile user={user} onChange={setUser} onSignOut={() => setUser(null)} /> : <SignIn onSignIn={setUser} />;
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  hint,
  readOnly,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  error?: string;
  autoComplete?: string;
  hint?: string;
  readOnly?: boolean;
}) {
  const id = useId();
  const describedBy = [error ? `${id}-err` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.8rem] font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className="w-full rounded-[var(--radius)] border border-line bg-bg text-[0.9rem] text-text outline-none transition-[border-color,box-shadow] placeholder:text-muted focus-visible:border-accent-ink focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] aria-[invalid=true]:border-danger read-only:bg-surface-2"
        style={{ padding: `${pad(0.6)} ${pad(0.75)}`, minHeight: 44 }}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-[0.75rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[0.75rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SignIn({ onSignIn }: { onSignIn: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter an email address like name@example.com.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      setNotice("Check the highlighted fields.");
      return;
    }
    setBusy(true);
    setNotice("Signing in…");
    window.setTimeout(() => {
      const local = email.split("@")[0] ?? "user";
      onSignIn({ ...playground.mockUser, email, username: local.toLowerCase() });
    }, 650);
  };

  return (
    <form onSubmit={submit} noValidate aria-labelledby="pg-signin-title" className="flex flex-col" style={{ gap: pad(1) }}>
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-accent font-bold text-on-accent" aria-hidden="true">
          A
        </span>
        <span className="text-sm font-semibold">Acme</span>
      </div>
      <div>
        <h3 id="pg-signin-title" className="heading text-[1.6rem]">
          Sign in to Acme
        </h3>
        <p className="mt-1 text-[0.85rem] text-muted">Demo: any email, any password with 8+ characters.</p>
      </div>
      <Field label="Email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="off" />
      <Field label="Password" type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="off" />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-accent font-semibold text-on-accent transition-[filter] hover:brightness-95 disabled:opacity-70"
        style={{ minHeight: 44, padding: pad(0.7) }}
      >
        {busy && <Spinner />} {busy ? "Signing in" : "Continue"}
      </button>
      <div className="flex items-center gap-3 text-[0.75rem] text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <button
        type="button"
        onClick={() => setNotice("Passkeys aren't wired up in this demo. Use email and password.")}
        className="rounded-[var(--radius)] border border-line font-medium transition-colors hover:border-line-strong"
        style={{ minHeight: 44, padding: pad(0.7) }}
      >
        Continue with a passkey
      </button>
      <p role="status" aria-live="polite" className="min-h-[1.2em] text-[0.8rem] text-muted">
        {notice}
      </p>
    </form>
  );
}

function UserProfile({ user, onChange, onSignOut }: { user: User; onChange: (u: User) => void; onSignOut: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user);
  const [mfa, setMfa] = useState(false);
  const [status, setStatus] = useState("Signed in.");
  const editButton = useRef<HTMLButtonElement>(null);
  const initials = `${user.givenName[0] ?? ""}${user.familyName[0] ?? ""}`.toUpperCase();

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.givenName.trim()) {
      setStatus("Given name can't be empty.");
      return;
    }
    onChange(draft);
    setEditing(false);
    setStatus("Profile updated.");
    window.setTimeout(() => editButton.current?.focus(), 0);
  };

  return (
    <section aria-labelledby="pg-profile-title" className="flex flex-col" style={{ gap: pad(1.1) }}>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent-ink" aria-hidden="true">
          {initials}
        </span>
        <div className="min-w-0">
          <h3 id="pg-profile-title" className="heading truncate text-[1.45rem]">
            {user.givenName} {user.familyName}
          </h3>
          <p className="truncate text-[0.85rem] text-muted">
            {user.email} <span className="ml-1 rounded-full border border-line px-1.5 py-px text-[0.7rem]">verified</span>
          </p>
        </div>
      </div>

      <form onSubmit={save} className="rounded-[var(--radius)] border border-line" style={{ padding: pad(1) }} aria-label="Personal details">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-[0.85rem] font-semibold">Personal details</h4>
          {!editing && (
            <button
              ref={editButton}
              type="button"
              onClick={() => {
                setDraft(user);
                setEditing(true);
              }}
              className="rounded-[var(--radius-sm)] px-2 py-1 text-[0.8rem] font-medium text-accent-ink hover:bg-accent-soft"
              style={{ minHeight: 32 }}
            >
              Edit
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2" style={{ gap: pad(0.75) }}>
          <Field label="Given name" value={editing ? draft.givenName : user.givenName} readOnly={!editing} onChange={(v) => setDraft({ ...draft, givenName: v })} />
          <Field label="Family name" value={editing ? draft.familyName : user.familyName} readOnly={!editing} onChange={(v) => setDraft({ ...draft, familyName: v })} />
          <div className="sm:col-span-2">
            <Field label="Username" value={editing ? draft.username : user.username} readOnly={!editing} onChange={(v) => setDraft({ ...draft, username: v })} />
          </div>
        </div>
        {editing && (
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="rounded-[var(--radius)] border border-line px-3 text-[0.85rem]" style={{ minHeight: 40 }}>
              Cancel
            </button>
            <button type="submit" className="rounded-[var(--radius)] bg-accent px-3 text-[0.85rem] font-semibold text-on-accent" style={{ minHeight: 40 }}>
              Save
            </button>
          </div>
        )}
      </form>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-line" style={{ padding: pad(1) }}>
        <div>
          <p id="pg-mfa" className="text-[0.85rem] font-semibold">
            Two-step verification
          </p>
          <p className="text-[0.78rem] text-muted">{mfa ? "On: authenticator app" : "Off"}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={mfa}
          aria-labelledby="pg-mfa"
          onClick={() => {
            setMfa(!mfa);
            setStatus(`Two-step verification ${mfa ? "off" : "on"}.`);
          }}
          className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${mfa ? "border-transparent bg-accent" : "border-line-strong bg-surface-2"}`}
        >
          <span className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-bg shadow transition-[left] ${mfa ? "left-6" : "left-0.5"}`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p role="status" aria-live="polite" className="text-[0.8rem] text-muted">
          {status}
        </p>
        <button type="button" onClick={onSignOut} className="rounded-[var(--radius)] border border-line px-3 text-[0.85rem] hover:border-line-strong" style={{ minHeight: 40 }}>
          Sign out
        </button>
      </div>
    </section>
  );
}
