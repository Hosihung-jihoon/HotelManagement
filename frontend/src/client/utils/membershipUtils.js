export const POINT_TO_VND_RATE = 10000;

export const DEFAULT_MEMBERSHIP_TIERS = [
  {
    id: 1,
    tierName: 'Đồng',
    minPoints: 0,
    discountPercent: 5,
    displayOrder: 1,
    pointMultiplier: 1,
    benefits: 'Giảm 5% giá phòng\nƯu tiên check-in\nNước chào mừng',
    redeemOptions: '500 điểm = voucher 50.000đ',
  },
  {
    id: 2,
    tierName: 'Bạc',
    minPoints: 2000,
    discountPercent: 7,
    displayOrder: 2,
    pointMultiplier: 1.2,
    benefits: 'Giảm 7% giá phòng\n10% spa/F&B\nLate checkout nếu còn phòng',
    redeemOptions: '500 điểm = voucher 50.000đ\n1.500 điểm = breakfast for 2',
  },
  {
    id: 3,
    tierName: 'Vàng',
    minPoints: 8000,
    discountPercent: 10,
    displayOrder: 3,
    pointMultiplier: 1.5,
    benefits: 'Giảm 10% giá phòng\nUpgrade nếu còn phòng\n15% spa/F&B\nQuà sinh nhật',
    redeemOptions: '1.500 điểm = breakfast for 2\n3.000 điểm = airport transfer',
  },
  {
    id: 4,
    tierName: 'Kim cương',
    minPoints: 20000,
    discountPercent: 15,
    displayOrder: 4,
    pointMultiplier: 2,
    benefits: 'Giảm 15% giá phòng\nHỗ trợ ưu tiên\nLate checkout bảo đảm\nAirport transfer',
    redeemOptions: '3.000 điểm = airport transfer\n5.000 điểm = room upgrade 1 hạng',
  },
];

export function parseMembershipList(value) {
  return (value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeMembershipTier(tier) {
  return {
    pointToVndRate: POINT_TO_VND_RATE,
    ...tier,
    discountPercent: Number(tier.discountPercent || 0),
    minPoints: Number(tier.minPoints || 0),
    displayOrder: Number(tier.displayOrder || 0),
    pointMultiplier: Number(tier.pointMultiplier || 1),
    benefitsList: parseMembershipList(tier.benefits || tier.amenities),
    redeemOptionsList: parseMembershipList(tier.redeemOptions || tier.services),
  };
}

export function getMembershipVisual(tierName) {
  const value = (tierName || '').toLowerCase();
  if (value.includes('kim')) {
    return {
      key: 'diamond',
      icon: 'Crown',
      gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      textColor: '#111827',
      color: '#111827',
    };
  }
  if (value.includes('vàng') || value.includes('vang')) {
    return {
      key: 'gold',
      icon: 'Crown',
      gradient: 'linear-gradient(135deg, #f6e27a 0%, #c9a84c 100%)',
      textColor: '#a16207',
      color: '#a16207',
    };
  }
  if (value.includes('bạc') || value.includes('bac')) {
    return {
      key: 'silver',
      icon: 'Gem',
      gradient: 'linear-gradient(135deg, #e8edf2 0%, #8a9db5 100%)',
      textColor: '#475569',
      color: '#475569',
    };
  }
  return {
    key: 'bronze',
    icon: 'Award',
    gradient: 'linear-gradient(135deg, #f0d0b8 0%, #a0674a 100%)',
    textColor: '#92400e',
    color: '#92400e',
  };
}
