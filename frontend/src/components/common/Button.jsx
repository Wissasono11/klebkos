import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 focus:outline-none disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm',
    secondary: 'bg-white border border-brand-border text-brand-text-main hover:bg-brand-surface-2 shadow-sm',
    accent: 'bg-brand-secondary hover:bg-brand-secondary-hover text-white shadow-md',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    ghost: 'text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface-2',
    pill: 'bg-brand-surface-2 text-brand-text-muted hover:bg-brand-primary-subtle hover:text-brand-primary rounded-full'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs px-3.5 py-2 rounded-xl gap-2',
    lg: 'text-sm px-5 py-2.5 rounded-xl gap-2.5',
    round: 'p-2 rounded-full',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};
