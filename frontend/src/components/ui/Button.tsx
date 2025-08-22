import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  onClick,
  type = 'button',
  disabled = false
}) => {
  const baseClasses = 'btn font-semibold transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--secondary)] text-[color:var(--dark-bg-base)]',
    secondary: 'bg-transparent border border-[rgba(4,210,128,.18)] text-[color:var(--text-sub)] hover:border-[rgba(4,210,128,.35)]'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
