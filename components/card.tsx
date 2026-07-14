import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverGlow?: boolean;
}

export function Card({
  children,
  className = '',
  glass = true,
  hoverGlow = true,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-3xl border p-6 transition-all duration-300';
  const glassClasses = glass
    ? 'bg-card/60 backdrop-blur-md border-border/60 shadow-lg'
    : 'bg-background border-border shadow-sm';
  const glowClasses = hoverGlow
    ? 'hover:shadow-xl hover:border-primary/20 hover:scale-[1.005]'
    : '';

  return (
    <div className={`${baseClasses} ${glassClasses} ${glowClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}
export default Card;
