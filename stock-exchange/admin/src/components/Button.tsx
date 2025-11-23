import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  type?: 'submit' | 'reset' | 'button';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  color?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'outlined',
  type = 'button',
  onClick,
  color = '#0f6bff',
}) => {
  return (
    <div className={styles[`${variant}-wrapper`]}>
      <button
        type={type}
        className={styles[variant]}
        onClick={onClick}
        style={{ color, borderColor: color }}
      >
        {children}
      </button>
    </div>
  );
};
