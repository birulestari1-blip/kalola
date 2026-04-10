import React, { FC, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neon' | 'glass';
}

export const Card: FC<CardProps> = ({ children, className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-dark-lighter border-white/5',
    neon: 'bg-neon text-dark shadow-2xl shadow-neon/20',
    glass: 'bg-white/5 backdrop-blur-md border-white/10',
  };

  return (
    <div 
      className={cn(
        'p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all',
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('flex justify-between items-start mb-6', className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-xl font-black', className)}>{children}</h3>
);
