import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, glass = false, hover = false, children, ...props }) => (
  <div
    className={cn(
      'glass-card',
      hover && 'glass-card-hover cursor-pointer',
      glass && 'bg-[rgb(var(--bg-glass))] backdrop-blur-xl',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6 pb-0', className)} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-[rgb(var(--text-primary))]', className)} {...props}>
    {children}
  </h3>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6 pt-0 flex items-center', className)} {...props}>
    {children}
  </div>
);