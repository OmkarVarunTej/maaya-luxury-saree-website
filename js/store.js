/* ============================================================
   MAAYA — Shared client-side store (localStorage-backed)
   ============================================================ */
import { PRODUCTS, formatINR } from './config.js';

const CART_KEY = 'maaya_cart_v1';
const WISH_KEY = 'maaya_wishlist_v1';

function read(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } }
function write(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

export const Cart = {
  items: read(CART_KEY), // [{id, qty, color, size}]
  save(){ write(CART_KEY, this.items); updateBadges(); },
  add(id, qty=1, color=null, size='Free Size'){
    const key = `${id}__${color}__${size}`;
    const existing = this.items.find(i => `${i.id}__${i.color}__${i.size}` === key);
    if (existing) existing.qty += qty;
    else this.items.push({ id, qty, color, size });
    this.save();
  },
  remove(id, color, size){
    this.items = this.items.filter(i => !(i.id===id && i.color===color && i.size===size));
    this.save();
  },
  setQty(id, color, size, qty){
    const it = this.items.find(i=>i.id===id && i.color===color && i.size===size);
    if (it){ it.qty = Math.max(1, qty); this.save(); }
  },
  count(){ return this.items.reduce((s,i)=>s+i.qty,0); },
  lines(){
    return this.items.map(i=>({ ...i, product: PRODUCTS.find(p=>p.id===i.id) })).filter(l=>l.product);
  },
  subtotal(){ return this.lines().reduce((s,l)=>s + l.product.price*l.qty, 0); },
  clear(){ this.items = []; this.save(); }
};

export const Wishlist = {
  items: read(WISH_KEY),
  save(){ write(WISH_KEY, this.items); updateBadges(); },
  toggle(id){
    if (this.items.includes(id)) this.items = this.items.filter(x=>x!==id);
    else this.items.push(id);
    this.save();
    return this.items.includes(id);
  },
  has(id){ return this.items.includes(id); },
  count(){ return this.items.length; },
  products(){ return PRODUCTS.filter(p=>this.items.includes(p.id)); }
};

export function updateBadges(){
  document.querySelectorAll('[data-cart-count]').forEach(el=>{
    const n = Cart.count();
    el.textContent = n;
    el.classList.toggle('hidden', n===0);
  });
  document.querySelectorAll('[data-wish-count]').forEach(el=>{
    const n = Wishlist.count();
    el.textContent = n;
    el.classList.toggle('hidden', n===0);
  });
}

export function toast(msg, sub=''){
  let root = document.getElementById('toast-root');
  if (!root){
    root = document.createElement('div'); root.id='toast-root'; document.body.appendChild(root);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;margin-top:2px" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="#C97B63" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div><div style="font-size:0.88rem;font-weight:700;color:#C97B63;letter-spacing:0.03em">${msg}</div>${sub ? `<div style="font-size:0.78rem;color:#3F3F46;opacity:0.95;margin-top:2px">${sub}</div>` : ''}</div>
  `;
  root.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(), 500); }, 3200);
}

export function initNavbarScroll(){
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = ()=> nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
}

export function initReveal(){
  const els = document.querySelectorAll('.reveal, .reveal-scale');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.14, rootMargin:'0px 0px -40px 0px' });
  els.forEach(el=>io.observe(el));
}

export function initMobileMenu(){
  const btn = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!btn || !panel) return;
  btn.addEventListener('click', ()=>{
    const open = panel.classList.toggle('translate-x-0');
    panel.classList.toggle('translate-x-full', !open);
    document.body.classList.toggle('overflow-hidden', open);
  });
  panel.querySelectorAll('[data-mobile-close]').forEach(x=>x.addEventListener('click', ()=>{
    panel.classList.remove('translate-x-0'); panel.classList.add('translate-x-full');
    document.body.classList.remove('overflow-hidden');
  }));
}

export function initSearch(){
  const triggers = document.querySelectorAll('[data-search-toggle]');
  const overlay = document.querySelector('[data-search-overlay]');
  const input = document.querySelector('[data-search-input]');
  const form = document.querySelector('[data-search-form]');
  const results = document.querySelector('[data-search-results]');
  if (!overlay) return;
  const open = ()=>{ overlay.classList.remove('hidden'); requestAnimationFrame(()=>overlay.classList.add('open')); input?.focus(); };
  const close = ()=>{ overlay.classList.remove('open'); setTimeout(()=>overlay.classList.add('hidden'),300); };
  triggers.forEach(t => t.addEventListener('click', open));
  overlay.addEventListener('click', (e)=>{ if (e.target===overlay) close(); });
  overlay.querySelectorAll('[data-search-close]').forEach(x=>x.addEventListener('click', close));

  const executeSearch = (val) => {
    const q = (val || input?.value || '').trim();
    if (q) {
      location.href = `shop.html?search=${encodeURIComponent(q)}`;
    }
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    executeSearch();
  });

  input?.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    if (!results) return;
    if (q.length < 2){ results.innerHTML=''; return; }
    const matches = PRODUCTS.filter(p=>p.name.toLowerCase().includes(q) || p.category.includes(q) || p.fabric.toLowerCase().includes(q) || (p.category+' '+p.fabric).toLowerCase().includes(q) || ['wedding sarees','silk sarees','banarasi','cotton sarees','party wear','designer collection'].some(n=>n.includes(q)&&p.category===n.split(' ')[0].toLowerCase())).slice(0,6);
    results.innerHTML = matches.length ? matches.map(p=>`
      <a href="product.html?slug=${p.slug}" class="flex items-center gap-4 p-3 hover:bg-zinc-100 rounded transition">
        <img src="${p.img1}" class="w-14 h-16 object-cover rounded" alt="${p.name}"/>
        <div class="flex-1"><div class="text-sm font-medium">${p.name}</div><div class="text-xs font-sans font-bold text-black">${formatINR(p.price)}</div></div>
      </a>`).join('') : `<div class="text-sm opacity-60 p-3">No results found for "${q}"</div>`;
  });
  document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') close(); });
}

updateBadges();
