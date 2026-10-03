import { useRef, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Layout,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Target, Timer, Flame, type LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';
import { useT } from '@/hooks/use-t';
import { useSettings } from '@/store/settings';
import { Haptics } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type SlideDef = {
  key: 'goals' | 'focus' | 'growth';
  icon: LucideIcon;
  color: string;
};

const SLIDES: SlideDef[] = [
  { key: 'goals', icon: Target, color: '#10B981' },
  { key: 'focus', icon: Timer, color: '#F59E0B' },
  { key: 'growth', icon: Flame, color: '#8B5CF6' },
];

export default function OnboardingScreen() {
  const t = useT();
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const scrollX = useSharedValue(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const finish = () => {
    Haptics.buttonPress();
    useSettings.getState().completeOnboarding();
    router.replace('/(tabs)');
  };

  const goNext = () => {
    Haptics.buttonPress();
    const next = Math.min(page + 1, SLIDES.length - 1);
    pagerRef.current?.setPage(next);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Atla */}
      <View
        className="absolute right-0 z-10 w-full flex-row justify-end px-6"
        style={{ paddingTop: insets.top + 12 }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={finish}
          hitSlop={12}
          className="rounded-full border border-border bg-card/70 px-4 py-2"
        >
          <Text variant="small" className="text-muted-foreground">
            {t('onboarding.skip') as string}
          </Text>
        </Pressable>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
        onPageScroll={(e) => {
          scrollX.value = e.nativeEvent.position + e.nativeEvent.offset;
        }}
      >
        {SLIDES.map((slide, index) => (
          <OnboardingSlide
            key={slide.key}
            slide={slide}
            index={index}
            width={width}
            scrollX={scrollX}
          />
        ))}
      </PagerView>

      {/* Alt kontroller */}
      <View className="gap-6 px-8" style={{ paddingBottom: insets.bottom + 28 }}>
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <Animated.View
              key={slide.key}
              layout={Layout.springify().damping(20)}
              className={cn(
                'h-2 rounded-full',
                index === page ? 'w-7 bg-primary' : 'w-2 bg-secondary',
              )}
            />
          ))}
        </View>

        <Button size="lg" onPress={page < SLIDES.length - 1 ? goNext : finish}>
          <Text className="text-primary-foreground">
            {page < SLIDES.length - 1
              ? (t('onboarding.next') as string)
              : (t('onboarding.getStarted') as string)}
          </Text>
        </Button>
      </View>
    </View>
  );
}

function OnboardingSlide({
  slide,
  index,
  width,
  scrollX,
}: {
  slide: SlideDef;
  index: number;
  width: number;
  scrollX: { value: number };
}) {
  const t = useT();
  const Icon = slide.icon;

  const iconStyle = useAnimatedStyle(() => {
    const translate = interpolate(
      scrollX.value,
      [index - 1, index, index + 1],
      [width * 0.22, 0, -width * 0.22],
    );
    const opacity = interpolate(
      scrollX.value,
      [index - 1, index - 0.6, index, index + 0.6, index + 1],
      [0, 0.4, 1, 0.4, 0],
    );
    return { transform: [{ translateX: translate }], opacity };
  });

  const textStyle = useAnimatedStyle(() => {
    const translate = interpolate(
      scrollX.value,
      [index - 1, index, index + 1],
      [width * 0.1, 0, -width * 0.1],
    );
    return { transform: [{ translateX: translate }] };
  });

  return (
    <View className="flex-1 items-center justify-center px-9">
      <Animated.View style={iconStyle} className="items-center justify-center">
        {/* Katmanlı parıltı */}
        <View
          className="absolute h-56 w-56 rounded-full"
          style={{ backgroundColor: slide.color, opacity: 0.07 }}
        />
        <View
          className="absolute h-40 w-40 rounded-full"
          style={{ backgroundColor: slide.color, opacity: 0.12 }}
        />
        <View
          className="h-24 w-24 items-center justify-center rounded-full border"
          style={{ backgroundColor: `${slide.color}1F`, borderColor: `${slide.color}3D` }}
        >
          <Icon size={44} color={slide.color} strokeWidth={1.8} />
        </View>
      </Animated.View>

      <Animated.View style={textStyle} className="mt-12 items-center gap-4">
        <Text variant="micro" style={{ color: slide.color }}>
          {t(`onboarding.slides.${slide.key}.badge`) as string}
        </Text>
        <Text variant="h1" className="text-center">
          {t(`onboarding.slides.${slide.key}.title`) as string}
        </Text>
        <Text variant="muted" className="text-center leading-7">
          {t(`onboarding.slides.${slide.key}.desc`) as string}
        </Text>
      </Animated.View>
    </View>
  );
}
