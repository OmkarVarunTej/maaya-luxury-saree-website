# MAAYA — Luxury Saree E‑Commerce Website

A premium, fully responsive saree e‑commerce experience inspired by Sabyasachi, Raw Mango, and Taneira —
built with a warm ivory/champagne/gold/maroon palette, editorial typography, and Framer‑Motion‑style
micro‑interactions.

## ⚠️ A note on the tech stack

The brief asked for React + Vite + TypeScript + Tailwind + shadcn/ui + Framer Motion, installed via npm.
This build environment has **no internet access for package installs** (the npm registry is blocked), so a
real `npm create vite` + `npm install` project isn't buildable here.

To still deliver something production‑ready today, this is built as a **static, multi‑page HTML/CSS/JS site**
using the same visual language:

- **Tailwind CSS** — loaded via the official CDN build (utility classes work exactly as they would locally)
- **Vanilla ES modules** — a small config‑driven "component" system (`product-card.js`, `layout.js`, `store.js`)
  standing in for React components/hooks, with no build step required
- **GSAP** (CDN) for the hero entrance animation, **Chart.js** (CDN) for the admin dashboard charts
- Custom CSS for the luxury design tokens, reveal‑on‑scroll, card‑lift, glass, and ripple effects

If you do want the real React/Vite/TypeScript/shadcn/Framer Motion codebase, this static build is a faithful,
pixel‑accurate spec to port from — every component boundary (Navbar, ProductCard, Filters, Gallery, Stepper,
etc.) is already isolated in its own file, and every product/category is mock JSON in `js/config.js`. Claude
Code (or any dev environment with npm access) can scaffold the Vite project and port this 1:1 in a fraction of
the time it'd take from scratch.

## Structure

```
saree-luxe/
├── index.html          Homepage
├── shop.html            Category/listing page (filters, sort, grid/list, pagination)
├── product.html          Product detail (gallery, options, tabs, related)
├── cart.html              Cart (coupon, shipping estimate)
├── checkout.html            Multi-step checkout (address → shipping → payment → confirmation)
├── account.html               Customer dashboard (orders, wishlist, addresses, settings)
├── admin.html                    Admin dashboard (charts, orders, inventory)
├── css/main.css                    Design tokens + shared styles
└── js/
    ├── config.js                     Mock product/category/testimonial data
    ├── store.js                       Cart/wishlist state (localStorage), toasts, scroll reveal
    ├── layout.js                       Shared navbar (mega menu, search, mobile) + footer
    ├── product-card.js                  Reusable product card + sitewide Quick View modal
    └── home.js / shop.js / product.js / cart.js / checkout.js / account.js / admin.js
```

## Running it

Just open `index.html` in a browser, or serve the folder with any static server for the cleanest experience:

```
npx serve saree-luxe
```

All 30 products, pricing, stock, and images are mock data in `js/config.js` — swap in a real API by replacing
that one file.
