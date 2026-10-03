import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

const Card = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn('rounded-3xl border border-border/60 bg-card', className)}
    {...props}
  />
));
Card.displayName = 'Card';

function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('gap-1.5 px-5 pt-5', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return <Text variant="h4" className={cn(className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  return <Text variant="small" className={cn('text-muted-foreground', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('px-5 pb-5 pt-3', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<typeof View>) {
  return <View className={cn('flex-row items-center px-5 pb-5', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
