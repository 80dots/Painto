import { type ColorValue } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

/** lucide 아이콘과 같은 방식으로 쓰기 위한 공통 props */
export type IconProps = {
  size?: number;
  /** 탭바가 넘겨 주는 ColorValue 도 받는다 */
  color?: ColorValue;
  strokeWidth?: number;
};

/**
 * 도료 공병(스크류 캡이 달린 원통형 병) 아이콘.
 * lucide 와 섞어 써도 어색하지 않도록 24 그리드·선 굵기 2·둥근 끝으로 맞췄다.
 */
export function PaintBottle({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 뚜껑 */}
      <Rect x="8.5" y="2" width="7" height="3.5" rx="1" />
      {/* 병 몸통 */}
      <Rect x="5.5" y="5.5" width="13" height="16.5" rx="3" />
      {/* 남은 도료 선 */}
      <Line x1="5.5" y1="13" x2="18.5" y2="13" />
    </Svg>
  );
}
