import * as React from 'react';
import { Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { TextClassContext } from '@/components/ui/text';

const buttonVariants = cva('flex-row items-center justify-center gap-2 rounded-2xl', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
      outline: 'border border-border bg-transparent',
      ghost: 'bg-transparent',
      destructive: 'bg-destructive',
      link: 'bg-transparent',
    },
    size: {
      default: 'h-12 px-6',
      sm: 'h-9 rounded-xl px-3',
      lg: 'h-14 rounded-2xl px-8',
      icon: 'h-10 w-10 rounded-xl',
      'icon-sm': 'h-8 w-8 rounded-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const buttonTextVariants = cva('text-center font-sans-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
      link: 'text-primary underline',
    },
    size: {
      default: 'text-base',
      sm: 'text-sm',
      lg: 'text-lg',
      icon: '',
      'icon-sm': '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

/**
 * Kullanım: <Button><Text>Başlat</Text></Button> — metin stili context'ten gelir.
 */
const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  React.ComponentPropsWithoutRef<typeof Pressable> &
    VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        ref={ref}
        className={cn(
          'active:opacity-80 disabled:opacity-40 web:cursor-pointer',
          buttonVariants({ variant, size }),
          className,
        )}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
});
Button.displayName = 'Button';

export { Button, buttonTextVariants, buttonVariants };
