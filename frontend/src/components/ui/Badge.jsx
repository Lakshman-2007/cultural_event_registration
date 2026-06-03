import React from "react";

export const Badge = ({
  variant = "info",
  children,
  className = "",
}) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    info: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
    gold: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
