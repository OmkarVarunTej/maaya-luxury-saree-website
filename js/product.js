import { getProductBySlug, getRelated, formatINR, PRODUCTS } from './config.js';
import { Cart, Wishlist, toast, initNavbarScroll, initReveal, initMobileMenu, initSearch, updateBadges } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';
import { productCardHTML, bindProductCardEvents, initQuickView } from './product-card.js';

renderNavbar('shop');
renderFooter();
updateBadges();

const params = new URLSearchParams(location.search);
const slug = params.get('slug');
let product = getProductBySlug(slug) || PRODUCTS[0];
let selectedColor = product.colors[0].name;
let selectedSize = 'Free Size';
let qty = 1;
let activeImg = 0;

document.getElementById('doc-title').textContent = `${product.name} — MAAYA`;

function render(){
  const root = document.getElementById('product-root');
  root.innerHTML = `
  <div class="max-w-[1400px] mx-auto px-6 md:px-10">
    <nav class="text-xs text-[#D4AF37] mb-6 flex flex-wrap items-center gap-2">
      <a href="index.html" class="hover:text-[#6D0016]">Home</a><span>/</span>
      <a href="shop.html?cat=${product.category}" class="hover:text-[#6D0016] capitalize">${product.category}</a><span>/</span>
      <span class="text-[#2E2625] font-medium">${product.name}</span>
    </nav>

    <div class="grid lg:grid-cols-2 gap-10 xl:gap-16 pb-20">
      <!-- Gallery -->
      <div>
        <!-- Desktop Gallery -->
        <div class="hidden lg:grid grid-cols-[80px_1fr] gap-4">
          <div class="flex lg:flex-col gap-3" id="thumbs"></div>
          <div class="zoom-wrap rounded-sm overflow-hidden bg-[#FAF5EF] border border-[#E5D5B5] aspect-[3/4]" id="main-image-wrap">
            <img id="main-image" src="${product.gallery[0]}" alt="${product.name}" class="w-full h-full object-cover"/>
          </div>
        </div>
        
        <!-- Mobile Gallery (Myntra-style Carousel) -->
        <div class="lg:hidden relative">
          <div class="flex overflow-x-auto snap-x snap-mandatory scrollbar-none aspect-[3/4] rounded-sm bg-[#FAF5EF] border border-[#E5D5B5]" id="mobile-gallery-slider" style="-webkit-overflow-scrolling:touch; scroll-behavior:smooth;">
            ${product.gallery.map((g, i)=>`
              <img src="${g}" class="w-full h-full object-cover snap-center shrink-0" alt="View ${i+1}"/>
            `).join('')}
          </div>
          <div class="absolute bottom-4 right-4 bg-[#6D0016]/90 text-[#D4AF37] text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-full border border-[#D4AF37]/40" id="mobile-gallery-indicator">
            1 / ${product.gallery.length}
          </div>
        </div>
      </div>

      <!-- Info -->
      <div>
        <div class="eyebrow mb-3 text-[#D4AF37]">${product.fabric} · ${product.category}</div>
        <h1 class="font-heading text-3xl md:text-4xl leading-tight mb-3 text-[#6D0016]">${product.name}</h1>

        <div class="flex items-baseline gap-3 mb-6">
          <span class="font-sans text-2xl md:text-3xl font-bold text-[#6D0016]">${formatINR(product.price)}</span>
          ${product.oldPrice ? `<span class="text-[#8E827E] line-through text-lg">${formatINR(product.oldPrice)}</span><span class="text-xs bg-[#6D0016] text-[#D4AF37] font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/40">${product.discount}% OFF</span>` : ''}
        </div>
        <p class="text-sm text-[#2E2625]/80 mb-2">Inclusive of all taxes. Complimentary express shipping over ₹15,000.</p>

        <div class="h-px bg-[#E5D5B5] my-6"></div>

        <!-- Color -->
        <div class="mb-6">
          <div class="text-sm font-medium mb-3 text-[#2E2625]">Colour: <span id="color-label" class="text-[#6D0016] font-bold">${selectedColor}</span></div>
          <div class="flex gap-3" id="color-options">
            ${product.colors.map(c=>`
              <button data-color="${c.name}" title="${c.name}" class="w-10 h-10 rounded-full border-2 ${c.name===selectedColor?'border-[#D4AF37]':'border-transparent'}" style="background:${c.hex}; box-shadow:0 0 0 1px rgba(0,0,0,0.15) inset"></button>
            `).join('')}
          </div>
        </div>



        <!-- Quantity -->
        <div class="mb-7">
          <div class="text-sm font-medium mb-3 text-[#2E2625]">Quantity</div>
          <div class="inline-flex items-center border border-[#E5D5B5] rounded-sm bg-[#FAF5EF]">
            <button id="qty-minus" class="w-10 h-10 flex items-center justify-center hover:bg-[#6D0016]/10 text-[#6D0016] font-bold">−</button>
            <span id="qty-val" class="w-12 text-center text-sm font-bold text-[#2E2625]">1</span>
            <button id="qty-plus" class="w-10 h-10 flex items-center justify-center hover:bg-[#6D0016]/10 text-[#6D0016] font-bold">+</button>
          </div>
          <span class="text-xs ${product.stock>0?'text-[#D4AF37] font-semibold':'text-[#6D0016] font-bold'} ml-4">
            ${product.stock>0 ? (product.stock<6 ? `Only ${product.stock} pieces left` : 'In Stock') : 'Out of Stock'}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mb-4">
          <button id="add-to-cart" ${product.stock===0?'disabled':''} class="btn btn-primary btn-ripple flex-1 !py-3.5 !px-5 text-xs ${product.stock===0?'opacity-40 cursor-not-allowed':''}">Add to Cart</button>
          <button id="buy-now" ${product.stock===0?'disabled':''} class="btn btn-outline btn-ripple flex-1 !py-3.5 !px-5 text-xs ${product.stock===0?'opacity-40 cursor-not-allowed':''}">Buy Now</button>
        </div>
        <div class="flex gap-4 mb-8">
          <button id="wish-btn" class="flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D0016] font-semibold hover:text-[#D4AF37] transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${Wishlist.has(product.id)?'currentColor':'none'}"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.2 4.5 6 4c2.1-.3 4 .8 6 3 2-2.2 3.9-3.3 6-3 3.8.5 5.5 4 4 7.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            Wishlist
          </button>
          <button id="share-btn" class="flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D0016] font-semibold hover:text-[#D4AF37] transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M8.6 10.5l6.8-3.7M8.6 13.5l6.8 3.7" stroke="currentColor" stroke-width="1.5"/></svg>
            Share
          </button>
        </div>

        <!-- Trust badges -->
        <div class="grid grid-cols-2 gap-3 text-center">
          ${[['Free Shipping','Over ₹15,000'],['100% Handloom','Certified Authentic']].map(([t,s])=>`
            <div class="border border-[#E5D5B5] bg-[#FAF5EF] rounded-sm p-3">
              <div class="text-xs font-bold text-[#6D0016]">${t}</div>
              <div class="text-[0.68rem] text-[#2E2625]/70">${s}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-[#E5D5B5] flex gap-8 mb-8 overflow-x-auto">
      <button data-tab="desc" class="tab-btn active pb-4 border-b-2 text-sm whitespace-nowrap">Description</button>
      <button data-tab="specs" class="tab-btn pb-4 border-b-2 text-sm whitespace-nowrap">Specifications</button>
    </div>
    <div id="tab-content" class="pb-20 max-w-3xl"></div>
  </div>
  `;

  renderThumbs(); bindGallery(); bindOptions(); bindActions(); renderTab('desc'); bindTabs();
  updateStickyBar();
}

function renderThumbs(){
  document.getElementById('thumbs').innerHTML = product.gallery.map((g,i)=>`
    <button class="thumb w-16 h-20 lg:w-20 lg:h-24 shrink-0 rounded-sm overflow-hidden border-2 ${i===activeImg?'active':'border-transparent'}" data-idx="${i}">
      <img src="${g}" class="w-full h-full object-cover" alt="View ${i+1}"/>
    </button>`).join('');
}
function bindGallery(){
  document.querySelectorAll('.thumb').forEach(t=>t.addEventListener('click', ()=>{
    activeImg = Number(t.dataset.idx);
    document.getElementById('main-image').src = product.gallery[activeImg];
    document.querySelectorAll('.thumb').forEach(x=>x.classList.toggle('active', x===t));
  }));
  const wrap = document.getElementById('main-image-wrap');
  const img = document.getElementById('main-image');
  wrap.addEventListener('mousemove', (e)=>{
    const r = wrap.getBoundingClientRect();
    const x = ((e.clientX - r.left)/r.width)*100;
    const y = ((e.clientY - r.top)/r.height)*100;
    img.style.transformOrigin = `${x}% ${y}%`;
  });

  const slider = document.getElementById('mobile-gallery-slider');
  if (slider) {
    slider.addEventListener('scroll', () => {
      const idx = Math.round(slider.scrollLeft / slider.offsetWidth);
      const indicator = document.getElementById('mobile-gallery-indicator');
      if (indicator) {
        indicator.textContent = `${idx + 1} / ${product.gallery.length}`;
      }
    });
  }
}

function bindOptions(){
  document.querySelectorAll('#color-options [data-color]').forEach(btn=>btn.addEventListener('click', ()=>{
    selectedColor = btn.dataset.color;
    document.getElementById('color-label').textContent = selectedColor;
    document.querySelectorAll('#color-options [data-color]').forEach(b=>b.classList.toggle('border-[#D4AF37]', b===btn));
  }));
  document.getElementById('qty-minus').addEventListener('click', ()=>{ qty = Math.max(1, qty-1); document.getElementById('qty-val').textContent = qty; });
  document.getElementById('qty-plus').addEventListener('click', ()=>{ qty = Math.min(product.stock||10, qty+1); document.getElementById('qty-val').textContent = qty; });
}

function bindActions(){
  document.getElementById('add-to-cart').addEventListener('click', ()=>{
    Cart.add(product.id, qty, selectedColor, selectedSize);
    toast('Added to cart', `${product.name} × ${qty}`);
  });
  document.getElementById('buy-now').addEventListener('click', ()=>{
    Cart.add(product.id, qty, selectedColor, selectedSize);
    location.href = 'checkout.html';
  });
  document.getElementById('wish-btn').addEventListener('click', ()=>{
    const active = Wishlist.toggle(product.id);
    const svg = document.querySelector('#wish-btn svg');
    svg.setAttribute('fill', active ? 'currentColor' : 'none');
    toast(active ? 'Added to wishlist' : 'Removed from wishlist', product.name);
  });
  document.getElementById('share-btn').addEventListener('click', ()=>{
    if (navigator.share){ navigator.share({ title: product.name, url: location.href }); }
    else { navigator.clipboard?.writeText(location.href); toast('Link copied to clipboard'); }
  });
}

function bindTabs(){
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderTab(btn.dataset.tab);
  }));
}

function renderTab(tab){
  const el = document.getElementById('tab-content');
  if (tab === 'specs'){
    el.innerHTML = `<table class="w-full text-sm text-[#2E2625]">
      ${Object.entries(product.specs).map(([k,v])=>`
        <tr class="border-b border-[#E5D5B5]"><td class="py-3 pr-6 text-[#6D0016] font-semibold w-40">${k}</td><td class="py-3">${v}</td></tr>`).join('')}
    </table>`;
  } else {
    el.innerHTML = `<p class="text-sm leading-relaxed text-[#2E2625]/85 font-light">${product.description}</p>
      <ul class="mt-5 space-y-2 text-sm text-[#2E2625]/85 font-light">
        <li>• Handwoven using traditional pit-loom techniques</li>
        <li>• Zari sourced and certified for purity</li>
        <li>• Comes with an unstitched matching blouse piece</li>
        <li>• Presented in a signature MAAYA keepsake box</li>
      </ul>`;
  }
}

function updateStickyBar(){
  document.getElementById('sticky-name').textContent = product.name;
  document.getElementById('sticky-price').textContent = formatINR(product.price);
  const bar = document.getElementById('sticky-bar');
  const addBtn = document.getElementById('add-to-cart');
  document.getElementById('sticky-add').addEventListener('click', ()=> addBtn.click());
  const io = new IntersectionObserver(([entry])=>{
    bar.classList.toggle('translate-y-full', entry.isIntersecting);
  }, { threshold:0 });
  io.observe(addBtn);
}

function renderRelated(){
  const related = getRelated(product, 4);
  const grid = document.getElementById('related-grid');
  grid.innerHTML = related.map((p,i)=>productCardHTML(p,i)).join('');
  bindProductCardEvents(grid);
  initReveal();
}

render();
renderRelated();
initQuickView(PRODUCTS, Cart, toast);
initNavbarScroll();
initMobileMenu();
initSearch();
initReveal();
