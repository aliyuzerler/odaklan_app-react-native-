import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textVariants = cva('text-foreground font-sans', {
  variants: {
    variant: {
      h1: 'font-sans-extrabold text-3xl tracking-tight',
      h2: 'font-sans-bold text-2xl tracking-tight',
      h3: 'font-sans-semibold text-xl',
      h4: 'font-sans-semibold text-lg',
      large: 'font-sans text-lg',
      base: 'font-sans text-base leading-6',
      small: 'font-sans text-sm leading-5',
      tiny: 'font-sans text-xs leading-4',
      micro: 'font-sans-medium text-[10px] tracking-wide uppercase',
      muted: 'font-sans text-base text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'base',
  },
});

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNText> & VariantProps<typeof textVariants>) {
  const textClassName = React.useContext(TextClassContext);
  return (
    <RNText
      className={cn(textVariants({ variant }), textClassName, className)}
      {...props}
    />
  );
}

export { Text, textVariants, TextClassContext };
