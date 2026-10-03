import * as React from 'react';
import { View } from 'react-native';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex-row rounded-2xl bg-secondary p-1', className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5',
        'data-[selected=true]:bg-card data-[selected=true]:shadow-sm',
        className,
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          variant="small"
          className={cn('font-sans-semibold', 'text-muted-foreground')}
          {...(props as object)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('pt-4', className)}
      {...props}
    />
  );
}

function TabsTriggerLabel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <Text variant="small" className={cn('font-sans-semibold', active ? 'text-foreground' : 'text-muted-foreground')}>
      {children}
    </Text>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsTriggerLabel };
