import { type Href } from 'expo-router';
import {
  AlertTriangle,
  Blocks,
  Disc3,
  Palette,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { type ComponentType } from 'react';

import type { DashboardCardSize } from '@/db/schema';

import { PaintsCard } from '@/features/dashboard/cards/paints-card';
import {
  LowStockCard,
  MaskingCard,
  ProjectsCard,
  ShoppingCard,
  SuppliesCard,
} from '@/features/dashboard/cards/secondary-cards';

/** 카드 본문은 크기를 받아 작은 카드에서는 요약만 그린다. */
export type DashboardCardContentProps = { size: DashboardCardSize };

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
  defaultSize: DashboardCardSize;
  Content: ComponentType<DashboardCardContentProps>;
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
    defaultSize: 'large',
    Content: PaintsCard,
  },
  {
    id: 'projects',
    title: '프라모델 관리',
    description: '미조립 킷과 제작 중인 킷을 관리합니다.',
    icon: Blocks,
    href: '/projects',
    defaultVisible: true,
    defaultOrder: 1,
    defaultSize: 'large',
    Content: ProjectsCard,
  },
  {
    id: 'masking',
    title: '마스킹 테이프',
    description: '폭(mm)별로 남은 롤 수를 관리합니다.',
    icon: Disc3,
    href: '/masking',
    defaultVisible: true,
    defaultOrder: 2,
    defaultSize: 'small',
    Content: MaskingCard,
  },
  {
    id: 'supplies',
    title: '모델링 용품',
    description: '사포·접착제·퍼티·공구 등 나머지 용품 재고입니다.',
    icon: Wrench,
    href: '/supplies',
    defaultVisible: true,
    defaultOrder: 3,
    defaultSize: 'small',
    Content: SuppliesCard,
  },
  {
    id: 'lowStock',
    title: '재고 부족',
    description: '기준치 이하로 떨어진 도료와 용품을 모아 봅니다.',
    icon: AlertTriangle,
    defaultVisible: false,
    defaultOrder: 4,
    defaultSize: 'large',
    Content: LowStockCard,
  },
  {
    id: 'shopping',
    title: '구매 목록',
    description: '사야 할 도료와 용품 목록입니다.',
    icon: ShoppingCart,
    href: '/shopping',
    defaultVisible: false,
    defaultOrder: 5,
    defaultSize: 'small',
    Content: ShoppingCard,
  },
];

export function findCard(id: string) {
  return DASHBOARD_CARDS.find((card) => card.id === id) ?? null;
}
