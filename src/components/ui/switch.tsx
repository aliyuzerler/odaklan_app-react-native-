import * as React from 'react';
import { View } from 'react-native';
import * as SwitchPrimitive from '@rn-primitives/switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'h-7 w-12 shrink-0 items-center rounded-full border border-transparent',
      props.checked ? 'bg-primary' : 'bg-secondary',
      'disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
        props.checked ? 'translate-x-6' : 'translate-x-0.5',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';

export { Switch };
