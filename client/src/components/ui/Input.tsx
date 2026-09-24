import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightElement,
      id,
      className = "",
      containerClassName = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`w-full rounded-lg border border-[#E0E0E0] bg-[#F9FAFB] text-gray-900 placeholder-gray-400 text-sm px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:border-[#5651D8] focus:bg-white focus:ring-2 focus:ring-[#5651D8]/20 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
              icon ? "pl-10" : ""
            } ${rightElement ? "pr-12" : ""} ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/30"
                : ""
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
