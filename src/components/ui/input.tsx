import * as React from 'react';
import { TextInput } from 'react-native';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<
  React.ElementRef<typeof TextInput>,
  React.ComponentPropsWithoutRef<typeof TextInput>
>(({ className, placeholderClassName, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      className={cn(
        'h-12 rounded-xl border border-border bg-secondary/60 px-4 text-base text-foreground placeholder:text-muted-foreground',
        'focus:border-ring web:outline-none',
        className,
      )}
      placeholderTextColor={placeholderClassName ? undefined : '#71717A'}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
