import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { CardShell } from '@/features/dashboard/components/card-shell';
import type { ResolvedCard } from '@/features/dashboard/use-dashboard-layout';
import { useTheme } from '@/hooks/use-theme';

const GAP = 12;
const LONG_PRESS_MS = 300;

type CellLayout = { x: number; y: number; width: number; height: number };

export type DashboardGridProps = {
  items: ResolvedCard[];
  editing: boolean;
  onLift: () => void;
  onMove: (cardId: string, toIndex: number) => void;
  onOpen: (item: ResolvedCard) => void;
  onToggleSize: (cardId: string) => void;
  onRemove: (cardId: string) => void;
};

export function DashboardGrid({
  items,
  editing,
  onLift,
  onMove,
  onOpen,
  onToggleSize,
  onRemove,
}: DashboardGridProps) {
  const containerRef = useRef<View>(null);
  const { colors } = useTheme();

  const origin = useSharedValue({ x: 0, y: 0 });
  /** 셀 위치는 JS 쪽 ref 에 모아 두고 통째로 공유값에 밀어 넣는다 */
  const layoutsRef = useRef<CellLayout[]>([]);
  const layouts = useSharedValue<CellLayout[]>([]);
  const draggingIndex = useSharedValue(-1);
  const dropIndex = useSharedValue(-1);

  const [containerWidth, setContainerWidth] = useState(0);
  const smallWidth = containerWidth > 0 ? (containerWidth - GAP) / 2 : 0;

  const measureOrigin = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      origin.value = { x, y };
    });
  }, [origin]);

  const setCellLayout = useCallback(
    (index: number, layout: CellLayout) => writeCellLayout(layoutsRef, layouts, index, layout),
    [layouts],
  );

  const liftFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const finishDrag = useCallback(
    (cardId: string, target: number) => {
      onLift();

      const fromIndex = items.findIndex((item) => item.card.id === cardId);
      if (target < 0 || target === fromIndex) return;

      Haptics.selectionAsync().catch(() => {});
      onMove(cardId, target);
    },
    [items, onLift, onMove],
  );

  return (
    <View
      ref={containerRef}
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
        measureOrigin();
      }}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}
    >
      {items.map((item, index) => (
        <DraggableCell
          key={item.card.id}
          index={index}
          width={
            containerWidth === 0 ? undefined : item.size === 'small' ? smallWidth : containerWidth
          }
          highlightColor={colors.primary}
          origin={origin}
          layouts={layouts}
          draggingIndex={draggingIndex}
          dropIndex={dropIndex}
          onMeasureOrigin={measureOrigin}
          onLiftFeedback={liftFeedback}
          onLayoutCell={setCellLayout}
          cardId={item.card.id}
          onFinish={finishDrag}
        >
          <CardShell
            definition={item.card}
            size={item.size}
            editing={editing}
            onOpen={item.card.href ? () => onOpen(item) : undefined}
            onToggleSize={() => onToggleSize(item.card.id)}
            onRemove={() => onRemove(item.card.id)}
          />
        </DraggableCell>
      ))}
    </View>
  );
}

function DraggableCell({
  index,
  cardId,
  width,
  highlightColor,
  origin,
  layouts,
  draggingIndex,
  dropIndex,
  children,
  onMeasureOrigin,
  onLiftFeedback,
  onLayoutCell,
  onFinish,
}: {
  index: number;
  cardId: string;
  width?: number;
  highlightColor: string;
  origin: SharedValue<{ x: number; y: number }>;
  layouts: SharedValue<CellLayout[]>;
  draggingIndex: SharedValue<number>;
  dropIndex: SharedValue<number>;
  children: ReactNode;
  onMeasureOrigin: () => void;
  onLiftFeedback: () => void;
  onLayoutCell: (index: number, layout: CellLayout) => void;
  onFinish: (cardId: string, target: number) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = useMemo(
    () =>
      createCellGesture({
        index,
        origin,
        layouts,
        draggingIndex,
        dropIndex,
        translateX,
        translateY,
        scale,
        measure: onMeasureOrigin,
        feedback: onLiftFeedback,
        finish: (target: number) => onFinish(cardId, target),
      }),
    [
      cardId,
      draggingIndex,
      dropIndex,
      index,
      layouts,
      onFinish,
      onLiftFeedback,
      onMeasureOrigin,
      origin,
      scale,
      translateX,
      translateY,
    ],
  );

  const cellStyle = useAnimatedStyle(() => {
    const lifted = draggingIndex.value === index;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: lifted ? 20 : 0,
      elevation: lifted ? 8 : 0,
    };
  });

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: dropIndex.value === index && draggingIndex.value !== index ? 1 : 0,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={(event) => {
          // nativeEvent.layout 객체를 그대로 들고 있으면 재사용되면서 값이 사라진다.
          const { x, y, width: w, height } = event.nativeEvent.layout;
          onLayoutCell(index, { x, y, width: w, height });
        }}
        style={[cellStyle, { width }]}
      >
        {children}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: highlightColor,
            },
            highlightStyle,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

type CellGestureParams = {
  index: number;
  origin: SharedValue<{ x: number; y: number }>;
  layouts: SharedValue<CellLayout[]>;
  draggingIndex: SharedValue<number>;
  dropIndex: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  measure: () => void;
  feedback: () => void;
  finish: (target: number) => void;
};

/**
 * 카드 하나의 롱탭 드래그 제스처.
 * 컴포넌트 밖에서 만들어 두고 useMemo 로 한 번만 생성한다.
 */
function createCellGesture({
  index,
  origin,
  layouts,
  draggingIndex,
  dropIndex,
  translateX,
  translateY,
  scale,
  measure,
  feedback,
  finish,
}: CellGestureParams) {
  return Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .onStart(() => {
      draggingIndex.value = index;
      dropIndex.value = -1;
      scale.value = withSpring(1.03);
      runOnJS(measure)();
      runOnJS(feedback)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      const x = event.absoluteX - origin.value.x;
      const y = event.absoluteY - origin.value.y;

      let found = -1;
      const cells = layouts.value;
      for (let i = 0; i < cells.length; i += 1) {
        const cell = cells[i];
        if (
          cell &&
          x >= cell.x &&
          x <= cell.x + cell.width &&
          y >= cell.y &&
          y <= cell.y + cell.height
        ) {
          found = i;
          break;
        }
      }
      dropIndex.value = found;
    })
    .onEnd(() => {
      runOnJS(finish)(dropIndex.value);
    })
    .onFinalize(() => {
      draggingIndex.value = -1;
      dropIndex.value = -1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });
}

/** 셀 위치를 공유값에 기록한다 (UI 스레드에서 드롭 위치를 계산할 때 쓴다). */
function writeCellLayout(
  store: { current: CellLayout[] },
  layouts: SharedValue<CellLayout[]>,
  index: number,
  layout: CellLayout,
) {
  store.current[index] = layout;
  layouts.value = [...store.current];
}
