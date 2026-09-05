import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 조건부 클래스 병합 (shadcn 과 동일한 헬퍼) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1.0 → "1", 1.5 → "1.5" */
export function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** 배경색 위에 올릴 글자색을 밝기로 결정 */
export function readableTextColor(hex?: string | null) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#111111';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#111111' : '#ffffff';
}

export function hexToRgb(hex?: string | null) {
  if (!hex) return null;
  const normalized = hex.replace('#', '').trim();
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** #RRGGBB 색에 투명도를 입혀 rgba 문자열로 만든다 */
export function withAlpha(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** 입력값을 #RRGGBB 형태로 보정. 유효하지 않으면 null */
export function normalizeHex(input?: string | null) {
  const rgb = hexToRgb(input);
  if (!rgb) return null;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

export function formatDate(date?: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 문자열을 숫자로. 빈 값/이상값은 fallback */
export function toNumber(value: string, fallback = 0) {
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}
