# SmartShop

SmartShop is a simple personalized product recommendation assistant. A shopper
can describe what they need, choose an optional category and budget, and get a
shortlist from a local catalog. Each result explains why it was recommended.

## Features

- Plain-language product search
- Optional category and maximum budget filters
- Keyword-based recommendations for laptops, headphones, smartphones, fashion,
  and beauty products
- Product cards with price, rating, features, and an explanation
- Save picks in the browser for later
- Compare up to two products side by side
- Recent searches and a small local shopping insights dashboard
- Responsive layout for desktop and mobile
- No paid APIs, API keys, or database required

## Technology used

- React with TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Browser localStorage for saved picks, recent searches, and insights

## How the recommendation logic works

1. The app reads the search text and converts it to lowercase.
2. It looks for category words such as `laptop`, `headphones`, `camera`, or
   `sunscreen`.
3. It reads a budget after words such as `under`, `below`, or `within`.
4. Category and budget dropdowns can add or override those search details.
5. Products outside the selected category or budget are removed.
6. The remaining products are ranked using matching tags and rating.
7. The top matches are shown with a plain-language reason from the product
   dataset.

This approach is intentionally easy to understand and can later be replaced
by a real AI service without changing the product card or comparison flows.

## How to run

From the workspace root:

```bash
pnpm install
pnpm --filter @workspace/smartshop run dev
```

The Replit preview workflow supplies the required port and base path
automatically.

## Project structure

```text
artifacts/smartshop/
├── src/
│   ├── App.tsx                    # Main page, state, and user interactions
│   ├── components/
│   │   └── smart-product.tsx      # Product visuals and product cards
│   ├── data/
│   │   └── products.ts            # Local product catalog
│   ├── lib/
│   │   └── recommendations.ts     # Keyword, budget, and ranking logic
│   ├── index.css                  # Theme, layout helpers, and animations
│   └── main.tsx                   # React entry point
├── index.html                     # Page metadata and app mount point
└── README.md                      # This project guide
```

The main idea is to keep the catalog and recommendation function separate from
the page. That makes the project beginner-friendly: the data can be edited in
one file, while the matching rules can be explained in another.