import { formatINR } from './config.js';
import { Wishlist } from './store.js';

export function productCardHTML(p, i=0){
  const wished = Wishlist.has(p.id);
  const badge = p.discount ? `<span class="pc-badge">-${p.discount}%</span>` : (p.isNew ? `<span class="pc-badge" style="background:var(--gold-deep)">New</span>` : '');
  return `
  <div class="product-card reveal-scale" style="--i:${i%4}">
    <a href="product.html?slug=${p.slug}" class="pc-media block">
      <img class="primary" src="${p.img1}" alt="${p.name}" loading="lazy"/>
      <img class="hover" src="${p.img2}" alt="" loading="lazy"/>
      ${badge}
      <button data-wish="${p.id}" class="pc-wishlist ${wished?'active':''}" aria-label="Add to wishlist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${wished?'currentColor':'none'}"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.2 4.5 6 4c2.1-.3 4 .8 6 3 2-2.2 3.9-3.3 6-3 3.8.5 5.5 4 4 7.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
      <div class="pc-quickview" data-quickview="${p.slug}">Quick View</div>
    </a>
    <div class="pt-4">
      <a href="product.html?slug=${p.slug}" class="block font-heading text-[0.98rem] leading-snug text-[#FCE185] hover:text-[#FFF5C0] transition line-clamp-2">${p.name}</a>
      <div class="flex items-center gap-1 mt-1.5 text-[#D4AF6A]">
        <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</span>
        <span class="text-xs opacity-70">(${p.reviews})</span>
      </div>
      <div class="flex items-baseline gap-2 mt-1.5">
        <span class="font-sans text-lg text-white font-bold">${formatINR(p.price)}</span>
        ${p.oldPrice ? `<span class="text-xs opacity-50 line-through text-white/60">${formatINR(p.oldPrice)}</span>` : ''}
      </div>
    </div>
  </div>`;
}

export function bindProductCardEvents(container=document){
  container.querySelectorAll('[data-wish]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const id = btn.getAttribute('data-wish');
      const active = Wishlist.toggle(id);
      btn.classList.toggle('active', active);
      btn.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
    });
  });
}

let quickViewBound = false;
/** Injects (once) a sitewide quick-view modal and wires up any [data-quickview] triggers. */
export function initQuickView(PRODUCTS, Cart, toast){
  if (!document.getElementById('quickview-modal')){
    const modal = document.createElement('div');
    modal.id = 'quickview-modal';
    modal.className = 'hidden';
    document.body.appendChild(modal);
  }
  if (quickViewBound) return;
  quickViewBound = true;
  document.addEventListener('click', (e)=>{
    const qv = e.target.closest('[data-quickview]');
    if (!qv) return;
    e.preventDefault();
    const p = PRODUCTS.find(x=>x.slug===qv.dataset.quickview);
    if (!p) return;
    const modal = document.getElementById('quickview-modal');
    modal.className = 'fixed inset-0 z-[130] flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/60" data-qv-close></div>
      <div class="relative bg-[var(--cream)] max-w-3xl w-full rounded-sm overflow-hidden grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
        <div class="aspect-[3/4] md:aspect-auto"><img src="${p.img1}" class="w-full h-full object-cover" alt="${p.name}"/></div>
        <div class="p-6 md:p-8 relative">
          <button data-qv-close class="absolute top-4 right-4 p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5"/></svg></button>
          <div class="eyebrow mb-2">${p.category}</div>
          <div class="font-heading text-2xl mb-2">${p.name}</div>
          <div class="stars mb-3">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))} <span class="text-xs opacity-50 font-body">(${p.reviews} reviews)</span></div>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="font-sans text-2xl font-bold">${formatINR(p.price)}</span>
            ${p.oldPrice ? `<span class="text-sm opacity-40 line-through">${formatINR(p.oldPrice)}</span>` : ''}
          </div>
          <p class="text-sm opacity-70 leading-relaxed mb-6 line-clamp-2">${p.description}</p>
          <div class="flex gap-3">
            <button data-qv-add="${p.id}" class="btn btn-primary btn-ripple flex-1">Add to Cart</button>
            <a href="product.html?slug=${p.slug}" class="btn btn-outline flex-1 text-center">View Full Details</a>
          </div>
        </div>
      </div>`;
    modal.querySelectorAll('[data-qv-close]').forEach(x=>x.addEventListener('click', ()=>{ modal.className='hidden'; modal.innerHTML=''; }));
    modal.querySelector('[data-qv-add]').addEventListener('click', ()=>{
      Cart.add(p.id, 1, p.colors[0].name);
      toast('Added to cart', p.name);
      modal.className='hidden'; modal.innerHTML='';
    });
  });
}
