import { type Href } from 'expo-router';
import { AlertTriangle, Blocks, Disc3, ShoppingCart, Wrench } from 'lucide-react-native';
import { type ComponentType } from 'react';

import type { TranslationKey } from '@/features/settings/provider';

import { PaintBottle, type IconProps } from '@/components/icons/paint-bottle';
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
  /** 제목 번역 키 */
  titleKey: TranslationKey;
  /** 카드 추가 목록에서 보여줄 설명의 번역 키 */
  descriptionKey: TranslationKey;
  icon: ComponentType<IconProps>;
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
    titleKey: 'cards.paintsTitle',
    descriptionKey: 'cards.paintsDescription',
    icon: PaintBottle,
    href: '/paints',
    defaultVisible: true,
    defaultOrder: 0,
    defaultSize: 'large',
    Content: PaintsCard,
  },
  {
    id: 'projects',
    titleKey: 'cards.projectsTitle',
    descriptionKey: 'cards.projectsDescription',
    icon: Blocks,
    href: '/projects',
    defaultVisible: true,
    defaultOrder: 1,
    defaultSize: 'large',
    Content: ProjectsCard,
  },
  {
    id: 'masking',
    titleKey: 'cards.maskingTitle',
    descriptionKey: 'cards.maskingDescription',
    icon: Disc3,
    href: '/masking',
    defaultVisible: true,
    defaultOrder: 2,
    defaultSize: 'small',
    Content: MaskingCard,
  },
  {
    id: 'supplies',
    titleKey: 'cards.suppliesTitle',
    descriptionKey: 'cards.suppliesDescription',
    icon: Wrench,
    href: '/supplies',
    defaultVisible: true,
    defaultOrder: 3,
    defaultSize: 'small',
    Content: SuppliesCard,
  },
  {
    id: 'lowStock',
    titleKey: 'cards.lowStockTitle',
    descriptionKey: 'cards.lowStockDescription',
    icon: AlertTriangle,
    defaultVisible: false,
    defaultOrder: 4,
    defaultSize: 'large',
    Content: LowStockCard,
  },
  {
    id: 'shopping',
    titleKey: 'cards.shoppingTitle',
    descriptionKey: 'cards.shoppingDescription',
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
