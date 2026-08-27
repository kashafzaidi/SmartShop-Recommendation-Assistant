import { Check, ChevronDown, ChevronUp, GitCompareArrows, Heart, Laptop, Smartphone, Headphones, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/data/products';

type ProductVisualProps = { product: Product };

export function ProductVisual({ product }: ProductVisualProps) {
  const Icon = product.category === 'laptop'
    ? Laptop
    : product.category === 'headphones'
      ? Headphones
      : product.category === 'smartphone'
        ? Smartphone
        : product.category === 'beauty'
          ? Sparkles
          : ShoppingBag;
  return (
    <div className={`product-surface relative flex h-[170px] items-center justify-center overflow-hidden rounded-xl ${product.visual}`} data-testid={`visual-product-${product.id}`}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[18px] border-white/20" />
      <div className="absolute -bottom-12 -left-5 h-32 w-32 rounded-full border border-white/30" />
      <div className="relative flex h-24 w-28 items-center justify-center rounded-2xl border border-white/55 bg-white/45 shadow-[0_14px_20px_rgba(23,59,63,.16)] backdrop-blur-sm">
        <Icon className="h-12 w-12 text-[hsl(var(--foreground))]" strokeWidth={1.3} />
      </div>
      {product.category === 'laptop' && <div className="absolute bottom-7 h-2 w-36 rounded-full bg-[hsl(var(--foreground))]/60" />}
      {product.category !== 'laptop' && <div className="absolute bottom-5 rounded-full bg-white/55 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[hsl(var(--foreground))]/70">smart pick</div>}
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  isCompared: boolean;
  isSaved: boolean;
  onCompare: (product: Product) => void;
  onSave: (product: Product) => void;
};

export function ProductCard({ product, isCompared, isSaved, onCompare, onSave }: ProductCardProps) {
  const [showReason, setShowReason] = useState(false);
  return (
    <article className="group rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-3 shadow-[0_2px_0_hsl(190_38%_16%/.03),0_7px_18px_hsl(190_38%_16%/.04)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_hsl(190_38%_16%/.1)]" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <ProductVisual product={product} />
        <span className="absolute left-3 top-3 rounded-full bg-[hsl(var(--foreground))] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[.12em] text-[hsl(var(--background))]">{product.badge}</span>
        <button type="button" onClick={() => onSave(product)} className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/55 backdrop-blur transition-colors hover:bg-white ${isSaved ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`} aria-label={`${isSaved ? 'Remove' : 'Save'} ${product.name}`} data-testid={`button-save-${product.id}`}>
          <Heart className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{product.brand}</p>
            <h3 className="mt-1 font-serif text-xl leading-tight text-[hsl(var(--foreground))]" data-testid={`text-product-${product.id}`}>{product.name}</h3>
          </div>
          <p className="font-mono text-lg font-bold text-[hsl(var(--foreground))]" data-testid={`text-price-${product.id}`}>₹{product.price.toLocaleString('en-IN')}</p>
        </div>
        <p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">{product.tagline}</p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-semibold text-[hsl(var(--foreground))]"><span className="text-[hsl(var(--primary))]">★</span> {product.rating}</span>
          <span className="text-[hsl(var(--muted-foreground))]">({product.reviews.toLocaleString('en-IN')} reviews)</span>
        </div>
        <button type="button" onClick={() => setShowReason((value) => !value)} className="mt-4 flex w-full items-center justify-between rounded-lg bg-[hsl(var(--muted))]/60 px-3 py-2 text-left text-xs font-semibold text-[hsl(var(--secondary))] transition-colors hover:bg-[hsl(var(--muted))]" data-testid={`button-reason-${product.id}`}>
          <span className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--accent))]"><Check className="h-3 w-3" /></span> Why this pick</span>
          {showReason ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {showReason && <p className="smartshop-rise px-3 pb-1 pt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{product.reason}</p>}
        <button type="button" onClick={() => onCompare(product)} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors ${isCompared ? 'border-[hsl(var(--secondary))] bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]' : 'border-[hsl(var(--border))] text-[hsl(var(--secondary))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'}`} data-testid={`button-compare-${product.id}`}>
          {isCompared ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
          {isCompared ? 'Added to compare' : 'Add to compare'}
        </button>
      </div>
    </article>
  );
}