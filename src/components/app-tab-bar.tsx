import * as React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Target, Timer, TrendingUp, UserRound, type LucideIcon } from 'lucide-react-native';
import Animated, { Layout } from 'react-native-reanimated';

/** expo-router Tabs tabBar prop'una yapısal olarak uyumlu minimal tip */
type TabBarState = {
  index: number;
  routes: { key: string; name: string }[];
};
type TabBarNavigation = {
  navigate: (name: string) => void;
};

import { cn } from '@/lib/utils';
import { Haptics } from '@/lib/haptics';
import { useT } from '@/hooks/use-t';
import { Text } from '@/components/ui/text';

const TAB_ICONS: Record<string, { icon: LucideIcon; labelKey: string }> = {
  index: { icon: Target, labelKey: 'tabs.today' },
  focus: { icon: Timer, labelKey: 'tabs.focus' },
  stats: { icon: TrendingUp, labelKey: 'tabs.stats' },
  profile: { icon: UserRound, labelKey: 'tabs.profile' },
};

/** Premium koyu tab bar — aktif sekmede yumuşak hareket eden pill arka planı */
export function AppTabBar({ state, navigation }: { state: TabBarState; navigation: TabBarNavigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0 z-20"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View
        className="mx-4 flex-row rounded-[28px] border border-border/80 bg-card/95 px-1.5 py-1.5"
        style={{
          shadowColor: '#000000',
          shadowOpacity: 0.5,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 14,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const def = TAB_ICONS[route.name];
          if (!def) return null;
          const Icon = def.icon;
          return (
            <Pressable
              key={route.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              className="flex-1"
              onPress={() => {
                Haptics.tap();
                navigation.navigate(route.name);
              }}
            >
              <Animated.View
                layout={Layout.springify().damping(19).stiffness(240)}
                className={cn(
                  'items-center gap-1 rounded-3xl py-2.5',
                  focused && 'bg-accent',
                )}
              >
                <Icon
                  size={21}
                  color={focused ? '#34D399' : '#6B6B76'}
                  strokeWidth={focused ? 2.4 : 2}
                />
                <Text
                  className={cn(
                    'font-sans-medium text-[10px]',
                    focused ? 'text-accent-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t(def.labelKey) as string}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
