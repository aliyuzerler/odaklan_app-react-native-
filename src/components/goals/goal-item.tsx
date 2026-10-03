import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { Haptics } from '@/lib/haptics';
import type { GoalItem } from '@/lib/types';
import { Text } from '@/components/ui/text';

/**
 * Animasyonlu onay kutulu hedef satırı.
 * Silme iki adımlıdır: çöp ikonu → satır onay moduna geçer (4 sn sonra sıfırlanır).
 */
export function GoalItem({
  goal,
  onToggle,
  onDelete,
  testID,
}: {
  goal: GoalItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  testID?: string;
}) {
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(id);
  }, [confirming]);

  const handleToggle = () => {
    if (confirming) return;
    if (!goal.done) Haptics.goalDone();
    onToggle(goal.id);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border p-4',
        goal.done && !confirming ? 'border-primary/25 bg-accent/60' : 'border-border/70 bg-card',
        confirming && 'border-destructive/40 bg-destructive/10',
      )}
      testID={testID}
    >
      {confirming ? (
        // Onay modu
        <View className="flex-1 flex-row items-center gap-3">
          <Text variant="small" numberOfLines={1} className="flex-1 text-muted-foreground">
            {goal.title}
          </Text>
          <Pressable
            onPress={() => setConfirming(false)}
            hitSlop={8}
            className="rounded-lg bg-secondary px-3 py-1.5"
          >
            <X size={16} color="#A1A1AA" />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.goalRemoved();
              onDelete(goal.id);
            }}
            hitSlop={8}
            className="rounded-lg bg-destructive/90 px-3 py-1.5"
          >
            <Text variant="tiny" className="font-sans-semibold text-destructive-foreground">
              Sil
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Onay kutusu */}
          <Pressable
            onPress={handleToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: goal.done }}
            hitSlop={8}
          >
            <View
              className={cn(
                'h-7 w-7 items-center justify-center rounded-lg border-2',
                goal.done ? 'border-primary bg-primary' : 'border-border',
              )}
            >
              {goal.done && (
                <Animated.View entering={ZoomIn.springify().damping(14)}>
                  <Check size={17} color="#064E3B" strokeWidth={3.2} />
                </Animated.View>
              )}
            </View>
          </Pressable>

          {/* Başlık */}
          <Pressable onPress={handleToggle} className="flex-1">
            <Text
              numberOfLines={2}
              className={cn('text-base', goal.done && 'text-muted-foreground line-through')}
            >
              {goal.title}
            </Text>
          </Pressable>

          {/* Sil */}
          <Pressable onPress={() => setConfirming(true)} hitSlop={10} className="p-1.5">
            <Text variant="tiny" className="text-muted-foreground">
              ✕
            </Text>
          </Pressable>
        </>
      )}
    </Animated.View>
  );
}
