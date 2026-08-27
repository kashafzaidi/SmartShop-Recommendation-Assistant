import { products, type Product, type ProductCategory } from '@/data/products';

export type SearchResult = {
  products: Product[];
  category: ProductCategory | null;
  budget: number | null;
  intent: string;
};

type RecommendationOptions = {
  category?: ProductCategory;
  budget?: number | null;
};

const categoryWords: Record<ProductCategory, string[]> = {
  laptop: ['laptop', 'notebook', 'coding', 'computer'],
  headphones: ['headphone', 'headphones', 'earphone', 'audio', 'focus'],
  smartphone: ['smartphone', 'phone', 'camera', 'mobile'],
  fashion: ['fashion', 'clothes', 'clothing', 'jeans', 'jacket', 'shoes', 'sneakers', 'shirt'],
  beauty: ['beauty', 'skincare', 'skin', 'makeup', 'sunscreen', 'moisturizer', 'face', 'lipstick'],
};

export function recommendProducts(query: string, options: RecommendationOptions = {}): SearchResult {
  const normalized = query.toLowerCase();
  const inferredCategory = (Object.keys(categoryWords) as ProductCategory[]).find((key) =>
    categoryWords[key].some((word) => normalized.includes(word)),
  ) ?? null;
  const category = options.category ?? inferredCategory;
  const budgetMatch = normalized.match(/(?:under|below|within|less than)\s*(?:₹|rs\.?\s*)?([\d,]+)/i);
  const budget = options.budget !== undefined
    ? options.budget
    : budgetMatch
      ? Number(budgetMatch[1].replace(/,/g, ''))
      : null;
  const words = normalized.split(/\s+/).filter((word) => word.length > 2);
  if (!category) return { products: [], category: null, budget, intent: 'needs a little more detail' };
  const pool = products.filter((product) => !category || product.category === category);
  const filtered = budget ? pool.filter((product) => product.price <= budget) : pool;
  const source = budget ? filtered : pool;
  const ranked = [...source].sort((a, b) => {
    const score = (product: Product) => words.reduce((total, word) => total + (product.tags.some((tag) => tag.includes(word)) ? 3 : 0), 0) + product.rating;
    return score(b) - score(a);
  });
  return { products: ranked, category, budget, intent: normalized.includes('camera') ? 'camera confidence' : category ? `${category} shortlist` : 'smart shortlist' };
}