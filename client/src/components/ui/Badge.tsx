import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "info";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  dot = false,
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  }[size];

  const variantStyles = {
    primary: "bg-[#5651D8]/10 text-[#5651D8] border border-[#5651D8]/20",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
  }[variant];

  const dotColors = {
    primary: "bg-[#5651D8]",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-gray-400",
    info: "bg-sky-500",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${dotColors}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
