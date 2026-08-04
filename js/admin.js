import { PRODUCTS, CATEGORIES, formatINR } from './config.js';

const NAV = [
  { label:'Dashboard', icon:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', active:true },
  { label:'Orders', icon:'M6 7h15l-1.5 9.5a2 2 0 01-2 1.7H8.9a2 2 0 01-2-1.7L5 4H2' },
  { label:'Products', icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label:'Inventory', icon:'M3 7h18M3 12h18M3 17h18' },
  { label:'Customers', icon:'M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M11 3a4 4 0 110 8 4 4 0 010-8z' },
  { label:'Settings', icon:'M12 15a3 3 0 100-6 3 3 0 000 6z' }
];

document.getElementById('admin-nav').innerHTML = NAV.map(n=>`
  <a href="#" class="side-link ${n.active?'active':''} flex items-center gap-3 px-3 py-2.5 rounded-r-sm border-l-2 border-transparent text-sm transition">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="${n.icon}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ${n.label}
  </a>`).join('');

/* Stat cards */
const stats = [
  { label:'Total Revenue', value:'₹42,18,900', change:'+18.4%', up:true, icon:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { label:'Total Orders', value:'1,284', change:'+9.2%', up:true, icon:'M6 7h15l-1.5 9.5a2 2 0 01-2 1.7H8.9a2 2 0 01-2-1.7L5 4H2' },
  { label:'Avg. Order Value', value:'₹32,850', change:'+4.1%', up:true, icon:'M12 8v8m-4-4h8' },
  { label:'Conversion Rate', value:'3.8%', change:'-0.3%', up:false, icon:'M3 3v18h18' }
];
document.getElementById('stat-cards').innerHTML = stats.map(s=>`
  <div class="admin-card p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="w-10 h-10 rounded-full bg-[#6D0016]/10 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="${s.icon}" stroke="#6D0016" stroke-width="1.6" stroke-linecap="round"/></svg>
      </div>
      <span class="text-xs px-2 py-1 rounded-full font-bold ${s.up?'bg-emerald-800/10 text-emerald-800':'bg-red-700/10 text-red-700'}">${s.change}</span>
    </div>
    <div class="text-2xl font-heading mb-1 text-[#6D0016]">${s.value}</div>
    <div class="text-xs text-[#2E2625]/70 font-medium">${s.label}</div>
  </div>`).join('');

/* Charts */
const months = ['Feb','Mar','Apr','May','Jun','Jul'];
new Chart(document.getElementById('revenueChart'), {
  type:'line',
  data:{ labels:months, datasets:[{
    label:'Revenue', data:[520000,610000,580000,720000,690000,845000],
    borderColor:'#6D0016', backgroundColor:'rgba(109, 0, 22, 0.12)', fill:true, tension:0.4, pointRadius:4, pointBackgroundColor:'#6D0016'
  }]},
  options:{ plugins:{ legend:{ display:false } }, scales:{ y:{ ticks:{ callback:v=>'₹'+(v/1000)+'k' }, grid:{ color:'#E5D5B5' } }, x:{ grid:{ display:false } } } }
});
new Chart(document.getElementById('categoryChart'), {
  type:'doughnut',
  data:{ labels: CATEGORIES.map(c=>c.name), datasets:[{
    data: CATEGORIES.map(c=>c.count),
    backgroundColor:['#6D0016','#D4AF37','#2E2625','#8E827E','#C5B69C','#F3ECE2']
  }]},
  options:{ plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{ size:10 } } } }, cutout:'62%' }
});

/* Orders table */
const orders = [
  { id:'MYA482913', customer:'Ananya Sharma', date:'24 Jul', total:38500, status:'Delivered' },
  { id:'MYA482910', customer:'Kavya Menon', date:'24 Jul', total:12900, status:'Processing' },
  { id:'MYA482905', customer:'Priya Nair', date:'23 Jul', total:64200, status:'Shipped' },
  { id:'MYA482899', customer:'Ritu Kapoor', date:'23 Jul', total:8900, status:'Delivered' },
  { id:'MYA482887', customer:'Sneha Iyer', date:'22 Jul', total:21400, status:'Cancelled' }
];
const OSTYLE = { Delivered:'text-emerald-800 bg-emerald-800/10 font-bold', Processing:'text-[#6D0016] bg-[#6D0016]/10 font-bold', Shipped:'text-blue-800 bg-blue-800/10 font-bold', Cancelled:'text-red-700 bg-red-700/10 font-bold' };
document.getElementById('orders-table').innerHTML = `
  <thead><tr class="text-left text-xs text-[#2E2625]/60 border-b border-[#E5D5B5]">
    <th class="py-3 font-semibold">Order</th><th class="py-3 font-semibold">Customer</th><th class="py-3 font-semibold">Date</th><th class="py-3 font-semibold">Total</th><th class="py-3 font-semibold">Status</th>
  </tr></thead>
  <tbody>
    ${orders.map(o=>`
      <tr class="border-b border-[#E5D5B5] last:border-0">
        <td class="py-3 font-medium text-[#6D0016]">#${o.id}</td>
        <td class="py-3 text-[#2E2625]">${o.customer}</td>
        <td class="py-3 text-[#2E2625]/70">${o.date}</td>
        <td class="py-3 font-bold text-[#6D0016]">${formatINR(o.total)}</td>
        <td class="py-3"><span class="text-xs px-2.5 py-1 rounded-full ${OSTYLE[o.status]}">${o.status}</span></td>
      </tr>`).join('')}
  </tbody>`;

/* Top products */
const top = PRODUCTS.filter(p=>p.isBestseller).slice(0,4);
document.getElementById('top-products').innerHTML = top.map(p=>`
  <div class="flex items-center gap-3">
    <img src="${p.img1}" class="w-10 h-12 object-cover rounded-sm border border-[#E5D5B5]" alt="${p.name}"/>
    <div class="flex-1 min-w-0">
      <div class="text-xs font-medium line-clamp-1 text-[#2E2625]">${p.name}</div>
      <div class="text-[0.68rem] text-[#2E2625]/60">${p.reviews} sold</div>
    </div>
    <div class="text-xs font-bold text-[#6D0016]">${formatINR(p.price)}</div>
  </div>`).join('');

/* Inventory table */
const inv = PRODUCTS.slice(0,8);
document.getElementById('inventory-table').innerHTML = `
  <thead><tr class="text-left text-xs text-[#2E2625]/60 border-b border-[#E5D5B5]">
    <th class="py-3 font-semibold">Product</th><th class="py-3 font-semibold">Category</th><th class="py-3 font-semibold">Price</th><th class="py-3 font-semibold">Stock</th><th class="py-3 font-semibold">Status</th>
  </tr></thead>
  <tbody>
    ${inv.map(p=>`
      <tr class="border-b border-[#E5D5B5] last:border-0 ${p.stock<6?'bg-red-700/5':''}">
        <td class="py-3 flex items-center gap-3"><img src="${p.img1}" class="w-8 h-10 object-cover rounded-sm border border-[#E5D5B5]" alt="${p.name}"/><span class="line-clamp-1 max-w-[180px] font-medium text-[#2E2625]">${p.name}</span></td>
        <td class="py-3 text-[#2E2625]/70 capitalize">${p.category}</td>
        <td class="py-3 font-bold text-[#6D0016]">${formatINR(p.price)}</td>
        <td class="py-3 ${p.stock<6?'text-red-700 font-bold':''}">${p.stock}</td>
        <td class="py-3"><span class="text-xs px-2.5 py-1 rounded-full ${p.stock===0?'bg-red-700/10 text-red-700 font-bold':p.stock<6?'bg-[#6D0016]/10 text-[#6D0016] font-bold':'bg-emerald-800/10 text-emerald-800 font-bold'}">${p.stock===0?'Out of Stock':p.stock<6?'Low Stock':'In Stock'}</span></td>
      </tr>`).join('')}
  </tbody>`;
