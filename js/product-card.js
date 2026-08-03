import { formatINR } from './config.js';
import { Wishlist } from './store.js';

export function productCardHTML(p, i=0){
  const wished = Wishlist.has(p.id);
  
  let badges = '';
  let topOffset = 14;
  if (p.isNewToday) {
    badges += `<span class="pc-badge pc-badge-primary" style="background:#7A1F3D; color:#FFFFFF; font-weight:700; top:${topOffset}px">JUST ARRIVED</span>`;
    topOffset += 28;
  } else if (p.isNew) {
    badges += `<span class="pc-badge pc-badge-primary" style="background:#7A1F3D; color:#FFFFFF; top:${topOffset}px">NEW TODAY</span>`;
    topOffset += 28;
  } else if (p.discount) {
    badges += `<span class="pc-badge pc-badge-primary" style="top:${topOffset}px">-${p.discount}%</span>`;
    topOffset += 28;
  }
  
  if (p.stock > 0 && p.stock <= 5) {
    badges += `<span class="pc-badge pc-badge-stock" style="background:#7A1F3D; color:#FFFFFF; top:${topOffset}px">Only ${p.stock} Left</span>`;
  } else if (p.stock === 0) {
    badges += `<span class="pc-badge pc-badge-stock" style="background:#2F2A28; color:#FFFFFF; top:${topOffset}px">SOLD OUT</span>`;
  }

  return `
  <div class="product-card reveal-scale" style="--i:${i%4}">
    <a href="product.html?slug=${p.slug}" class="pc-media block">
      <img class="primary" src="${p.img1}" alt="${p.name}" loading="lazy"/>
      <img class="hover" src="${p.img2}" alt="" loading="lazy"/>
      ${badges}
      <button data-wish="${p.id}" class="pc-wishlist ${wished?'active':''}" aria-label="Add to wishlist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${wished?'currentColor':'none'}"><path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.2 4.5 6 4c2.1-.3 4 .8 6 3 2-2.2 3.9-3.3 6-3 3.8.5 5.5 4 4 7.7C19.5 16.3 12 21 12 21z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
      </button>
      <div class="pc-quickview" data-quickview="${p.slug}">Quick View</div>
    </a>
    <div class="pt-4 px-3.5">
      <a href="product.html?slug=${p.slug}" class="block font-heading text-[0.98rem] leading-snug text-[#2F2A28] hover:text-[#7A1F3D] transition line-clamp-2">${p.name}</a>

      <div class="flex items-baseline gap-2 mt-1.5">
        <span class="font-sans text-lg text-black font-bold">${formatINR(p.price)}</span>
        ${p.oldPrice ? `<span class="text-xs opacity-80 line-through">${formatINR(p.oldPrice)}</span>` : ''}
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
        <div class="p-6 md:p-8 relative text-[#2F2A28]">
          <button data-qv-close class="absolute top-4 right-4 p-1 text-[#2F2A28] hover:text-[#7A1F3D]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5"/></svg></button>
          <div class="eyebrow mb-2">${p.category}</div>
          <div class="font-heading text-2xl mb-2">${p.name}</div>

          <div class="flex items-baseline gap-2 mb-4">
            <span class="font-sans text-2xl font-bold text-black">${formatINR(p.price)}</span>
            ${p.oldPrice ? `<span class="text-sm opacity-80 line-through">${formatINR(p.oldPrice)}</span>` : ''}
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
