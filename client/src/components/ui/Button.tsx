import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  loading = false,
  className = "",
  style,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#5651D8] text-white hover:bg-[#4843c2] active:bg-[#3d37a8] shadow-sm focus:ring-[#5651D8]",
    secondary:
      "bg-[#EEF0FD] text-[#5651D8] hover:bg-[#e0e2fb] active:bg-[#d0d3f8] focus:ring-[#5651D8]",
    outline:
      "border border-[#5651D8] text-[#5651D8] bg-transparent hover:bg-[#5651D8]/10 active:bg-[#5651D8]/20 focus:ring-[#5651D8]",
    ghost:
      "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/70 focus:ring-gray-400",
    danger:
      "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 active:bg-red-200 focus:ring-red-400",
  }[variant];

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0 text-current">{icon}</span>
      ) : null}
      {children !== undefined && children !== null ? children : text}
    </button>
  );
};

export default Button;
