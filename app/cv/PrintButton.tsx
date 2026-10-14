"use client";

export function PrintButton() {
  return (
    <button type="button" className="js-only btn btn-ghost" onClick={() => window.print()}>
      Print
    </button>
  );
}
