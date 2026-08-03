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
    <a href="product.html?slug=${p.slug}" class="group relative overflow-hidden rounded-xl lift reveal-scale shadow-md bg-[#F7F3EE] ${i===0 ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[380px] md:min-h-[520px]' : 'col-span-1 min-h-[250px] md:min-h-[248px]'}" style="--i:${i}">
      <div class="w-full h-full absolute inset-0 overflow-hidden">
        <img src="${p.img1}" alt="${p.name}" class="w-full h-full object-cover object-top transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" loading="lazy"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
        <div class="absolute top-4 left-4 z-10">
          <span class="bg-[#7A1F3D] text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            Only ${p.stock} Left
          </span>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white z-10 pointer-events-none">
        <div class="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#7A1F3D] font-bold mb-1">${p.fabric} Saree</div>
        <div class="font-heading text-xl ${i===0 ? 'md:text-3xl' : 'md:text-2xl'} font-medium text-white mb-2 leading-snug drop-shadow-sm">${p.name}</div>
        <div class="flex items-center justify-between pt-2 border-t border-white/20">
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-white font-sans text-base md:text-xl">${formatINR(p.price)}</span>
            ${p.oldPrice ? `<span class="text-xs text-white/70 line-through">${formatINR(p.oldPrice)}</span>` : ''}
          </div>
          <div class="text-[10px] md:text-xs tracking-widest uppercase text-[#7A1F3D] font-bold flex items-center gap-1.5 group-hover:underline">
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
    t.classList.toggle('bg-[#7A1F3D]', active);
    t.classList.toggle('text-white', active);
    t.classList.toggle('border-[#7A1F3D]', active);
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

/* ---------------- Quick Categories ---------------- */
const quickCategoriesGrid = document.getElementById('quick-categories-grid');
if (quickCategoriesGrid) {
  const cats = [
    { name: "All Sarees", link: "shop.html", count: PRODUCTS.filter(p=>p.stock>0).length, img: "images/cat_designer.png" },
    { name: "Kanchipuram", link: "shop.html?cat=kanchipuram", count: PRODUCTS.filter(p=>p.stock>0 && p.category==='kanchipuram').length, img: "images/cat_silk.png" },
    { name: "Banarasi", link: "shop.html?cat=banarasi", count: PRODUCTS.filter(p=>p.stock>0 && p.category==='banarasi').length, img: "images/cat_banarasi.png" },
    { name: "Cotton", link: "shop.html?fabric=Cotton", count: PRODUCTS.filter(p=>p.stock>0 && p.fabric==='Cotton').length, img: "images/cat_cotton.png" },
    { name: "Organza", link: "shop.html?fabric=Organza", count: PRODUCTS.filter(p=>p.stock>0 && p.fabric==='Organza').length, img: "images/cat_party.png" },
    { name: "Silk", link: "shop.html?fabric=Silk", count: PRODUCTS.filter(p=>p.stock>0 && p.fabric==='Silk').length, img: "images/cat_wedding.png" },
    { name: "Wedding", link: "shop.html?cat=wedding", count: PRODUCTS.filter(p=>p.stock>0 && p.category==='wedding').length, img: "images/cat_silk.png" },
    { name: "Party Wear", link: "shop.html?cat=party", count: PRODUCTS.filter(p=>p.stock>0 && p.category==='party').length, img: "images/cat_party.png" }
  ];
  quickCategoriesGrid.innerHTML = cats.map((c, i) => `
    <a href="${c.link}" class="group relative aspect-[3/3.8] overflow-hidden rounded-sm reveal-scale" style="--i:${i}">
      <div class="w-full h-full overflow-hidden">
        <img src="${c.img}" alt="${c.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy"/>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
      <div class="absolute bottom-6 left-6 text-white z-10">
        <div class="font-heading text-lg md:text-xl font-medium mb-1">${c.name}</div>
        <div class="text-[10px] uppercase tracking-widest opacity-80">${c.count} Sarees</div>
      </div>
    </a>
  `).join('');
}

/* ---------------- Shop by Occasion ---------------- */
const occasionsVisualGrid = document.getElementById('occasions-visual-grid');
if (occasionsVisualGrid) {
  const occs = [
    { name: "Wedding", id: "wedding", img: "images/cat_wedding.png" },
    { name: "Festival", id: "festival", img: "images/cat_silk.png" },
    { name: "Reception", id: "reception", img: "images/cat_banarasi.png" },
    { name: "Office Wear", id: "office", img: "images/cat_cotton.png" },
    { name: "Daily Wear", id: "daily", img: "images/cat_designer.png" },
    { name: "Party Wear", id: "party", img: "images/cat_party.png" }
  ];
  occasionsVisualGrid.innerHTML = occs.map((o, i) => `
    <a href="shop.html?occasion=${o.id}" class="group relative aspect-[4/3] overflow-hidden rounded-sm reveal-scale" style="--i:${i}">
      <div class="w-full h-full overflow-hidden">
        <img src="${o.img}" alt="${o.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy"/>
      </div>
      <div class="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition"></div>
      <div class="absolute inset-0 flex items-center justify-center text-center text-white z-10">
        <div class="font-heading text-lg md:text-2xl font-bold uppercase tracking-wider">${o.name}</div>
      </div>
    </a>
  `).join('');
}

/* ---------------- Dedicated Premium Live Section ---------------- */
const liveSection = document.getElementById('premium-live-section');
if (liveSection) {
  const upcoming = [
    { title: "Kanchipuram Bridal Special", time: "Tomorrow at 4:00 PM" },
    { title: "Daily Wear Linen & Cotton", time: "Thursday at 11:00 AM" }
  ];
  const recentRecs = PRODUCTS.filter(p => p.stock > 0).slice(0, 4);
  liveSection.innerHTML = `
    <div class="grid lg:grid-cols-12 gap-10 items-center">
      <!-- Left Column (Live Now Showcase) -->
      <div class="lg:col-span-7 bg-[#FCFAF7] border border-[#E7DED3] p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
        <div class="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-md z-10">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          LIVE NOW
        </div>
        
        <div class="relative w-full md:w-1/2 aspect-[3/4] rounded-xl overflow-hidden shadow-md group shrink-0">
          <img src="images/banarasi_banner.png" alt="Live saree showcase" class="w-full h-full object-cover" loading="lazy"/>
          <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-[#7A1F3D] hover:bg-[#8C2847] text-white flex items-center justify-center shadow-lg transition-transform duration-300 transform group-hover:scale-110 cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col justify-center text-left">
          <h3 class="font-heading text-2xl font-bold mb-2">Watch our live saree showcase</h3>
          <p class="text-xs text-[#2F2A28]/75 font-light leading-relaxed mb-6">
            Interact in real-time, view detailed drapes, and **Reserve During Live** before stock sells out.
          </p>
          <a href="shop.html?live=true" class="w-fit inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-red-500 hover:bg-red-600 text-white shadow-md transition">
            Join Live
          </a>
        </div>
      </div>
      
      <!-- Right Column (Upcoming & Recent Collections) -->
      <div class="lg:col-span-5 flex flex-col gap-8">
        <div>
          <h4 class="font-heading text-xl font-bold mb-4">Upcoming Live Schedule</h4>
          <div class="space-y-3.5">
            ${upcoming.map(s => `
              <div class="flex items-center justify-between p-4 border border-[#E7DED3] rounded-xl bg-white shadow-xs">
                <div>
                  <div class="text-xs font-semibold text-[#2F2A28]">${s.title}</div>
                  <div class="text-[11px] text-[#2F2A28]/60 mt-0.5">${s.time}</div>
                </div>
                <button onclick="alert('Notification set! We will remind you before the live starts.');" class="text-[10px] font-bold uppercase tracking-wider text-[#7A1F3D] border border-[#7A1F3D]/30 px-3.5 py-1.5 rounded-full hover:bg-[#7A1F3D] hover:text-white transition">Remind Me</button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div>
          <h4 class="font-heading text-xl font-bold mb-4">Recent Live Collections</h4>
          <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            ${recentRecs.map(p => `
              <a href="product.html?slug=${p.slug}" class="w-24 shrink-0 group">
                <div class="aspect-[3/4] rounded-lg overflow-hidden border border-[#E7DED3] mb-1.5">
                  <img src="${p.img1}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy"/>
                </div>
                <div class="text-[10px] font-medium text-[#2F2A28] truncate">${p.name}</div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------- Trust Badges Section ---------------- */
const trustGrid = document.getElementById('trust-badge-grid');
if (trustGrid) {
  const items = [
    { title: "Authentic Handloom", desc: "100% Silk Mark certified", icon: "✓" },
    { title: "Secure Payment", desc: "100% encrypted checkout", icon: "✓" },
    { title: "Easy Returns", desc: "Simple 7-day windows", icon: "✓" },
    { title: "Premium Packaging", desc: "Keepsake signature box", icon: "✓" },
    { title: "Fast Shipping", desc: "Express delivery globally", icon: "✓" },
    { title: "Quality Checked", desc: "Rigorous loom audits", icon: "✓" }
  ];
  trustGrid.innerHTML = `
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
      ${items.map((t, i) => `
        <div class="flex flex-col items-center reveal" style="--i:${i}">
          <div class="w-10 h-10 rounded-full border border-[#7A1F3D]/40 flex items-center justify-center text-[#7A1F3D] bg-[#7A1F3D]/5 font-serif text-lg font-bold mb-3">${t.icon}</div>
          <div class="text-xs font-bold uppercase tracking-wider text-[#2F2A28] mb-1">${t.title}</div>
          <div class="text-[10px] text-[#2F2A28]/60 font-light">${t.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ---------------- Instagram ---------------- */
document.getElementById('insta-grid').innerHTML = INSTAGRAM.map((g,i)=>`
  <a href="#" class="group relative aspect-square overflow-hidden reveal-scale" style="--i:${i%4}">
    <img src="${g.img}" alt="Instagram post" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-white"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.2 4.5 6 4c2.1-.3 4 .8 6 3 2-2.2 3.9-3.3 6-3 3.8.5 5.5 4 4 7.7C19.5 16.3 12 21 12 21z" fill="currentColor"/></svg>
    </div>
  </a>`).join('');

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
