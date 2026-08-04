import { formatINR, PRODUCTS } from './config.js';
import { Wishlist, Cart, toast, initNavbarScroll, initMobileMenu, initSearch, initReveal, updateBadges } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';
import { productCardHTML, bindProductCardEvents, initQuickView } from './product-card.js';

renderNavbar('account');
renderFooter();
updateBadges();

const params = new URLSearchParams(location.search);
let tab = params.get('tab') || 'dashboard';

const TABS = [
  { id:'dashboard', label:'Dashboard' },
  { id:'orders', label:'My Orders' },
  { id:'wishlist', label:'Wishlist' },
  { id:'addresses', label:'Saved Addresses' },
  { id:'settings', label:'Profile Settings' }
];

const MOCK_ORDERS = [
  { id:'MYA482913', date:'24 Jul 2026', status:'Delivered', total:38500, items:[PRODUCTS[2], PRODUCTS[9]] },
  { id:'MYA471028', date:'02 Jul 2026', status:'In Transit', total:22400, items:[PRODUCTS[14]] },
  { id:'MYA458821', date:'11 Jun 2026', status:'Delivered', total:16900, items:[PRODUCTS[6], PRODUCTS[21]] },
  { id:'MYA440217', date:'29 Apr 2026', status:'Cancelled', total:29900, items:[PRODUCTS[18]] }
];

const STATUS_STYLE = {
  'Delivered':'text-emerald-800 bg-emerald-800/10 font-bold',
  'In Transit':'text-[#6D0016] bg-[#6D0016]/10 font-bold',
  'Cancelled':'text-red-700 bg-red-700/10 font-bold'
};

function renderNav(){
  document.getElementById('acc-nav').innerHTML = TABS.map(t=>`
    <button data-tab="${t.id}" class="acc-link ${tab===t.id?'active':''} whitespace-nowrap transition">${t.label}</button>
  `).join('') + `<button id="logout-btn" class="acc-link text-red-600 bg-red-50/60 hover:bg-red-50 whitespace-nowrap">Sign Out</button>`;
  document.querySelectorAll('.acc-link[data-tab]').forEach(b=>b.addEventListener('click', ()=>{
    tab = b.dataset.tab; history.replaceState(null,'',`account.html?tab=${tab}`); renderAll();
  }));
  document.getElementById('logout-btn').addEventListener('click', ()=>toast('Signed out', 'See you again soon.'));
}

function renderContent(){
  const el = document.getElementById('acc-content');

  if (tab === 'dashboard'){
    el.innerHTML = `
      <div class="grid sm:grid-cols-3 gap-5 mb-10">
        ${[['Total Orders', MOCK_ORDERS.length],['Wishlist Items', Wishlist.count()],['Loyalty Points','1,240']].map(([l,v])=>`
          <div class="bg-[#F3ECE2] border border-[#E5D5B5] p-6 rounded-sm">
            <div class="text-3xl font-sans font-bold text-[#6D0016] mb-1">${v}</div>
            <div class="text-xs uppercase tracking-widest text-[#2E2625]/70 font-semibold">${l}</div>
          </div>`).join('')}
      </div>
      <h3 class="font-heading text-lg mb-4 text-[#6D0016]">Recent Orders</h3>
      <div class="space-y-3">
        ${MOCK_ORDERS.slice(0,2).map(orderRow).join('')}
      </div>`;
  }

  else if (tab === 'orders'){
    el.innerHTML = `<div class="space-y-3">${MOCK_ORDERS.map(orderRow).join('')}</div>`;
  }

  else if (tab === 'wishlist'){
    const items = Wishlist.products();
    el.innerHTML = items.length ? `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" id="wish-grid">${items.map((p,i)=>productCardHTML(p,i)).join('')}</div>`
      : `<div class="text-center py-16"><p class="font-heading text-xl mb-3 text-[#6D0016]">Your wishlist is empty</p><a href="shop.html" class="btn btn-primary">Explore Sarees</a></div>`;
    bindProductCardEvents(el);
    initReveal();
  }

  else if (tab === 'addresses'){
    const addresses = [
      { label:'Home', name:'Ananya Sharma', line:'204 Malabar Hill Residency, Mumbai, Maharashtra 400006', phone:'+91 98450 12345', primary:true },
      { label:'Office', name:'Ananya Sharma', line:'Level 4, BKC Business Tower, Mumbai, Maharashtra 400051', phone:'+91 98450 12345', primary:false }
    ];
    el.innerHTML = `
      <div class="grid sm:grid-cols-2 gap-5 mb-6">
        ${addresses.map(a=>`
          <div class="border border-[#E5D5B5] bg-[#FAF5EF] rounded-sm p-5 relative">
            ${a.primary ? `<span class="absolute top-4 right-4 text-[0.65rem] uppercase tracking-widest bg-[#6D0016] text-[#D4AF37] px-2.5 py-1 rounded-full font-bold">Default</span>` : ''}
            <div class="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-2">${a.label}</div>
            <div class="text-sm font-medium mb-1 text-[#6D0016]">${a.name}</div>
            <div class="text-sm text-[#2E2625]/80 mb-1">${a.line}</div>
            <div class="text-sm text-[#2E2625]/80">${a.phone}</div>
            <div class="flex gap-4 mt-4 text-xs uppercase tracking-widest">
              <button class="underline text-[#6D0016] hover:text-[#D4AF37]">Edit</button>
              <button class="underline text-[#2E2625]/60 hover:text-[#6D0016]">Remove</button>
            </div>
          </div>`).join('')}
      </div>
      <button class="btn btn-outline">+ Add New Address</button>`;
  }

  else if (tab === 'settings'){
    el.innerHTML = `
      <form id="settings-form" class="max-w-lg space-y-4">
        <div><label class="text-xs font-semibold text-[#6D0016] mb-1.5 block">Full Name</label><input class="input" value="Ananya Sharma"/></div>
        <div><label class="text-xs font-semibold text-[#6D0016] mb-1.5 block">Email</label><input class="input" value="ananya.sharma@email.com"/></div>
        <div><label class="text-xs font-semibold text-[#6D0016] mb-1.5 block">Phone</label><input class="input" value="+91 98450 12345"/></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="text-xs font-semibold text-[#6D0016] mb-1.5 block">Birthday</label><input type="date" class="input"/></div>
          <div><label class="text-xs font-semibold text-[#6D0016] mb-1.5 block">Anniversary</label><input type="date" class="input"/></div>
        </div>
        <label class="flex items-center gap-2 text-sm pt-1 text-[#2E2625]"><input type="checkbox" checked class="accent-[#6D0016]"/> Send me styling edits & early access emails</label>
        <button class="btn btn-primary btn-ripple">Save Changes</button>
      </form>`;
    document.getElementById('settings-form').addEventListener('submit', e=>{ e.preventDefault(); toast('Profile updated successfully'); });
  }
}

function orderRow(o){
  return `
  <div class="border border-[#E5D5B5] bg-[#FAF5EF] rounded-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
    <div class="flex -space-x-4">
      ${o.items.slice(0,3).map(p=>`<img src="${p.img1}" class="w-12 h-14 object-cover rounded-sm border-2 border-[#FAF5EF]" alt="${p.name}"/>`).join('')}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-[#6D0016]">#${o.id}</div>
      <div class="text-xs text-[#2E2625]/70">${o.date} · ${o.items.length} item${o.items.length>1?'s':''}</div>
    </div>
    <span class="text-xs px-3 py-1.5 rounded-full ${STATUS_STYLE[o.status]} w-fit">${o.status}</span>
    <div class="font-sans text-lg font-bold text-[#6D0016] sm:text-right sm:w-28">${formatINR(o.total)}</div>
    <button class="btn btn-outline text-xs px-4 py-2.5">View Details</button>
  </div>`;
}

function renderAll(){ renderNav(); renderContent(); }
renderAll();
initQuickView(PRODUCTS, Cart, toast);
initNavbarScroll();
initMobileMenu();
initSearch();
