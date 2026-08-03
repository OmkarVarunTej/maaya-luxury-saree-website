import { formatINR, PRODUCTS } from './config.js';
import { Cart, toast, initNavbarScroll, initMobileMenu, initSearch, initReveal, updateBadges } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';
import { productCardHTML, bindProductCardEvents, initQuickView } from './product-card.js';

renderNavbar('cart');
renderFooter();
updateBadges();

const VALID_COUPONS = { WELCOME10: 0.10, MAAYA15: 0.15, FESTIVE20: 0.20 };
let couponCode = null;

function render(){
  const lines = Cart.lines();
  const root = document.getElementById('cart-container');

  if (lines.length === 0){
    const recs = PRODUCTS.slice(0,4);
    root.innerHTML = `
      <div class="lg:col-span-3 text-center py-16">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" class="mx-auto mb-5 opacity-30"><path d="M6 7h15l-1.5 9.5a2 2 0 01-2 1.7H8.9a2 2 0 01-2-1.7L5 4H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p class="font-heading text-2xl mb-2">Your cart is empty</p>
        <p class="opacity-60 text-sm mb-7">Discover handwoven pieces worthy of your wardrobe.</p>
        <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
        <div class="mt-20 text-left">
          <h3 class="section-title text-2xl text-center mb-8">You Might Like</h3>
          <div id="cart-empty-recs" class="grid grid-cols-2 md:grid-cols-4 gap-6"></div>
        </div>
      </div>`;
    document.getElementById('cart-empty-recs').innerHTML = recs.map((p,i)=>productCardHTML(p,i)).join('');
    bindProductCardEvents(document.getElementById('cart-empty-recs'));
    initReveal();
    return;
  }

  const subtotal = Cart.subtotal();
  const discount = couponCode ? subtotal * VALID_COUPONS[couponCode] : 0;
  const shipping = subtotal > 15000 ? 0 : 250;
  const total = subtotal - discount + shipping;

  root.innerHTML = `
    <div class="lg:col-span-2 space-y-4" id="cart-lines"></div>
    <div class="lg:col-span-1">
      <div class="bg-[var(--ivory)] p-6 md:p-7 rounded-sm sticky top-28">
        <h3 class="font-heading text-xl mb-6">Order Summary</h3>
        <div class="mb-5">
          <div class="flex gap-2">
            <input id="coupon-input" type="text" placeholder="Enter coupon code" class="flex-1 bg-white border border-[var(--line)] rounded-sm px-4 py-2.5 text-sm text-[#1c2820] outline-none focus:border-[var(--gold)]" value="${couponCode||''}"/>
            <button id="apply-coupon" class="btn btn-outline text-xs px-4">Apply</button>
          </div>
          <div id="coupon-msg" class="text-xs mt-2 ${couponCode?'text-green-800':'opacity-50'}">${couponCode ? `Code ${couponCode} applied — ${Math.round(VALID_COUPONS[couponCode]*100)}% off` : 'Try WELCOME10, MAAYA15, or FESTIVE20'}</div>
        </div>
        <div class="space-y-3 text-sm border-t border-[var(--line)] pt-5">
          <div class="flex justify-between"><span class="opacity-60">Subtotal</span><span>${formatINR(subtotal)}</span></div>
          ${discount>0 ? `<div class="flex justify-between text-green-800"><span>Discount (${couponCode})</span><span>-${formatINR(Math.round(discount))}</span></div>` : ''}
          <div class="flex justify-between"><span class="opacity-60">Shipping</span><span>${shipping===0?'Free':formatINR(shipping)}</span></div>
          ${shipping>0 ? `<div class="text-xs opacity-50">Add ${formatINR(15000-subtotal)} more for free shipping</div>` : ''}
        </div>
        <div class="flex justify-between items-baseline border-t border-[var(--line)] mt-5 pt-5 mb-6">
          <span class="font-heading text-lg">Total</span>
          <span class="font-sans text-2xl">${formatINR(Math.round(total))}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-ripple w-full mb-3">Proceed to Checkout</a>
        <a href="shop.html" class="block text-center text-xs uppercase tracking-widest opacity-60 hover:opacity-100 mt-3">Continue Shopping</a>
        <div class="flex items-center gap-2 mt-6 text-xs opacity-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.5"/></svg>
          Secure checkout with 256-bit SSL encryption
        </div>
      </div>
    </div>
  `;

  document.getElementById('cart-lines').innerHTML = lines.map(l=>`
    <div class="flex gap-4 md:gap-6 bg-[var(--ivory)] p-4 md:p-5 rounded-sm items-center" data-line="${l.id}__${l.color}__${l.size}">
      <a href="product.html?slug=${l.product.slug}" class="w-24 md:w-28 aspect-[3/4] shrink-0 overflow-hidden rounded-sm">
        <img src="${l.product.img1}" class="w-full h-full object-cover" alt="${l.product.name}"/>
      </a>
      <div class="flex-1 min-w-0">
        <a href="product.html?slug=${l.product.slug}" class="font-heading text-base md:text-lg hover:text-[var(--gold-deep)] line-clamp-1">${l.product.name}</a>
        <div class="text-xs opacity-50 mt-1">Colour: ${l.color} &nbsp;·&nbsp; Blouse: ${l.size}</div>
        <div class="font-sans text-lg font-bold mt-2 text-[#FCE185]">${formatINR(l.product.price)}</div>
        <div class="flex items-center justify-between mt-3">
          <div class="inline-flex items-center border border-[var(--line)] rounded-sm">
            <button data-qty-minus class="w-8 h-8 text-sm hover:bg-black/5">−</button>
            <span class="w-9 text-center text-sm">${l.qty}</span>
            <button data-qty-plus class="w-8 h-8 text-sm hover:bg-black/5">+</button>
          </div>
          <button data-remove class="text-xs uppercase tracking-widest opacity-50 hover:text-[var(--maroon)] hover:opacity-100">Remove</button>
        </div>
      </div>
    </div>`).join('');

  document.querySelectorAll('[data-line]').forEach(row=>{
    const [id,color,size] = row.dataset.line.split('__');
    const line = lines.find(l=>l.id===id && l.color===color && l.size===size);
    row.querySelector('[data-qty-minus]').addEventListener('click', ()=>{ Cart.setQty(id,color,size, line.qty-1); render(); });
    row.querySelector('[data-qty-plus]').addEventListener('click', ()=>{ Cart.setQty(id,color,size, line.qty+1); render(); });
    row.querySelector('[data-remove]').addEventListener('click', ()=>{ Cart.remove(id,color,size); toast('Removed from cart', line.product.name); render(); });
  });

  document.getElementById('apply-coupon').addEventListener('click', ()=>{
    const val = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (VALID_COUPONS[val]){ couponCode = val; toast('Coupon applied', `${Math.round(VALID_COUPONS[val]*100)}% off your order`); }
    else { couponCode = null; toast('Invalid coupon code'); }
    render();
  });
}

render();
initQuickView(PRODUCTS, Cart, toast);
initNavbarScroll();
initMobileMenu();
initSearch();
