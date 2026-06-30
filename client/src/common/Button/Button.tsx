import styles from "./Button.module.css";

interface ButtonProps {
  text: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

const Button = ({
  text,
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      className={styles.button}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
