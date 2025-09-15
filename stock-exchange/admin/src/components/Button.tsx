import React from 'react';
import './Button.css';

interface ButtonProps {
    children?: React.ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    type?: 'submit' | 'reset' | 'button';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    color?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'contained',
    type = 'button',
    onClick,
    color = '#0f6bff',
}) => {
    return (
        <div className={`${variant}-wrapper`}>
            <button
                type={type}
                className={variant}
                onClick={onClick}
                style={{ color, borderColor: color }}
            >
                {children}
            </button>
        </div>
    );
};
