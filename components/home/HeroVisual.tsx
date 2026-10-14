/**
 * The hero's one bold moment: a component drawn like a spec sheet.
 * It renders with the live site tokens, so applying a theme in the playground restyles it too.
 */
export function HeroVisual() {
  const callout = "absolute flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.04em] text-muted";
  const line = "h-px w-10 bg-line-strong";
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[24rem] select-none py-10 pl-6 pr-32">
      <div className="absolute inset-0 rounded-[var(--radius-lg)] border border-dashed border-line" />
      <div className="relative rotate-[-1.5deg] rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.5)]">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-[var(--radius-sm)] bg-accent text-sm font-bold text-on-accent">A</span>
          <span className="text-xs font-semibold">Acme</span>
        </div>
        <p className="heading mt-4 text-[1.5rem]">Welcome back</p>
        <div className="mt-4 space-y-2.5">
          <div className="h-10 rounded-[var(--radius)] border border-line bg-bg" />
          <div className="h-10 rounded-[var(--radius)] border border-line bg-bg" />
          <div className="grid h-10 place-items-center rounded-[var(--radius)] bg-accent text-sm font-semibold text-on-accent">Continue</div>
        </div>
      </div>
      <span className={`${callout} right-3 top-[3.6rem]`}>
        <span className={line} />
        --font-heading
      </span>
      <span className={`${callout} right-3 top-[7.4rem]`}>
        <span className={line} />
        --radius
      </span>
      <span className={`${callout} right-3 top-[10.6rem] text-accent-ink`}>
        <span className={`${line} bg-accent-ink`} />
        --accent
      </span>
      <span className={`${callout} bottom-2 left-6`}>&lt;SignIn /&gt; · themed by tokens</span>
    </div>
  );
}
