import * as React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogOverlayAnimated({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay asChild {...props}>
      <Animated.View
        entering={FadeIn.duration(160)}
        exiting={FadeOut.duration(120)}
        className={cn('absolute inset-0 z-40 bg-black/70', className)}
      />
    </DialogPrimitive.Overlay>
  );
}

/** İçerik, overlay'in ortasında kart olarak gösterilir */
function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlayAnimated />
      <DialogPrimitive.Content
        pointerEvents="box-none"
        className={cn('absolute inset-0 z-50 items-center justify-center p-6', className)}
        {...props}
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="w-full max-w-sm gap-5 rounded-3xl border border-border bg-popover p-6"
        >
          {children}
        </Animated.View>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Title asChild>
      <Text variant="h3" className={className}>
        {children}
      </Text>
    </DialogPrimitive.Title>
  );
}

function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Description asChild>
      <Text variant="small" className={cn('text-muted-foreground', className)}>
        {children}
      </Text>
    </DialogPrimitive.Description>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPrimitive,
};
