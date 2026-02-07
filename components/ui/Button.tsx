import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  className = "",
  children,
  variant = "primary",
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold transition " +
    "border outline-none focus-visible:tf-focus disabled:opacity-60 disabled:cursor-not-allowed";

  const styles: Record<Variant, string> = {
    primary:
      "border-[rgba(var(--border),0.10)] bg-[rgba(var(--accent),0.92)] text-black hover:brightness-110 shadow-glow",
    secondary:
      "border-[rgba(var(--border),0.12)] bg-white/6 hover:bg-white/10 text-white",
    ghost:
      "border-transparent bg-transparent hover:bg-white/7 text-white/80 hover:text-white",
    danger:
      "border-red-500/25 bg-red-500/12 text-red-200 hover:bg-red-500/18",
  };

  return (
    <button className={[base, styles[variant], className].join(" ")} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
