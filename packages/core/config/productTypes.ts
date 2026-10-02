/**
 * Standard product type values for the productType field.
 * Sellers can also enter custom values not in this list.
 * English values are stored; UI renders via i18n (key: productType.{value}).
 */
export const STANDARD_PRODUCT_TYPES = [
  'Electronics',
  'Clothing & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Books & Media',
  'Toys & Games',
  'Sports & Outdoors',
  'Food & Beverages',
  'Jewelry & Watches',
  'Art & Collectibles',
  'Digital Goods',
  'Services',
  'Handmade',
  'Vintage',
  'Other',
] as const;

export type StandardProductType = (typeof STANDARD_PRODUCT_TYPES)[number];

/**
 * 商品大分类 / Product kind
 *
 * 大分类由已有字段推导，不需要新增数据字段：
 * - 手作：productType 命中 Handmade / craft-* 等（卖家可填自定义值，故做宽松匹配）
 * - 二手：condition 存在且不是 NEW
 * - 普通：其余（含没填成色的情况，避免把普通商品误判成二手）
 */
export type ProductKind = 'new' | 'used' | 'handmade';

const HANDMADE_PRODUCT_TYPE_MARKERS = [
  'handmade',
  'hand made',
  'hand-made',
  'handcraft',
  'craft',
  '手工',
  '手作',
];

function isHandmadeProductType(productType: string): boolean {
  const normalized = productType.trim().toLowerCase();
  if (!normalized) return false;
  return HANDMADE_PRODUCT_TYPE_MARKERS.some(
    marker => normalized === marker || normalized.startsWith(marker + '-') || normalized.startsWith(marker + ' '),
  );
}

/**
 * 推导商品大分类：手作优先，其次看成色，最后落到普通商品。
 * 手作优先是因为三大类互斥，手作是卖家自述的商品性质，优先于成色。
 */
export function resolveProductKind(input: {
  productType?: string | null;
  condition?: string | null;
}): ProductKind {
  if (input.productType && isHandmadeProductType(input.productType)) return 'handmade';
  const condition = (input.condition || '').trim().toUpperCase();
  if (condition && condition !== 'NEW') return 'used';
  return 'new';
}
