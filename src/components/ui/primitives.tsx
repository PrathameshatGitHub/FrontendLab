import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Button component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          {
            // Variants
            'bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-lg shadow-emerald-500/10': variant === 'primary',
            'bg-stone-800 text-stone-100 hover:bg-stone-700 hover:text-white border border-stone-700': variant === 'secondary',
            'bg-transparent text-stone-300 border border-stone-800 hover:bg-stone-900 hover:text-white': variant === 'outline',
            'bg-transparent text-stone-400 hover:bg-stone-900 hover:text-stone-100': variant === 'ghost',
            'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300': variant === 'danger',
            // Sizes
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// 2. Input component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-stone-800 bg-stone-950/50 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 transition-all duration-200 focus:outline-none focus:border-stone-700 focus:ring-2 focus:ring-stone-800 focus:bg-stone-950',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// 3. Card component
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-stone-800 bg-stone-900/40 backdrop-blur-md text-stone-100 shadow-md transition-all duration-300',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-stone-400', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-6 pt-0 border-t border-stone-800/30', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

// 4. Badge component
export const Badge = ({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-stone-800 text-stone-200': variant === 'default',
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': variant === 'success',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20': variant === 'warning',
          'bg-red-500/10 text-red-400 border border-red-500/20': variant === 'destructive',
          'bg-blue-500/10 text-blue-400 border border-blue-500/20': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
};

// 5. Label component
export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none text-stone-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';

// 6. Select component
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 transition-all duration-200 focus:outline-none focus:border-stone-700 focus:ring-2 focus:ring-stone-800',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
