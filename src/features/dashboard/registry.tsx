import { type Href } from 'expo-router';
import {
  AlertTriangle,
  Boxes,
  Palette,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { type ComponentType } from 'react';

import { PaintsCard } from '@/features/dashboard/cards/paints-card';
import {
  LowStockCard,
  ProjectsCard,
  ShoppingCard,
  SuppliesCard,
} from '@/features/dashboard/cards/secondary-cards';

export type DashboardCardDefinition = {
  /** DB(dashboard_cards.card_id) 에 저장되는 식별자. 한 번 정하면 바꾸지 않는다. */
  id: string;
  title: string;
  /** 카드 추가 목록에서 보여줄 설명 */
  description: string;
  icon: LucideIcon;
  /** 카드 제목을 눌렀을 때 이동할 화면 */
  href?: Href;
  /** 사용자가 설정을 바꾸기 전의 기본 노출 여부 */
  defaultVisible: boolean;
  defaultOrder: number;
  Content: ComponentType;
};

/**
 * 대시보드에 올릴 수 있는 카드 목록.
 * 새 기능을 만들면 이 배열에 항목을 하나 추가하면 대시보드에서 바로 쓸 수 있다.
 */
export const DASHBOARD_CARDS: DashboardCardDefinition[] = [
  {
    id: 'paints',
    title: '도료 관리',
    description: '보유 도료 재고를 보고 바로 늘리거나 줄입니다.',
    icon: Palette,
    href: '/paints',
    defaultVisible: true,
    defaultOrder: 0,
    Content: PaintsCard,
  },
  {
    id: 'lowStock',
    title: '재고 부족',
    description: '기준치 이하로 떨어진 도료와 소모품을 모아 봅니다.',
    icon: AlertTriangle,
    defaultVisible: false,
    defaultOrder: 1,
    Content: LowStockCard,
  },
  {
    id: 'shopping',
    title: '구매 목록',
    description: '사야 할 도료와 소모품 목록입니다.',
    icon: ShoppingCart,
    href: '/shopping',
    defaultVisible: false,
    defaultOrder: 2,
    Content: ShoppingCard,
  },
  {
    id: 'supplies',
    title: '소모품',
    description: '사포·접착제·마스킹 등 소모품 재고 요약입니다.',
    icon: Wrench,
    href: '/supplies',
    defaultVisible: false,
    defaultOrder: 3,
    Content: SuppliesCard,
  },
  {
    id: 'projects',
    title: '제작 중인 킷',
    description: '진행 중인 킷과 상태를 봅니다.',
    icon: Boxes,
    href: '/projects',
    defaultVisible: false,
    defaultOrder: 4,
    Content: ProjectsCard,
  },
];

export function findCard(id: string) {
  return DASHBOARD_CARDS.find((card) => card.id === id) ?? null;
}
