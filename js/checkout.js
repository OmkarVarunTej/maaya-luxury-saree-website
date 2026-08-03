import { formatINR } from './config.js';
import { Cart, toast, initNavbarScroll, initMobileMenu, initSearch } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';

renderNavbar('checkout');
renderFooter();

const STEPS = ['Address','Shipping','Payment','Confirmation'];
let step = 1;
const order = { address:{}, shipping:'standard', payment:'card' };

function renderStepper(){
  document.getElementById('stepper').innerHTML = STEPS.map((s,i)=>{
    const n = i+1;
    const state = n < step ? 'done' : (n === step ? 'active' : '');
    return `
    <div class="flex items-center ${i < STEPS.length-1 ? 'flex-1':''}">
      <div class="flex flex-col items-center gap-2">
        <div class="step-dot ${state}">${n < step ? '✓' : n}</div>
        <span class="text-[0.65rem] uppercase tracking-widest ${state?'opacity-100':'opacity-40'} hidden sm:block">${s}</span>
      </div>
      ${i < STEPS.length-1 ? `<div class="step-line ${n < step ? 'done':''} mx-2 md:mx-4"></div>` : ''}
    </div>`;
  }).join('');
}

function renderBody(){
  const body = document.getElementById('checkout-body');
  const lines = Cart.lines();
  const subtotal = Cart.subtotal();
  const shippingCost = order.shipping === 'express' ? 350 : (subtotal > 15000 ? 0 : 250);
  const total = subtotal + shippingCost;

  if (lines.length === 0 && step < 4){
    body.innerHTML = `<div class="text-center py-16"><p class="font-heading text-2xl mb-4">Your cart is empty</p><a href="shop.html" class="btn btn-primary">Shop Now</a></div>`;
    return;
  }

  const summaryCard = `
    <div class="bg-[var(--ivory)] p-6 rounded-md border border-[var(--line)] shadow-xl">
      <h3 class="font-heading text-lg mb-4 text-[#2F2A28]">Order Summary</h3>
      <div class="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1">
        ${lines.map(l=>`
          <div class="flex gap-3 items-center">
            <img src="${l.product.img1}" class="w-12 h-14 object-cover rounded-sm" alt="${l.product.name}"/>
            <div class="flex-1 min-w-0">
              <div class="text-xs line-clamp-1 text-[#2F2A28]/90 font-medium">${l.product.name}</div>
              <div class="text-[0.7rem] text-[#2F2A28]/60">Qty ${l.qty} · ${l.color}</div>
            </div>
            <div class="text-xs font-sans font-bold text-black">${formatINR(l.product.price*l.qty)}</div>
          </div>`).join('')}
      </div>
      <div class="border-t border-[var(--line)] pt-4 space-y-2 text-sm text-[#2F2A28]/90">
        <div class="flex justify-between"><span class="text-[#2F2A28]/60">Subtotal</span><span class="font-sans font-bold">${formatINR(subtotal)}</span></div>
        <div class="flex justify-between"><span class="text-[#2F2A28]/60">Shipping</span><span class="font-sans font-bold">${shippingCost===0?'Free':formatINR(shippingCost)}</span></div>
        <div class="flex justify-between font-heading text-base pt-2 border-t border-[var(--line)] text-black"><span>Total</span><span class="font-sans font-bold">${formatINR(total)}</span></div>
      </div>
    </div>`;

  let stepHTML = '';
  if (step === 1){
    stepHTML = `
      <form id="address-form" class="space-y-4">
        <div class="grid md:grid-cols-2 gap-4">
          <div><label class="text-xs font-semibold mb-1.5 block uppercase tracking-wider text-[#7A1F3D]">Full Name</label><input required name="name" class="input" placeholder="Ananya Sharma" value="${order.address.name||''}"/></div>
          <div><label class="text-xs font-semibold mb-1.5 block uppercase tracking-wider text-[#7A1F3D]">Phone Number</label><input required name="phone" type="tel" class="input" placeholder="98450 12345" value="${order.address.phone||''}"/></div>
        </div>
        <div><label class="text-xs font-semibold mb-1.5 block uppercase tracking-wider text-[#7A1F3D]">Address Line</label><input required name="line1" class="input" placeholder="House no., Street, Locality" value="${order.address.line1||''}"/></div>
        <div class="grid md:grid-cols-3 gap-4">
          <div><label class="text-xs font-semibold mb-1.5 block uppercase tracking-wider text-[#7A1F3D]">City</label><input required name="city" class="input" placeholder="Mumbai" value="${order.address.city||''}"/></div>
          <div><label class="text-xs font-semibold mb-1.5 block uppercase tracking-wider text-[#7A1F3D]">State</label><input required name="state" class="input" placeholder="Maharashtra" value="${order.address.state||''}"/></div>
          <div><label class="text-xs font-semibold mb-1.5 block uppercase tracking-wider text-[#7A1F3D]">Pincode</label><input required name="pincode" maxlength="6" class="input" placeholder="400026" value="${order.address.pincode||''}"/></div>
        </div>
        <label class="flex items-center gap-2 text-sm pt-2 text-[#2F2A28]/90 cursor-pointer"><input type="checkbox" class="accent-[#7A1F3D]" checked/> Save this address for future orders</label>
        <button class="btn btn-primary btn-ripple w-full mt-2">Continue to Shipping</button>
      </form>`;
  } else if (step === 2){
    const options = [
      { id:'standard', name:'Standard Delivery', desc:'5–7 business days', price: subtotal>15000?0:250 },
      { id:'express', name:'Express Delivery', desc:'2–3 business days', price:350 }
    ];
    stepHTML = `
      <div class="space-y-3">
        ${options.map(o=>`
          <label class="flex items-center gap-4 p-5 border rounded-md cursor-pointer transition-all ${order.shipping===o.id?'border-[#7A1F3D] bg-[#FCFAF7] shadow-sm':'border-[#E7DED3] bg-white hover:border-[#7A1F3D]/50'}">
            <input type="radio" name="shipping" value="${o.id}" ${order.shipping===o.id?'checked':''} class="accent-[#7A1F3D] w-4 h-4"/>
            <div class="flex-1">
              <div class="text-sm font-bold text-[#2F2A28]">${o.name}</div>
              <div class="text-xs text-[#7A1F3D] font-medium mt-0.5">${o.desc}</div>
            </div>
            <div class="text-sm font-sans font-bold text-black">${o.price===0?'Free':formatINR(o.price)}</div>
          </label>`).join('')}
      </div>
      <div class="flex gap-3 mt-6">
        <button id="back-btn" class="btn btn-outline flex-1">Back</button>
        <button id="next-btn" class="btn btn-primary btn-ripple flex-1">Continue to Payment</button>
      </div>`;
  } else if (step === 3){
    const methods = [
      { id:'card', name:'Credit / Debit Card' },
      { id:'upi', name:'UPI Instant Payment' },
      { id:'cod', name:'Cash on Delivery' }
    ];
    stepHTML = `
      <div class="space-y-3 mb-6">
        ${methods.map(m=>`
          <label class="flex items-center gap-4 p-5 border rounded-md cursor-pointer transition-all ${order.payment===m.id?'border-[#7A1F3D] bg-[#FCFAF7] shadow-sm':'border-[#E7DED3] bg-white hover:border-[#7A1F3D]/50'}">
            <input type="radio" name="payment" value="${m.id}" ${order.payment===m.id?'checked':''} class="accent-[#7A1F3D] w-4 h-4"/>
            <div class="text-sm font-bold text-[#2F2A28] flex-1">${m.name}</div>
          </label>`).join('')}
      </div>
      <div id="payment-fields" class="mt-2"></div>
      <div class="flex gap-3 mt-6">
        <button id="back-btn" class="btn btn-outline flex-1">Back</button>
        <button id="place-order-btn" class="btn btn-primary btn-ripple flex-1">Place Order · ${formatINR(total)}</button>
      </div>`;
  } else {
    const orderId = 'MYA' + Math.floor(100000+Math.random()*900000);
    stepHTML = `
      <div class="text-center py-10">
        <div class="w-16 h-16 rounded-full bg-[#7A1F3D]/15 flex items-center justify-center mx-auto mb-6">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#7A1F3D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h2 class="font-heading text-2xl md:text-3xl mb-3">Thank You, ${order.address.name?.split(' ')[0]||'Valued Patron'}</h2>
        <p class="opacity-60 max-w-md mx-auto mb-6 font-light">Your order <strong>#${orderId}</strong> has been confirmed. A confirmation has been sent to your registered contact details.</p>
        <div class="flex justify-center gap-3">
          <a href="account.html?tab=orders" class="btn btn-outline">Track Order</a>
          <a href="index.html" class="btn btn-primary">Continue Shopping</a>
        </div>
      </div>`;
  }

  body.innerHTML = step === 4
    ? stepHTML
    : `<div class="grid md:grid-cols-[1fr_320px] gap-8">
         <div>${stepHTML}</div>
         <div>${summaryCard}</div>
       </div>`;

  bindStep();
}

function bindStep(){
  if (step === 1){
    document.getElementById('address-form').addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      order.address = Object.fromEntries(fd.entries());
      step = 2; renderStepper(); renderBody();
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  }
  if (step === 2 || step === 3){
    document.getElementById('back-btn')?.addEventListener('click', ()=>{ step--; renderStepper(); renderBody(); window.scrollTo({top:0,behavior:'smooth'}); });
  }
  if (step === 2){
    document.querySelectorAll('input[name=shipping]').forEach(r=>r.addEventListener('change', e=>{ order.shipping = e.target.value; renderBody(); }));
    document.getElementById('next-btn').addEventListener('click', ()=>{ step = 3; renderStepper(); renderBody(); window.scrollTo({top:0,behavior:'smooth'}); });
  }
  if (step === 3){
    const renderPaymentFields = () => {
      const pf = document.getElementById('payment-fields');
      if (!pf) return;
      if (order.payment === 'card') {
        pf.innerHTML = `<div class="space-y-3 p-4 bg-[#F7F3EE] rounded-md border border-[var(--line)] mt-2">
          <div><label class="text-xs text-[#6F6863] mb-1 block">Card Number</label><input type="text" maxlength="19" placeholder="4242 4242 4242 4242" class="w-full bg-white border border-[var(--line)] rounded-sm px-4 py-2.5 text-sm text-[#2F2A28] outline-none focus:border-[#C9A14A]"/></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-xs text-[#6F6863] mb-1 block">Expiry</label><input type="text" maxlength="5" placeholder="MM/YY" class="w-full bg-white border border-[var(--line)] rounded-sm px-4 py-2.5 text-sm text-[#2F2A28] outline-none focus:border-[#C9A14A]"/></div>
            <div><label class="text-xs text-[#6F6863] mb-1 block">CVV</label><input type="password" maxlength="3" placeholder="•••" class="w-full bg-white border border-[var(--line)] rounded-sm px-4 py-2.5 text-sm text-[#2F2A28] outline-none focus:border-[#C9A14A]"/></div>
          </div>
        </div>`;
      } else if (order.payment === 'upi') {
        pf.innerHTML = `<div class="p-4 bg-[#F7F3EE] rounded-md border border-[var(--line)] mt-2">
          <label class="text-xs text-[#6F6863] mb-1 block">UPI ID</label>
          <input type="text" placeholder="name@upi" class="w-full bg-white border border-[var(--line)] rounded-sm px-4 py-2.5 text-sm text-[#2F2A28] outline-none focus:border-[#C9A14A]"/>
        </div>`;
      } else if (order.payment === 'cod') {
        pf.innerHTML = `<div class="p-4 bg-[var(--gold)]/10 rounded-md border border-[var(--gold)]/30 mt-2 text-sm text-white/80">
          ✓ Pay in cash when your order is delivered. No advance payment required.
        </div>`;
      }
    };
    renderPaymentFields();
    document.querySelectorAll('input[name=payment]').forEach(r=>r.addEventListener('change', e=>{ order.payment = e.target.value; renderPaymentFields(); }));
    document.getElementById('place-order-btn').addEventListener('click', ()=>{
      Cart.clear();
      step = 4; renderStepper(); renderBody();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }
}

renderStepper();
renderBody();
initNavbarScroll();
initMobileMenu();
initSearch();
