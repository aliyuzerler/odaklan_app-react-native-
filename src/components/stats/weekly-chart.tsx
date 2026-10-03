import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { CartesianChart, Bar, type CartesianChartRenderArg } from 'victory-native';
import {
  useFont,
  Text as SkiaText,
  Line,
  Rect,
  type SkFont,
} from '@shopify/react-native-skia';
import type { WeekPoint, Lang } from '@/lib/types';
import { dayShort } from '@/lib/date';

const INTER_REGULAR = require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf') as number;

type YKey = 'minutes' | 'goalsDone';

/**
 * Son 7 günün Victory Native XL (Skia) bar grafiği.
 * metric 'minutes' → odak dakikaları, 'goals' → tamamlanan hedef sayısı.
 */
export function WeeklyChart({
  data,
  metric,
  lang,
  height = 210,
}: {
  data: WeekPoint[];
  metric: YKey;
  lang: Lang;
  height?: number;
}) {
  const { width } = useWindowDimensions();
  const font = useFont(INTER_REGULAR, 11) as SkFont | null;

  const values = data.map((d) => d[metric]);
  const maxValue = Math.max(30, ...values);
  const todayKeyStr = data[data.length - 1]?.key;

  return (
    <View style={{ width: width - 88, height }}>
      <CartesianChart<WeekPoint, 'key', YKey>
        data={data}
        xKey="key"
        yKeys={['minutes', 'goalsDone']}
        domain={{ y: [0, maxValue * 1.15] }}
        domainPadding={{ left: 18, right: 18 }}
      >
        {(args: CartesianChartRenderArg<WeekPoint, YKey>) => {
          const { points, chartBounds, yScale } = args;
          const series = points[metric];
          return (
            <>
              {/* Y ekseni referans çizgileri */}
              {[0.5, 1].map((f) => (
                <Line
                  key={f}
                  p1={{ x: chartBounds.left, y: yScale(maxValue * f) }}
                  p2={{ x: chartBounds.right, y: yScale(maxValue * f) }}
                  color="#1C1C21"
                  strokeWidth={1}
                />
              ))}

              <Bar
                points={series}
                chartBounds={chartBounds}
                innerPadding={0.42}
                roundedCorners={{ topLeft: 5, topRight: 5 }}
                color={metric === 'minutes' ? '#10B981' : '#8B5CF6'}
                animate={{ type: 'timing', duration: 500 }}
              />

              {/* Gün etiketleri */}
              {data.map((d, i) => {
                if (!font) return null;
                const label = dayShort(d.key, lang);
                const x = series[i]?.x ?? 0;
                const isToday = d.key === todayKeyStr;
                const textWidth = font.getTextWidth(label);
                return (
                  <React.Fragment key={d.key}>
                    {isToday && (
                      <Rect
                        x={x - 11}
                        y={chartBounds.bottom + 6}
                        width={22}
                        height={17}
                        color="#10B98122"
                      />
                    )}
                    <SkiaText
                      x={x - textWidth / 2}
                      y={chartBounds.bottom + 18}
                      text={label}
                      font={font}
                      color={isToday ? '#34D399' : '#6B6B76'}
                    />
                  </React.Fragment>
                );
              })}
            </>
          );
        }}
      </CartesianChart>
    </View>
  );
}
