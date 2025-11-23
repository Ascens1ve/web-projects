import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface IModal {
  children: ReactNode;
  onClose: () => void;
}

export const Modal = ({ children, onClose }: IModal) => {
  return createPortal(
    <>
      <div className={styles.overlay} onClick={() => onClose()} />
      <div className={styles.modal}>{children}</div>
    </>,
    document.body,
  );
};
