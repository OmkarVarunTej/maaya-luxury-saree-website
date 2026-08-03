import { PRODUCTS, CATEGORIES, OCCASIONS, FABRICS, formatINR } from './config.js';
import { initNavbarScroll, initReveal, initMobileMenu, initSearch, Cart, Wishlist, toast } from './store.js';
import { renderNavbar, renderFooter } from './layout.js';
import { productCardHTML, bindProductCardEvents, initQuickView } from './product-card.js';

renderNavbar('shop');
renderFooter();

const params = new URLSearchParams(location.search);
const searchVal = params.get('search');
let initCat = params.get('cat') || 'all';
let initOcc = params.get('occasion') || 'all';
let initFabric = params.get('fabric') || 'all';
let initSearch = searchVal || null;

if (searchVal) {
  const q = searchVal.trim().toLowerCase();
  
  // Try mapping search query to category
  const matchedCat = CATEGORIES.find(c => c.id.toLowerCase() === q || c.name.toLowerCase().includes(q));
  if (matchedCat) {
    initCat = matchedCat.id;
    initSearch = null;
  } else {
    // Try mapping search query to fabric
    const matchedFabric = FABRICS.find(f => f.toLowerCase() === q || f.toLowerCase().includes(q));
    if (matchedFabric) {
      initFabric = matchedFabric;
      initSearch = null;
    } else {
      // Try mapping search query to occasion
      const matchedOcc = OCCASIONS.find(o => o.id.toLowerCase() === q || o.name.toLowerCase().includes(q));
      if (matchedOcc) {
        initOcc = matchedOcc.id;
        initSearch = null;
      }
    }
  }
}

const state = {
  cat: initCat,
  occasion: initOcc,
  fabric: initFabric,
  search: initSearch,
  filter: params.get('filter') || null,
  minPrice: 0, maxPrice: 100000,
  colors: [], minRating: 0,
  sort: 'featured',
  view: 'grid',
  page: 1,
  perPage: 9
};

const ALL_COLORS = [...new Map(PRODUCTS.flatMap(p=>p.colors).map(c=>[c.name,c])).values()];

/* ---------------- Page header ---------------- */
function updateHeader(){
  const cat = CATEGORIES.find(c=>c.id===state.cat);
  const occ = OCCASIONS.find(o=>o.id===state.occasion);
  let title = 'Shop All Sarees', crumb = 'Shop All';
  if (state.search) { title = `Search Results for "${state.search}"`; crumb = `Search: ${state.search}`; }
  else if (cat){ title = cat.name; crumb = cat.name; }
  else if (state.filter==='new'){ title = 'New Arrivals'; crumb = 'New Arrivals'; }
  else if (occ){ title = occ.name + ' Sarees'; crumb = occ.name; }
  else if (state.fabric !== 'all'){ title = state.fabric + ' Sarees'; crumb = state.fabric; }
  document.getElementById('page-title').textContent = title;
  document.getElementById('crumb-current').textContent = crumb;
}

/* ---------------- Filters sidebar markup ---------------- */
function filtersHTML(){
  return `
    <div class="mb-8">
      <div class="font-heading text-xs uppercase tracking-[0.2em] text-[#3F3F46] font-bold mb-4">Category</div>
      <div class="space-y-2.5">
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="cat" value="all" ${state.cat==='all'?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/> All Sarees
        </label>
        ${CATEGORIES.map(c=>`
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="cat" value="${c.id}" ${state.cat===c.id?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/> ${c.name}
          <span class="ml-auto text-[#C97B63] text-xs font-semibold">${c.count}</span>
        </label>`).join('')}
      </div>
    </div>
    <div class="mb-8">
      <div class="font-heading text-xs uppercase tracking-[0.2em] text-[#3F3F46] font-bold mb-4">Price Range</div>
      <input type="range" id="price-range" min="0" max="55000" step="1000" value="${state.maxPrice}" class="w-full mb-2 accent-[#C97B63]"/>
      <div class="flex justify-between text-xs text-[#C97B63]"><span>₹0</span><span id="price-val" class="font-bold text-[#C97B63]">${formatINR(state.maxPrice)}</span></div>
    </div>
    <div class="mb-8">
      <div class="font-heading text-xs uppercase tracking-[0.2em] text-[#3F3F46] font-bold mb-4">Fabric</div>
      <div class="space-y-2.5">
        ${FABRICS.map(f=>`
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="fabric" value="${f}" ${state.fabric===f?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/> ${f}
        </label>`).join('')}
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="fabric" value="all" ${state.fabric==='all'?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/> All Fabrics
        </label>
      </div>
    </div>
    <div class="mb-8">
      <div class="font-heading text-xs uppercase tracking-[0.2em] text-[#3F3F46] font-bold mb-4">Colour</div>
      <div class="flex flex-wrap gap-2.5">
        ${ALL_COLORS.map(c=>`
        <button data-color="${c.name}" title="${c.name}" class="color-swatch w-7 h-7 rounded-full border-2 ${state.colors.includes(c.name)?'border-[#C97B63] scale-110':'border-[#EAEAEA]'}" style="background:${c.hex}"></button>`).join('')}
      </div>
    </div>
    <div class="mb-8">
      <div class="font-heading text-xs uppercase tracking-[0.2em] text-[#3F3F46] font-bold mb-4">Occasion</div>
      <div class="space-y-2.5">
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="occasion" value="all" ${state.occasion==='all'?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/> All Occasions
        </label>
        ${OCCASIONS.map(o=>`
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="occasion" value="${o.id}" ${state.occasion===o.id?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/> ${o.name}
        </label>`).join('')}
      </div>
    </div>
    <div class="mb-8">
      <div class="font-heading text-xs uppercase tracking-[0.2em] text-[#3F3F46] font-bold mb-4">Rating</div>
      <div class="space-y-2.5">
        ${[4,3,0].map(r=>`
        <label class="flex items-center gap-2.5 text-sm cursor-pointer text-[#3F3F46] hover:text-[#C97B63] transition-colors">
          <input type="checkbox" name="rating" value="${r}" ${state.minRating===r?'checked':''} class="accent-[#C97B63] rounded border-gray-300 w-4 h-4"/>
          ${r>0 ? `<span class="stars text-[#C97B63]">${'★'.repeat(r)}${'☆'.repeat(5-r)}</span> & up` : 'All Ratings'}
        </label>`).join('')}
      </div>
    </div>
    <div class="mb-4">
      <button id="clear-filters" class="w-full btn border border-[#C97B63] text-[#C97B63] hover:bg-[#C97B63] hover:text-[#FFFFFF] text-xs uppercase font-bold py-2.5 tracking-wider rounded-md transition-all">Clear All Filters</button>
    </div>
  `;
}

function renderFilters(){
  document.getElementById('filters-desktop').innerHTML = filtersHTML();
  document.getElementById('filters-mobile').innerHTML = filtersHTML();
  bindFilterEvents();
}

function bindFilterEvents(){
  document.querySelectorAll('input[name=cat]').forEach(el=>el.addEventListener('change', e=>{
    state.cat = e.target.checked ? e.target.value : 'all';
    state.filter = null; state.page = 1; sync();
  }));
  document.querySelectorAll('input[name=fabric]').forEach(el=>el.addEventListener('change', e=>{
    state.fabric = e.target.checked ? e.target.value : 'all';
    state.page = 1; sync();
  }));
  document.querySelectorAll('input[name=occasion]').forEach(el=>el.addEventListener('change', e=>{
    state.occasion = e.target.checked ? e.target.value : 'all';
    state.page = 1; sync();
  }));
  document.querySelectorAll('input[name=rating]').forEach(el=>el.addEventListener('change', e=>{
    state.minRating = e.target.checked ? Number(e.target.value) : 0;
    state.page = 1; sync();
  }));
  document.querySelectorAll('.color-swatch').forEach(el=>el.addEventListener('click', ()=>{
    const c = el.dataset.color;
    state.colors = state.colors.includes(c) ? state.colors.filter(x=>x!==c) : [...state.colors, c];
    state.page = 1; sync();
  }));
  document.querySelectorAll('#price-range').forEach(el=>{
    el.addEventListener('input', e=>{
      state.maxPrice = Number(e.target.value);
      document.querySelectorAll('#price-val').forEach(v=>v.textContent = formatINR(state.maxPrice));
    });
    el.addEventListener('change', ()=>{ state.page=1; sync(); });
  });
  document.querySelectorAll('#clear-filters, #clear-filters-empty').forEach(el=>el && el.addEventListener('click', ()=>{
    Object.assign(state, { cat:'all', occasion:'all', fabric:'all', filter:null, maxPrice:55000, colors:[], minRating:0, page:1 });
    sync();
  }));
}

/* ---------------- Filtering / sorting logic ---------------- */
function getFiltered(){
  let list = PRODUCTS.slice();
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p=> p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.fabric.toLowerCase().includes(q) || p.occasion.toLowerCase().includes(q) );
  }
  if (state.filter === 'new') list = list.filter(p=>p.isNew);
  if (state.cat !== 'all') list = list.filter(p=>p.category===state.cat);
  if (state.occasion !== 'all') list = list.filter(p=>p.occasion===state.occasion);
  if (state.fabric !== 'all') list = list.filter(p=>p.fabric===state.fabric);
  if (state.colors.length) list = list.filter(p=>p.colors.some(c=>state.colors.includes(c.name)));
  if (state.minRating) list = list.filter(p=>p.rating >= state.minRating);
  list = list.filter(p=>p.price <= state.maxPrice);

  switch(state.sort){
    case 'new': list.sort((a,b)=> (b.isNew - a.isNew)); break;
    case 'price-low': list.sort((a,b)=>a.price-b.price); break;
    case 'price-high': list.sort((a,b)=>b.price-a.price); break;
    case 'rating': list.sort((a,b)=>b.rating-a.rating); break;
    default: break;
  }
  return list;
}

/* ---------------- Chips ---------------- */
function renderChips(){
  const chips = [];
  if (state.search) chips.push({label:`"${state.search}"`, clear:()=>state.search=null});
  if (state.cat!=='all'){ const c = CATEGORIES.find(x=>x.id===state.cat); chips.push({label:c.name, clear:()=>state.cat='all'}); }
  if (state.occasion!=='all'){ const o = OCCASIONS.find(x=>x.id===state.occasion); chips.push({label:o.name, clear:()=>state.occasion='all'}); }
  if (state.fabric!=='all') chips.push({label:state.fabric, clear:()=>state.fabric='all'});
  state.colors.forEach(c=>chips.push({label:c, clear:()=>state.colors=state.colors.filter(x=>x!==c)}));
  if (state.minRating) chips.push({label:`${state.minRating}★ & up`, clear:()=>state.minRating=0});
  if (state.maxPrice < 55000) chips.push({label:`Under ${formatINR(state.maxPrice)}`, clear:()=>state.maxPrice=55000});

  const root = document.getElementById('active-chips');
  root.innerHTML = chips.map((c,i)=>`
    <button data-chip="${i}" class="flex items-center gap-1.5 text-xs bg-[var(--champagne)]/60 px-3 py-1.5 rounded-full">
      ${c.label} <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>`).join('');
  root.querySelectorAll('[data-chip]').forEach(btn=>btn.addEventListener('click', ()=>{
    chips[Number(btn.dataset.chip)].clear(); state.page=1; sync();
  }));
}

/* ---------------- Grid + pagination render ---------------- */
function renderGrid(){
  const filtered = getFiltered();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page-1)*state.perPage;
  const pageItems = filtered.slice(start, start+state.perPage);

  const grid = document.getElementById('product-grid');
  grid.className = state.view==='grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7' : 'flex flex-col gap-5';

  document.getElementById('empty-state').classList.toggle('hidden', total>0);
  grid.classList.toggle('hidden', total===0);

  if (state.view === 'grid'){
    grid.innerHTML = pageItems.map((p,i)=>productCardHTML(p,i)).join('');
  } else {
    grid.innerHTML = pageItems.map(p=>`
      <a href="product.html?slug=${p.slug}" class="flex gap-5 md:gap-8 bg-[var(--ivory)] p-4 md:p-5 rounded-sm lift reveal">
        <div class="w-32 md:w-48 aspect-[3/4] shrink-0 overflow-hidden rounded-sm">
          <img src="${p.img1}" alt="${p.name}" class="w-full h-full object-cover"/>
        </div>
        <div class="flex-1 min-w-0 flex flex-col">
          <div class="font-heading text-lg md:text-xl mb-1">${p.name}</div>
          <div class="stars mb-2">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))} <span class="text-xs opacity-50 font-body">(${p.reviews})</span></div>
          <p class="text-sm opacity-60 line-clamp-2 mb-3 hidden md:block">${p.description}</p>
          <div class="mt-auto flex items-baseline gap-2">
            <span class="font-sans text-xl font-bold text-black">${formatINR(p.price)}</span>
            ${p.oldPrice ? `<span class="text-xs opacity-80 line-through">${formatINR(p.oldPrice)}</span>` : ''}
          </div>
        </div>
      </a>`).join('');
  }
  bindProductCardEvents(grid);
  initReveal();

  document.getElementById('result-count').textContent = `Showing ${total===0?0:start+1}–${Math.min(start+state.perPage,total)} of ${total} sarees`;

  // Pagination
  const pag = document.getElementById('pagination');
  if (totalPages <= 1){ pag.innerHTML=''; return; }
  let html = '';
  for (let i=1;i<=totalPages;i++){
    html += `<button data-page="${i}" class="w-9 h-9 text-sm rounded-full border ${i===state.page?'bg-[#C97B63] text-white border-[#C97B63]':'border-[var(--line)] hover:border-[var(--gold)]'}">${i}</button>`;
  }
  pag.innerHTML = html;
  pag.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click', ()=>{
    state.page = Number(btn.dataset.page); renderGrid();
    document.querySelector('#product-grid').scrollIntoView({ behavior:'smooth', block:'start' });
  }));
}

function sync(){
  updateHeader();
  renderFilters();
  renderChips();
  renderGrid();
}

document.getElementById('sort-select').addEventListener('change', e=>{ state.sort = e.target.value; renderGrid(); });
document.querySelectorAll('.view-btn').forEach(btn=>btn.addEventListener('click', ()=>{
  state.view = btn.dataset.view;
  document.querySelectorAll('.view-btn').forEach(b=>b.classList.toggle('bg-[var(--champagne)]/50', b===btn));
  renderGrid();
}));

// Mobile filter drawer
const drawer = document.querySelector('[data-filter-drawer]');
document.querySelector('[data-filter-toggle]').addEventListener('click', ()=>{
  drawer.classList.remove('translate-x-[-100%]'); document.body.classList.add('overflow-hidden');
});
document.querySelectorAll('[data-filter-close]').forEach(el=>el.addEventListener('click', ()=>{
  drawer.classList.add('translate-x-[-100%]'); document.body.classList.remove('overflow-hidden');
}));

initQuickView(PRODUCTS, Cart, toast);
initNavbarScroll();
initMobileMenu();
initSearch();
sync();
