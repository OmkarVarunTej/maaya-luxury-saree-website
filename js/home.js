import { CATEGORIES, OCCASIONS, FABRICS, PRODUCTS, TESTIMONIALS, INSTAGRAM } from './config.js';
import { initNavbarScroll, initReveal, initMobileMenu, initSearch, toast, Cart } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';
import { productCardHTML, bindProductCardEvents, initQuickView } from './product-card.js';

renderNavbar('home');
renderFooter();

/* ---------------- Hero entrance ---------------- */
window.addEventListener('DOMContentLoaded', ()=>{
  if (window.gsap){
    gsap.timeline({ defaults:{ ease:'power3.out' } })
      .fromTo('#hero-left', { opacity:0, x:-40 }, { opacity:1, x:0, duration:1.1 }, 0.1)
      .fromTo('#hero-center', { opacity:0, y:50, scale:0.95 }, { opacity:1, y:0, scale:1, duration:1.3 }, 0.25)
      .fromTo('#hero-right', { opacity:0, x:40 }, { opacity:1, x:0, duration:1.1 }, 0.4);
  }
});

/* ---------------- Collections ---------------- */
document.getElementById('collections-grid').innerHTML = CATEGORIES.map((c,i)=>`
  <a href="shop.html?cat=${c.id}" class="group relative overflow-hidden rounded-md lift reveal-scale bg-[#12281a] ${i===0?'md:col-span-2 md:row-span-2':''}" style="--i:${i}">
    <div class="w-full h-full min-h-[280px] md:min-h-[360px] relative overflow-hidden">
      <img src="${c.img}" alt="${c.name}" class="w-full h-full object-cover absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"/>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 p-6 text-white z-10 pointer-events-none">
      <div class="font-heading text-xl md:text-2xl mb-1 text-white font-medium">${c.name}</div>
      <div class="text-xs tracking-widest uppercase opacity-90 flex items-center gap-2 text-[#C97B63] font-semibold">
        ${c.count} Pieces
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </div>
    </div>
  </a>`).join('');

/* ---------------- Edit tabs (New / Best / Trending) ---------------- */
const editGrid = document.getElementById('edit-grid');
const tabSets = {
  new: PRODUCTS.filter(p=>p.isNew).slice(0,8),
  best: PRODUCTS.filter(p=>p.isBestseller).slice(0,8),
  trend: PRODUCTS.filter(p=>p.isTrending).slice(0,8)
};
function renderEdit(tab){
  const list = tabSets[tab].slice(0,4);
  editGrid.innerHTML = list.map((p,i)=>productCardHTML(p,i)).join('');
  bindProductCardEvents(editGrid);
  initReveal();
  document.querySelectorAll('.edit-tab').forEach(t=>{
    const active = t.dataset.tab === tab;
    t.classList.toggle('bg-[#C97B63]', active);
    t.classList.toggle('text-white', active);
    t.classList.toggle('border-[#C97B63]', active);
  });
}
document.querySelectorAll('.edit-tab').forEach(t=>t.addEventListener('click', ()=>renderEdit(t.dataset.tab)));
renderEdit('new');

/* ---------------- Occasions ---------------- */
document.getElementById('occasion-strip').innerHTML = OCCASIONS.map((o,i)=>`
  <a href="shop.html?occasion=${o.id}" class="group relative shrink-0 w-[220px] md:w-[260px] snap-start overflow-hidden rounded-sm reveal-scale" style="--i:${i}">
    <div class="aspect-[3/4] overflow-hidden">
      <img src="${o.img}" alt="${o.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
    </div>
    <div class="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition"></div>
    <div class="absolute bottom-5 left-0 right-0 text-center text-white font-heading text-xl font-medium">${o.name}</div>
  </a>`).join('');

/* ---------------- Fabrics ---------------- */
const fabricImgs = {
  Silk: "images/cat_silk.png",
  Cotton: "images/cat_cotton.png",
  Linen: "images/cat_wedding.png",
  Organza: "images/cat_party.png",
  Georgette: "images/cat_banarasi.png",
  Chiffon: "images/cat_designer.png"
};
document.getElementById('fabric-grid').innerHTML = FABRICS.map((f,i)=>`
  <a href="shop.html?fabric=${f}" class="group text-center reveal-scale" style="--i:${i}">
    <div class="aspect-square rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-[var(--gold)] transition">
      <img src="${fabricImgs[f]}" alt="${f}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
    </div>
    <div class="text-xs md:text-sm font-heading text-[#3F3F46]">${f}</div>
  </a>`).join('');

/* ---------------- Testimonials ---------------- */
document.getElementById('testimonial-grid').innerHTML = TESTIMONIALS.map((t,i)=>`
  <div class="bg-[var(--ivory)] p-7 rounded-sm reveal lift" style="--i:${i}">
    <div class="stars mb-3">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
    <p class="text-sm leading-relaxed font-light mb-5 opacity-80">&ldquo;${t.text}&rdquo;</p>
    <div class="text-sm font-heading">${t.name}</div>
    <div class="text-xs opacity-50">${t.city}</div>
  </div>`).join('');

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
