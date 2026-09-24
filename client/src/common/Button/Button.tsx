import React from "react";
import UiButton from "../../components/ui/Button";
import type { ButtonProps } from "../../components/ui/Button";

const Button: React.FC<ButtonProps> = ({
  text,
  children,
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...rest
}) => {
  return (
    <UiButton
      text={text}
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...rest}
    >
      {children}
    </UiButton>
  );
};

export default Button;
export type { ButtonProps };
