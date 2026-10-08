# Men's Clothing Sale price-filter prototype

The sale product grid uses the existing Men's Wearhouse catalog, header, filter sheet, and footer. Search turns the same listing into the search results page.

## Price filter treatments

Both links stay on one experience. There is no random split.

- Treatment 1, groupings plus Min/Max: https://sale-price-filter.vercel.app/?variant=groupings
- Treatment 2, Min/Max only: https://sale-price-filter.vercel.app/?variant=minmax

Min and Max sit side by side under Price. Treatment 1 also keeps the price groupings below the fields. Typing a custom range clears selected groupings. Choosing a grouping clears the fields. Only Apply updates the products. Closing the sheet drops unapplied changes.

## Run

```bash
npm install
npm run dev
```

Open the URL it prints, then add `?variant=groupings` or `?variant=minmax`.
