import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ProductCard } from '@/components/smart-product';
import { products, type Product, type ProductCategory } from '@/data/products';
import { recommendProducts } from '@/lib/recommendations';
import { ArrowRight, BarChart3, Check, ChevronRight, CircleHelp, Clock3, Command, Heart, History, Menu, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const defaultQuery = 'laptop under 50000 for coding';
  const [query, setQuery] = useState(defaultQuery);
  const [activeQuery, setActiveQuery] = useState(defaultQuery);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => readStorage<string[]>('smartshop-saved', []));
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(() => readStorage<string[]>('smartshop-history', []));
  const [generatedCount, setGeneratedCount] = useState<number>(() => readStorage<number>('smartshop-generated', 0));
  const [notice, setNotice] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const result = useMemo(() => recommendProducts(activeQuery, {
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    budget: selectedBudget ? Number(selectedBudget) : undefined,
  }), [activeQuery, selectedBudget, selectedCategory]);
  const compared = comparedIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
  const saved = savedIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
  const categoryCounts = history.reduce<Record<string, number>>((counts, item) => {
    const category = recommendProducts(item).category;
    if (category) counts[category] = (counts[category] ?? 0) + 1;
    return counts;
  }, {});
  const popularCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'not yet';
  const categoryLabel = popularCategory === 'not yet' ? popularCategory : popularCategory.charAt(0).toUpperCase() + popularCategory.slice(1) + 's';

  useEffect(() => writeStorage('smartshop-saved', savedIds), [savedIds]);
  useEffect(() => writeStorage('smartshop-history', history), [history]);
  useEffect(() => writeStorage('smartshop-generated', generatedCount), [generatedCount]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function submitSearch(event?: FormEvent, suppliedQuery?: string) {
    event?.preventDefault();
    const cleanQuery = (suppliedQuery ?? query).trim();
    if (!cleanQuery && selectedCategory === 'all') {
      setNotice('Try describing an item, a budget, or both.');
      return;
    }
    const searchLabel = cleanQuery || `${selectedCategory} picks`;
    setIsLoading(true);
    setActiveQuery(searchLabel);
    setHistory((current) => [searchLabel, ...current.filter((item) => item.toLowerCase() !== searchLabel.toLowerCase())].slice(0, 5));
    setGeneratedCount((current) => current + 1);
    window.setTimeout(() => setIsLoading(false), 480);
  }

  function useSuggestion(suggestion: string) {
    setQuery(suggestion);
    submitSearch(undefined, suggestion);
  }

  function toggleSave(product: Product) {
    setSavedIds((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]);
    setNotice(savedIds.includes(product.id) ? `${product.name} removed from saved picks.` : `${product.name} saved for later.`);
  }

  function toggleCompare(product: Product) {
    setComparedIds((current) => {
      if (current.includes(product.id)) {
        setNotice(`${product.name} removed from comparison.`);
        return current.filter((id) => id !== product.id);
      }
      if (current.length >= 2) {
        setNotice('Your comparison tray is full. Remove one pick to add another.');
        return current;
      }
      setNotice(`${product.name} added to comparison.`);
      return [...current, product.id];
    });
  }

  const suggestions = ['laptop under 50000 for coding', 'headphones under 3000', 'smartphone with good camera'];
  return (
    <div className="smartshop-grain min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="relative z-20 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a href="#top" className="flex items-center gap-3" data-testid="link-home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[3px_3px_0_hsl(var(--secondary))]"><span className="font-serif text-xl">S</span></span>
            <span className="font-serif text-xl tracking-tight">SmartShop<span className="text-[hsl(var(--primary))]">.</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[hsl(var(--muted-foreground))] md:flex" aria-label="Main navigation">
            <a href="#shortlist" className="transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-shortlist">Shortlist</a>
            <a href="#compare" className="transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-compare">Compare {compared.length > 0 && <span className="ml-1 rounded-full bg-[hsl(var(--primary))] px-1.5 py-0.5 text-[10px] text-white">{compared.length}</span>}</a>
            <a href="#insights" className="transition-colors hover:text-[hsl(var(--foreground))]" data-testid="link-insights">Your insights</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] sm:flex"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Local catalog</div>
            <button type="button" onClick={() => setMobileMenu((current) => !current)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] md:hidden" aria-label="Toggle menu" data-testid="button-toggle-menu"><Menu className="h-4 w-4" /></button>
          </div>
        </div>
        {mobileMenu && <nav className="border-t border-[hsl(var(--border))] px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm font-semibold"><a href="#shortlist" onClick={() => setMobileMenu(false)} data-testid="link-mobile-shortlist">Shortlist</a><a href="#compare" onClick={() => setMobileMenu(false)} data-testid="link-mobile-compare">Compare</a><a href="#insights" onClick={() => setMobileMenu(false)} data-testid="link-mobile-insights">Your insights</a></div></nav>}
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:px-12 lg:pb-20 lg:pt-20">
          <div className="smartshop-rise max-w-2xl">
            <p className="mb-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--primary))]"><span className="h-px w-8 bg-[hsl(var(--primary))]" /> Your practical shopping guide</p>
            <h1 className="max-w-xl font-serif text-5xl leading-[.97] tracking-[-.035em] sm:text-6xl lg:text-[76px]">Good picks.<br /><em className="text-[hsl(var(--primary))]">No guesswork.</em></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">Tell SmartShop what you need in plain words. We’ll turn the fuzzy brief into a short, honest list that respects your budget.</p>
            <form onSubmit={submitSearch} className="search-shadow mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 transition-shadow" data-testid="form-search">
              <Search className="ml-3 h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" placeholder="Try “laptop under 50000 for coding”" aria-label="Describe what you are shopping for" data-testid="input-search" />
              <button type="submit" className="flex shrink-0 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 active:translate-y-0" data-testid="button-search"><span className="hidden sm:inline">Find my picks</span><ArrowRight className="h-4 w-4" /></button>
            </form>
            <div className="mt-3 grid max-w-2xl gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-xs">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Category</span>
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as 'all' | ProductCategory)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" aria-label="Choose a product category" data-testid="select-category">
                  <option value="all">Any category</option>
                  <option value="laptop">Laptops</option>
                  <option value="headphones">Headphones</option>
                  <option value="smartphone">Smartphones</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-xs">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">Budget</span>
                <select value={selectedBudget} onChange={(event) => setSelectedBudget(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" aria-label="Choose a maximum budget" data-testid="select-budget">
                  <option value="">Any budget</option>
                  <option value="3000">Up to ₹3,000</option>
                  <option value="10000">Up to ₹10,000</option>
                  <option value="30000">Up to ₹30,000</option>
                  <option value="50000">Up to ₹50,000</option>
                  <option value="75000">Up to ₹75,000</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-[hsl(var(--muted-foreground))]">Start with:</span>
              {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => useSuggestion(suggestion)} className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-[11px] font-semibold text-[hsl(var(--secondary))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]" data-testid={`button-suggestion-${suggestion.split(' ')[0]}`}>{suggestion}</button>)}
            </div>
          </div>
          <div className="relative hidden min-h-[370px] items-center justify-center lg:flex">
            <div className="absolute right-8 top-5 h-72 w-72 rounded-full bg-[hsl(var(--accent))]/30 blur-3xl" />
            <div className="relative h-[330px] w-[360px] rotate-[-5deg] rounded-[32px] border border-[hsl(var(--secondary))]/10 bg-[hsl(var(--secondary))] p-7 text-[hsl(var(--background))] shadow-[14px_18px_0_hsl(var(--primary))]">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--background))]/60">smartshop / brief</span><CircleHelp className="h-4 w-4 text-[hsl(var(--accent))]" /></div>
              <div className="mt-12 font-serif text-4xl leading-tight">A shortlist<br /><span className="text-[hsl(var(--accent))]">you can trust.</span></div>
              <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between border-t border-white/15 pt-4"><div><p className="font-mono text-[10px] uppercase tracking-widest text-white/50">reasoning included</p><p className="mt-1 text-sm font-semibold">Budget-first. Human-readable.</p></div><Sparkles className="h-7 w-7 text-[hsl(var(--primary))]" /></div>
            </div>
            <div className="absolute bottom-9 left-2 rotate-[7deg] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4 shadow-[0_14px_25px_hsl(190_38%_16%/.12)]"><div className="flex items-center gap-2 text-xs font-bold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--accent))]"><Check className="h-3.5 w-3.5" /></span> Fits your brief</div><p className="mt-1 pl-8 text-[11px] text-[hsl(var(--muted-foreground))]">3 thoughtful matches</p></div>
          </div>
        </section>

        <section id="shortlist" className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))]/35">
          <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--primary))]">Your shortlist</p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Here’s where I’d start</h2>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Based on “{activeQuery}” <span className="mx-1">·</span> {result.products.length} curated matches</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><SlidersHorizontal className="h-4 w-4" /> Sorted by fit, then value</div>
            </div>
            {isLoading ? <LoadingGrid /> : result.products.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{result.products.map((product, index) => <div key={product.id} className="smartshop-rise" style={{ animationDelay: `${index * 70}ms` }}><ProductCard product={product} isCompared={comparedIds.includes(product.id)} isSaved={savedIds.includes(product.id)} onCompare={toggleCompare} onSave={toggleSave} /></div>)}</div> : <EmptyState onReset={() => { setQuery(defaultQuery); setActiveQuery(defaultQuery); }} />}
          </div>
        </section>

        {history.length > 0 && <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12"><div className="flex flex-wrap items-center gap-3"><span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]"><History className="h-3.5 w-3.5" /> Recent searches</span>{history.slice(0, 4).map((item) => <button type="button" key={item} onClick={() => { setQuery(item); setActiveQuery(item); }} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs text-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]" data-testid={`button-history-${item.split(' ')[0]}`}>{item}</button>)}</div></section>}

        <section id="compare" className="mx-auto max-w-[1440px] scroll-mt-20 px-5 pb-14 pt-5 sm:px-8 lg:px-12 lg:pb-20">
          <div className="flex flex-col gap-8 rounded-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-8 lg:flex-row lg:p-10">
            <div className="lg:w-[30%]">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--primary))]">Decision desk</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight">Compare without the spreadsheet.</h2>
              <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Add any two products above. We’ll put the trade-offs side by side so the right choice feels obvious.</p>
              {compared.length === 0 && <div className="mt-7 rounded-xl border border-dashed border-[hsl(var(--border))] p-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Your comparison tray is ready. Pick one product to begin.</div>}
              {compared.length > 0 && <button type="button" onClick={() => setComparedIds([])} className="mt-7 flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))] hover:underline" data-testid="button-clear-compare"><X className="h-3.5 w-3.5" /> Clear comparison</button>}
            </div>
            <ComparisonTable products={compared} onRemove={toggleCompare} />
          </div>
        </section>

        <section id="insights" className="scroll-mt-20 bg-[hsl(var(--secondary))] text-[hsl(var(--background))]">
          <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--accent))]">Your shopping snapshot</p><h2 className="mt-2 font-serif text-3xl sm:text-4xl">A little clarity goes a long way.</h2></div><p className="max-w-sm text-sm leading-6 text-white/60">A private, local summary of how you shop on this device. Nothing leaves your browser.</p></div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              <InsightCard icon={<Search />} value={history.length.toString().padStart(2, '0')} label="recent searches" note={history.length ? 'You’re asking good questions.' : 'Your first shortlist is waiting.'} />
              <InsightCard icon={<BarChart3 />} value={generatedCount.toString().padStart(2, '0')} label="recommendations generated" note={generatedCount ? 'Every search creates a fresh shortlist.' : 'Your first recommendation is waiting.'} />
              <InsightCard icon={<Heart />} value={categoryLabel} label="popular category" note={popularCategory === 'not yet' ? 'Search a category to see a pattern.' : 'Based on your recent searches.'} />
            </div>
          </div>
        </section>
      </main>
      {notice && <div className="smartshop-rise fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-4 py-3 text-xs font-semibold text-[hsl(var(--background))] shadow-xl" role="status" data-testid="status-notice"><Check className="h-4 w-4 text-[hsl(var(--accent))]" /> {notice}</div>}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><p className="font-serif text-lg">SmartShop<span className="text-[hsl(var(--primary))]">.</span></p><p className="text-xs text-[hsl(var(--muted-foreground))]">Thoughtful picks, practical budgets, calmer decisions.</p><div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><Clock3 className="h-3.5 w-3.5" /> Curated locally</div></div></footer>
    </div>
  );
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* local storage can be unavailable in private browsing */ }
}

function LoadingGrid() {
  return <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading recommendations" data-testid="loading-recommendations">{[1, 2, 3].map((item) => <div key={item} className="animate-pulse rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"><div className="h-[170px] rounded-xl bg-[hsl(var(--muted))]" /><div className="space-y-3 px-1 pt-5"><div className="h-3 w-16 rounded bg-[hsl(var(--muted))]" /><div className="h-6 w-32 rounded bg-[hsl(var(--muted))]" /><div className="h-4 w-full rounded bg-[hsl(var(--muted))]" /><div className="h-10 rounded bg-[hsl(var(--muted))]" /></div></div>)}</div>;
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-14 text-center" data-testid="empty-recommendations"><Command className="mx-auto h-8 w-8 text-[hsl(var(--primary))]" /><h3 className="mt-4 font-serif text-2xl">Let’s make that more specific.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">Try naming a product category or adding a budget. For example: “headphones under 3000”.</p><button type="button" onClick={onReset} className="mt-6 rounded-xl bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--background))]" data-testid="button-reset-search">Show a starter shortlist</button></div>;
}

function ComparisonTable({ products: compared, onRemove }: { products: Product[]; onRemove: (product: Product) => void }) {
  if (!compared.length) return <div className="hidden flex-1 items-center justify-center lg:flex"><div className="grid grid-cols-2 gap-4 opacity-50"><div className="h-36 w-36 rounded-2xl border border-dashed border-[hsl(var(--border))]" /><div className="h-36 w-36 rounded-2xl border border-dashed border-[hsl(var(--border))]" /></div></div>;
  const comparisonRows = ['Rating', 'Key reason', ...((compared[0]?.specs ?? []).map((spec) => spec.label))];
  return (
    <div className="min-w-0 flex-1 overflow-x-auto" data-testid="comparison-table">
      <div className="grid min-w-[540px] grid-cols-[110px_repeat(2,minmax(190px,1fr))] gap-x-4 gap-y-5">
        {[0, 1].map((index) => {
          const product = compared[index];
          return (
            <div key={index} className="contents">
              <div className="flex items-end pb-2 text-xs font-bold text-[hsl(var(--muted-foreground))]">{index === 0 ? 'Comparing' : ''}</div>
              {product ? (
                <div className="relative border-b border-[hsl(var(--border))] pb-4">
                  <div className={`product-surface ${product.visual} flex h-24 items-center justify-center rounded-xl`}><span className="font-serif text-xl">{product.brand}</span></div>
                  <button type="button" onClick={() => onRemove(product)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--card))]/80" aria-label={`Remove ${product.name}`} data-testid={`button-remove-compare-${product.id}`}><X className="h-3.5 w-3.5" /></button>
                  <h3 className="mt-3 font-serif text-lg">{product.name}</h3>
                  <p className="mt-1 font-mono text-sm font-bold text-[hsl(var(--primary))]">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">Add another pick</div>
              )}
            </div>
          );
        })}
        {comparisonRows.map((label, rowIndex) => (
          <div className="contents" key={`${label}-${rowIndex}`}>
            <div className="text-xs font-bold text-[hsl(var(--muted-foreground))]">{label}</div>
            {[0, 1].map((index) => {
              const product = compared[index];
              return <div key={`${label}-${index}`} className="border-b border-[hsl(var(--border))] pb-4 text-sm">{product ? rowIndex === 0 ? <span className="font-semibold"><span className="text-[hsl(var(--primary))]">★</span> {product.rating} <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">/ 5</span></span> : rowIndex === 1 ? <span className="leading-5 text-[hsl(var(--muted-foreground))]">{product.reason}</span> : <span className="font-semibold">{product.specs[rowIndex - 2]?.value}</span> : <span className="text-[hsl(var(--muted-foreground))]">—</span>}</div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ icon, value, label, note }: { icon: ReactNode; value: string; label: string; note: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.06] p-5 transition-colors hover:bg-white/[.1]" data-testid={`insight-${label.replaceAll(' ', '-')}`}><div className="flex items-start justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--secondary))]">{icon}</div><ChevronRight className="h-4 w-4 text-white/40" /></div><p className="mt-7 font-mono text-4xl font-bold text-[hsl(var(--accent))]">{value}</p><p className="mt-1 text-sm font-semibold">{label}</p><p className="mt-3 text-xs text-white/50">{note}</p></div>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
