import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'positive' | 'warning' | 'danger';
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'card p-6 sm:p-8';
  
  const variantClasses = {
    default: '',
    positive: 'border-[rgba(4,210,128,.18)] bg-[rgba(4,210,128,.05)]',
    warning: 'border-[rgba(245,158,11,.18)] bg-[rgba(245,158,11,.05)]',
    danger: 'border-[rgba(239,68,68,.18)] bg-[rgba(239,68,68,.05)]'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
