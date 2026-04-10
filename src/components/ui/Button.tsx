import React, { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export const Button: FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  icon,
  ...props 
}) => {
  const variants = {
    primary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    secondary: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20',
    neon: 'bg-neon text-dark hover:bg-neon-dark font-black',
    ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 rounded-xl font-bold text-sm',
    lg: 'px-8 py-4 rounded-2xl font-black text-lg',
  };

  return (
    <button 
      className={cn(
        'flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {icon && icon}
      {children}
    </button>
  );
};
