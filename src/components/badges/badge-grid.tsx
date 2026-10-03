import { View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { BADGES } from '@/lib/badges';
import { useBadges } from '@/store/badges';
import { useT } from '@/hooks/use-t';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/** 12 rozetlik 3 sütunlu grid — açılanlar renkli, kilitliler soluk */
export function BadgeGrid() {
  const t = useT();
  const unlocked = useBadges((s) => s.unlocked);

  return (
    <View className="flex-row flex-wrap gap-3">
      {BADGES.map((badge) => {
        const isOpen = Boolean(unlocked[badge.id]);
        const Icon = badge.icon;
        return (
          <View
            key={badge.id}
            className={cn(
              'w-[31%] flex-grow items-center gap-2 rounded-2xl border p-3.5',
              isOpen ? 'border-border/70 bg-card' : 'border-border/40 bg-card/40',
            )}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: isOpen ? `${badge.color}1F` : '#17171B',
                borderWidth: 1.5,
                borderColor: isOpen ? `${badge.color}4D` : '#232329',
              }}
            >
              {isOpen ? (
                <Icon size={22} color={badge.color} strokeWidth={2} />
              ) : (
                <Lock size={19} color="#4A4A55" />
              )}
            </View>
            <Text
              variant="tiny"
              className={cn(
                'text-center font-sans-semibold',
                isOpen ? 'text-foreground' : 'text-muted-foreground/70',
              )}
              numberOfLines={1}
            >
              {t(badge.titleKey) as string}
            </Text>
            <Text
              variant="micro"
              className="text-center text-muted-foreground/50"
              style={{ fontSize: 9, lineHeight: 12 }}
              numberOfLines={2}
            >
              {t(badge.descKey) as string}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
