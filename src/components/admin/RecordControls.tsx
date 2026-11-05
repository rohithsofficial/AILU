"use client";

/** A submit button that asks first. Use it for anything that cannot be undone. */
export function ConfirmButton({ label, message, className }: { label: string; message: string; className?: string }) {
  return (
    <button
      className={className ?? "text-xs text-red-400 underline"}
      onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}
    >
      {label}
    </button>
  );
}

/** A small closed section that holds an edit form. */
export function EditBox({ label = "Edit", children }: { label?: string; children: React.ReactNode }) {
  return (
    <details className="w-full text-sm">
      <summary className="cursor-pointer text-xs text-ailu-yellow underline">{label}</summary>
      <div className="mt-2 rounded-lg border border-white/10 p-3">{children}</div>
    </details>
  );
}
