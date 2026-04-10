import React, { FC, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-black text-white/20 uppercase tracking-widest ml-2">{label}</label>}
      <input 
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors placeholder:text-white/20 text-white",
          className
        )}
        {...props}
      />
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-black text-white/20 uppercase tracking-widest ml-2">{label}</label>}
      <div className="relative">
        <select 
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-neon/50 transition-colors appearance-none text-white",
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-dark text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
