import { CATEGORIES, OCCASIONS, FABRICS, PRODUCTS, TESTIMONIALS, INSTAGRAM, formatINR } from './config.js';
import { initNavbarScroll, initReveal, initMobileMenu, initSearch, toast, Cart, updateBadges } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';
import { productCardHTML, bindProductCardEvents, initQuickView } from './product-card.js';

renderNavbar('home');
renderFooter();
updateBadges();

/* ---------------- Hero entrance ---------------- */
if (window.gsap && !window.matchMedia('(max-width: 768px)').matches){
  gsap.timeline({ defaults:{ ease:'power3.out' } })
    .fromTo('#hero-left', { opacity:0, x:-40 }, { opacity:1, x:0, duration:1.1 }, 0.1)
    .fromTo('#hero-center', { opacity:0, y:50, scale:0.95 }, { opacity:1, y:0, scale:1, duration:1.3 }, 0.25)
    .fromTo('#hero-right', { opacity:0, x:40 }, { opacity:1, x:0, duration:1.1 }, 0.4);
}

/* ---------------- Featured Collections (Best Top Limited Stock Sarees) ---------------- */
const collectionsGrid = document.getElementById('collections-grid');
if (collectionsGrid) {
  const limitedStockProducts = PRODUCTS
    .filter(p => p.stock > 0 && p.stock <= 5)
    .sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.rating - a.rating);

  const featuredProducts = (limitedStockProducts.length >= 3
    ? limitedStockProducts
    : PRODUCTS.filter(p => p.stock > 0).sort((a, b) => a.stock - b.stock)
  ).slice(0, 3);

  collectionsGrid.innerHTML = featuredProducts.map((p, i) => `
    <a href="product.html?slug=${p.slug}" class="group relative overflow-hidden rounded-xl lift reveal-scale shadow-md bg-[#FAF5EF] border border-[#E5D5B5] ${i===0 ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[380px] md:min-h-[520px]' : 'col-span-1 min-h-[250px] md:min-h-[248px]'}" style="--i:${i}">
      <div class="w-full h-full absolute inset-0 overflow-hidden">
        <img src="${p.img1}" alt="${p.name}" class="w-full h-full object-cover object-top transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" loading="lazy"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"></div>
        <div class="absolute top-4 left-4 z-10">
          <span class="bg-[#6D0016] text-[#D4AF37] text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md border border-[#D4AF37]/40">
            Only ${p.stock} Left
          </span>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white z-10 pointer-events-none">
        <div class="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#D4AF37] font-bold mb-1">${p.fabric} Saree</div>
        <div class="font-heading text-xl ${i===0 ? 'md:text-3xl' : 'md:text-2xl'} font-medium text-white mb-2 leading-snug drop-shadow-sm">${p.name}</div>
        <div class="flex items-center justify-between pt-2 border-t border-white/20">
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-white font-sans text-base md:text-xl">${formatINR(p.price)}</span>
            ${p.oldPrice ? `<span class="text-xs text-white/70 line-through">${formatINR(p.oldPrice)}</span>` : ''}
          </div>
          <div class="text-[10px] md:text-xs tracking-widest uppercase text-[#D4AF37] font-bold flex items-center gap-1.5 group-hover:underline">
            Shop Piece
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        </div>
      </div>
    </a>
  `).join('');
  bindProductCardEvents(collectionsGrid);
}

/* ---------------- Edit tabs (New / Best / Trending) ---------------- */
const editGrid = document.getElementById('edit-grid');
const tabSets = {
  new: PRODUCTS.filter(p => p.stock > 0 && p.isNew).slice(0, 8),
  best: PRODUCTS.filter(p => p.stock > 0 && p.isBestseller).slice(0, 8),
  trend: PRODUCTS.filter(p => p.stock > 0 && p.isTrending).slice(0, 8)
};
function renderEdit(tab){
  const list = tabSets[tab].slice(0,4);
  editGrid.innerHTML = list.map((p,i)=>productCardHTML(p,i)).join('');
  bindProductCardEvents(editGrid);
  initReveal();
  document.querySelectorAll('.edit-tab').forEach(t=>{
    const active = t.dataset.tab === tab;
    t.classList.toggle('bg-[#6D0016]', active);
    t.classList.toggle('text-white', active);
    t.classList.toggle('border-[#6D0016]', active);
  });
}
document.querySelectorAll('.edit-tab').forEach(t=>t.addEventListener('click', ()=>renderEdit(t.dataset.tab)));
renderEdit('new');

/* ---------------- Today's Collection ---------------- */
const todaysCollectionGrid = document.getElementById('todays-collection-grid');
if (todaysCollectionGrid) {
  const todaysProducts = PRODUCTS.filter(p => p.stock > 0 && p.isNewToday).slice(0, 8);
  todaysCollectionGrid.innerHTML = todaysProducts.map((p, i) => productCardHTML(p, i)).join('');
  bindProductCardEvents(todaysCollectionGrid);
}



/* ---------------- Trust Badges Section ---------------- */
const trustGrid = document.getElementById('trust-badge-grid');
if (trustGrid) {
  const items = [
    { title: "Authentic Handloom", desc: "100% Silk Mark certified", icon: "✓" },
    { title: "Secure Payment", desc: "100% encrypted checkout", icon: "✓" },
    { title: "Premium Packaging", desc: "Keepsake signature box", icon: "✓" },
    { title: "Fast Shipping", desc: "Express delivery globally", icon: "✓" },
    { title: "Quality Checked", desc: "Rigorous loom audits", icon: "✓" }
  ];
  trustGrid.innerHTML = `
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-8 text-center">
      ${items.map((t, i) => `
        <div class="flex flex-col items-center reveal" style="--i:${i}">
          <div class="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#6D0016] bg-[#6D0016]/10 font-serif text-lg font-bold mb-3">${t.icon}</div>
          <div class="text-xs font-bold uppercase tracking-wider text-[#6D0016] mb-1">${t.title}</div>
          <div class="text-[10px] text-[#2E2625]/70 font-light">${t.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ---------------- Instagram ---------------- */
const instaGrid = document.getElementById('insta-grid');
if (instaGrid) {
  instaGrid.innerHTML = INSTAGRAM.map((g,i)=>`
    <a href="#" class="group relative aspect-square overflow-hidden reveal-scale" style="--i:${i%4}">
      <img src="${g.img}" alt="Instagram post" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-[#D4AF37]"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.2 4.5 6 4c2.1-.3 4 .8 6 3 2-2.2 3.9-3.3 6-3 3.8.5 5.5 4 4 7.7C19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>
      </div>
    </a>`).join('');
}

/* ---------------- Newsletter ---------------- */
const nlForm = document.getElementById('newsletter-form');
if (nlForm) {
  nlForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    toast('Welcome to the inner circle', 'Check your inbox for a 10% welcome gift.');
    e.target.reset();
  });
}

initQuickView(PRODUCTS, Cart, toast);
initNavbarScroll();
initMobileMenu();
initSearch();
initReveal();
