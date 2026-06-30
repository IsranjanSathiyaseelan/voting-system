import type { ReactNode } from "react";

import styles from "./Modal.module.css";

interface ModalProps {
  children: ReactNode;
  close: () => void;
}

const Modal = ({ children, close }: ModalProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={close}>
          X
        </button>

        {children}

      </div>
    </div>
  );
};

export default Modal;
