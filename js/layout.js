import { BRAND, CATEGORIES } from './config.js';

export function renderNavbar(active=''){
  const root = document.getElementById('navbar-root');
  if (!root) return;
  root.className = 'sticky top-0 z-50 shadow-2xl';

  const sareeSubCategoriesLeft = [
    { name: "Kanchipuram Pattu Sarees", cat: "kanchipuram" },
    { name: "Banarasi Sarees", cat: "banarasi" },
    { name: "Tissue Sarees", cat: "tissue" },
    { name: "Georgette Sarees", cat: "georgette" },
    { name: "Silk Sarees", cat: "silk" },
    { name: "Fancy Sarees", cat: "fancy" },
    { name: "Cotton Sarees", cat: "cotton" },
    { name: "Soft Silk Sarees", cat: "softsilk" },
    { name: "Banarasi Kathan Silk Sarees", cat: "kathan" },
    { name: "Crepe Silk Sarees", cat: "crepe" }
  ];

  const sareeSubCategoriesRight = [
    { name: "Work Sarees", cat: "work" },
    { name: "Ikkat Sarees", cat: "ikkat" },
    { name: "Kuppadam Sarees", cat: "kuppadam" },
    { name: "Linen Sarees", cat: "linen" },
    { name: "Paithani Sarees", cat: "paithani" },
    { name: "Tussar Silk Sarees", cat: "tussar" },
    { name: "Gadwal Sarees", cat: "gadwal" },
    { name: "Chiniya Silk Sarees", cat: "chiniya" },
    { name: "Khaddi Georgette Sarees", cat: "khaddi" },
    { name: "Semi Pattu Sarees", cat: "semipattu" },
    { name: "Silk Kota Sarees", cat: "kota" }
  ];

  const leftListHTML = sareeSubCategoriesLeft.map(s => 
    `<li><a href="shop.html?cat=${s.cat}" class="hover:text-[#E31E24] transition-colors py-0.5 block">${s.name}</a></li>`
  ).join('');

  const rightListHTML = sareeSubCategoriesRight.map(s => 
    `<li><a href="shop.html?cat=${s.cat}" class="hover:text-[#E31E24] transition-colors py-0.5 block">${s.name}</a></li>`
  ).join('');

  root.innerHTML = `
  <!-- Top Announcement Strip -->
  <div class="bg-[#E31E24] text-white py-2 px-4 text-center text-xs md:text-sm font-semibold tracking-wide shadow-xs">
    Ashadam Sale Exclusive Offer Up to 50% Off on Our Website & Live Shows!
  </div>

  <!-- Main Navigation Header (Glassmorphism Dark Emerald / Rich Gold Theme) -->
  <header class="sticky top-0 z-50 bg-[#0d1c12]/80 backdrop-blur-md border-b border-[#E5C158]/20 shadow-2xl text-[#E5C158]">
    <div class="max-w-[1500px] mx-auto px-4 md:px-10 py-3.5 flex items-center justify-between">
      
      <!-- Left: Navigation Links (Shop All, Sarees, New Arrivals) -->
      <div class="flex items-center gap-6 lg:gap-9">
        <button data-mobile-toggle class="lg:hidden p-1.5 text-[#E5C158] hover:text-[#FFF5C0] transition" aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>

        <nav class="hidden lg:flex items-center gap-8 text-xs font-bold tracking-[0.2em] uppercase">
          <a href="shop.html" class="text-[#E5C158] hover:text-[#FFF5C0] transition-colors py-1">SHOP ALL</a>

          <!-- SAREES dropdown matching reference screenshot -->
          <div class="relative has-mega group">
            <a href="shop.html" class="text-[#E5C158] hover:text-[#FFF5C0] flex items-center gap-1.5 py-1 transition-colors">
              SAREES
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </a>
            
            <!-- SAREES Sub-Menu Popup -->
            <div class="mega-menu pt-3 left-0">
              <div class="bg-white rounded-md shadow-2xl border border-gray-100 p-6 md:p-8 w-[580px] text-left text-gray-800">
                <a href="shop.html" class="block font-bold text-[#E31E24] text-sm mb-4 hover:underline">All Sarees</a>
                <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-medium text-gray-700">
                  <ul class="space-y-2">
                    ${leftListHTML}
                  </ul>
                  <ul class="space-y-2">
                    ${rightListHTML}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <a href="shop.html?filter=new" class="text-[#E5C158] hover:text-[#FFF5C0] transition-colors py-1">NEW ARRIVALS</a>
        </nav>
      </div>

      <!-- Center Logo: MAAYA in Gold -->
      <a href="index.html" class="flex flex-col items-center group absolute left-1/2 -translate-x-1/2">
        <span class="font-serif text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-[#E5C158] group-hover:text-[#FCE185] transition-colors leading-none" style="font-family:'Playfair Display', serif;">MAAYA</span>
        <span class="text-[8px] uppercase tracking-[0.3em] text-[#FCE185]/80 font-medium mt-1">ROYAL WEAVES</span>
      </a>

      <!-- Right: Search, Account, Wishlist, Cart -->
      <div class="flex items-center gap-3 md:gap-5">
        <!-- Search Input Field -->
        <div class="relative hidden md:block w-44 lg:w-56">
          <input type="text" data-search-toggle placeholder="Search here..." readonly class="w-full bg-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/50 border border-white/15 cursor-pointer hover:border-[#E5C158] transition" />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5C158]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <button data-search-toggle class="md:hidden p-1.5 text-[#E5C158] hover:text-white transition" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>

        <!-- Account Icon -->
        <a href="account.html" class="p-1 text-[#E5C158] hover:text-white transition flex items-center gap-1" aria-label="My Account" title="My Account">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>

        <!-- Wishlist Icon -->
        <a href="account.html?tab=wishlist" class="relative p-1 text-[#E5C158] hover:text-white transition" aria-label="Wishlist" title="Wishlist">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span data-wish-count class="hidden absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#E31E24] text-white text-[10px] font-bold flex items-center justify-center">0</span>
        </a>

        <!-- Shopping Bag Icon -->
        <a href="cart.html" class="relative p-1 text-[#E5C158] hover:text-white transition" aria-label="Cart" title="Shopping Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span data-cart-count class="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#E31E24] text-white text-[10px] font-bold flex items-center justify-center">0</span>
        </a>
      </div>

    </div>
  </header>

  <!-- Mobile panel -->
  <div data-mobile-panel class="fixed inset-0 z-[110] translate-x-full transition-transform duration-500 lg:hidden" style="transition-timing-function:cubic-bezier(.22,1,.36,1)">
    <div class="absolute inset-0 bg-black/60" data-mobile-close></div>
    <div class="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0d1c12] text-[#E5C158] p-6 overflow-y-auto border-l border-white/10">
      <div class="flex justify-between items-center mb-6">
        <span class="font-serif text-xl font-bold tracking-[0.2em] text-[#E5C158]">MAAYA</span>
        <button data-mobile-close class="p-1 text-white/60 hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2"/></svg></button>
      </div>
      <div class="flex flex-col space-y-3">
        <a href="shop.html" class="py-3 border-b border-white/10 text-sm font-medium text-white">Shop All Sarees</a>
        <a href="shop.html?filter=new" class="py-3 border-b border-white/10 text-sm font-medium text-white">New Arrivals</a>
        <a href="account.html" class="py-3 border-b border-white/10 text-sm font-medium text-white">My Account</a>
      </div>
    </div>
  </div>

  <!-- Search overlay -->
  <div data-search-overlay class="hidden fixed inset-0 z-[120] opacity-0 transition-opacity duration-300">
    <div class="absolute inset-0 bg-black/70" data-search-close></div>
    <div class="relative max-w-2xl mx-auto mt-24 md:mt-32 px-5">
      <div class="bg-[#12281a] border border-[#E5C158]/30 rounded-md shadow-2xl overflow-hidden text-white">
        <form data-search-form class="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <button type="submit" aria-label="Submit search" class="text-[#E5C158] hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <input data-search-input type="text" placeholder="Search sarees, fabrics, occasions…" class="flex-1 bg-transparent outline-none text-base text-white placeholder:text-white/40"/>
          <button type="submit" class="bg-[#8C1414] hover:bg-[#A81B1B] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition shrink-0">Search</button>
          <button type="button" data-search-close class="text-xs uppercase font-semibold text-white/50 hover:text-white ml-1">Esc</button>
        </form>
        <div data-search-results class="max-h-[60vh] overflow-y-auto p-2"></div>
      </div>
    </div>
  </div>
  `;
}

export function renderFooter(){
  const root = document.getElementById('footer-root');
  if (!root) return;
  root.innerHTML = `
  <footer class="bg-[#f5f2eb] text-[#1c2820] pt-14 pb-8 border-t border-[#d4af6a]/30 relative z-10 font-sans">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      
      <!-- Top Grid: 5 Columns -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        
        <!-- Column 1: Brand & Contact -->
        <div class="space-y-4">
          <a href="index.html" class="inline-block">
            <span class="font-serif text-3xl font-bold tracking-[0.2em] text-[#8C1414] block leading-none" style="font-family:'Playfair Display', serif;">MAAYA</span>
            <span class="text-[10px] uppercase tracking-[0.3em] text-[#8C1414] font-bold mt-1 block">ROYAL WEAVES</span>
          </a>
          
          <!-- Phone Box -->
          <div class="flex items-center gap-3 pt-2">
            <div class="w-10 h-10 rounded-full border border-[#8C1414]/30 flex items-center justify-center text-[#8C1414] bg-[#8C1414]/5 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <div class="text-xl font-bold text-[#1c2820] tracking-tight">+91 98450 12345</div>
            </div>
          </div>

          <ul class="space-y-2 text-sm text-[#4a584e] pt-1 font-normal">
            <li><a href="mailto:hello@maaya.co.in" class="hover:text-[#8C1414] transition-colors">hello@maaya.co.in</a></li>
            <li><a href="account.html" class="hover:text-[#8C1414] transition-colors">Track Your Order</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Stores</a></li>
          </ul>

          <!-- Social Icons -->
          <div class="flex gap-3 pt-2">
            <a href="#" aria-label="Facebook" class="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-[#8C1414] hover:text-white hover:border-[#8C1414] transition duration-300 text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" class="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-[#8C1414] hover:text-white hover:border-[#8C1414] transition duration-300 text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" class="w-8 h-8 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-[#8C1414] hover:text-white hover:border-[#8C1414] transition duration-300 text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        <!-- Column 2: Shop -->
        <div>
          <h3 class="text-base font-bold text-[#1c2820] mb-3 relative pb-2 inline-block">
            Shop
            <span class="absolute bottom-0 left-0 w-10 h-[2px] bg-[#8C1414]"></span>
          </h3>
          <ul class="space-y-2.5 text-sm text-[#4a584e] font-normal pt-1">
            <li><a href="shop.html?cat=wedding" class="hover:text-[#8C1414] transition-colors">Festive</a></li>
            <li><a href="shop.html?cat=wedding" class="hover:text-[#8C1414] transition-colors">Wedding</a></li>
            <li><a href="shop.html?cat=party" class="hover:text-[#8C1414] transition-colors">Party</a></li>
            <li><a href="shop.html?live=true" class="hover:text-[#8C1414] transition-colors">Video Call Shopping</a></li>
          </ul>
        </div>

        <!-- Column 3: GET TO KNOW US -->
        <div>
          <h3 class="text-base font-bold text-[#1c2820] mb-3 relative pb-2 inline-block">
            GET TO KNOW US
            <span class="absolute bottom-0 left-0 w-10 h-[2px] bg-[#8C1414]"></span>
          </h3>
          <ul class="space-y-2.5 text-sm text-[#4a584e] font-normal pt-1">
            <li><a href="#" class="text-[#8C1414] font-medium hover:underline">FAQ</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Blog</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Awards</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Media</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Stores</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Virtual Tour</a></li>
          </ul>
        </div>

        <!-- Column 4: USER POLICY -->
        <div>
          <h3 class="text-base font-bold text-[#1c2820] mb-3 relative pb-2 inline-block">
            USER POLICY
            <span class="absolute bottom-0 left-0 w-10 h-[2px] bg-[#8C1414]"></span>
          </h3>
          <ul class="space-y-2.5 text-sm text-[#4a584e] font-normal pt-1">
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Terms & Conditions</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Disclaimer</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Return Policy</a></li>
            <li><a href="#" class="hover:text-[#8C1414] transition-colors">Shipping Policy</a></li>
          </ul>
        </div>

        <!-- Column 5: Newsletter & Payment Badges -->
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-bold text-[#1c2820] mb-3 relative pb-2 inline-block">
              Join Our Newsletter
              <span class="absolute bottom-0 left-0 w-10 h-[2px] bg-[#8C1414]"></span>
            </h3>
            <p class="text-xs text-[#4a584e] mb-3">Sign up for our e-mail to get latest news.</p>
            
            <form onsubmit="event.preventDefault(); alert('Subscribed to MAAYA Newsletter!');" class="flex items-center bg-white rounded-full p-1 border border-gray-300 shadow-sm max-w-full">
              <input type="email" placeholder="Your email address" required class="w-full px-4 py-2 text-xs bg-transparent outline-none text-[#1c2820]" />
              <button type="submit" class="bg-[#1c2820] hover:bg-[#8C1414] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shrink-0">Subscribe</button>
            </form>
          </div>

          <div class="pt-2">
            <h4 class="text-xs font-bold text-[#1c2820] uppercase tracking-wider mb-1">Stay Connected With MAAYA</h4>
            <p class="text-[11px] text-[#4a584e] mb-3">Get Latest Updates From Us</p>
            
            <div class="border-t border-gray-300/60 pt-3">
              <h4 class="text-xs font-bold text-[#1c2820] mb-2 relative pb-1 inline-block">
                We Accept
                <span class="absolute bottom-0 left-0 w-8 h-[2px] bg-[#8C1414]"></span>
              </h4>
              <div class="flex items-center gap-2 pt-1">
                <!-- VISA Badge -->
                <div class="bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-bold text-blue-900 shadow-sm flex items-center gap-1">
                  <span class="italic font-extrabold text-blue-800">VISA</span>
                </div>
                <!-- MasterCard Badge -->
                <div class="bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-bold text-gray-800 shadow-sm flex items-center gap-1">
                  <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span class="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 -ml-2"></span>
                </div>
                <!-- UPI Badge -->
                <div class="bg-white border border-gray-200 rounded px-2 py-1 text-[11px] font-bold text-emerald-700 shadow-sm">
                  <span>UPI ⚡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Bar with Scroll-to-Top Button -->
      <div class="border-t border-gray-300/70 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5a685e]">
        <div class="flex items-center gap-2">
          <span class="font-bold text-[#8C1414] font-serif">MAAYA</span>
          <span>© Copyright 2026 MAAYA. All Rights Reserved</span>
        </div>

        <!-- Scroll To Top Button -->
        <button onclick="window.scrollTo({top:0, behavior:'smooth'})" aria-label="Scroll to top" class="w-9 h-9 rounded-full bg-white border border-gray-300 shadow-md text-gray-700 flex items-center justify-center hover:bg-[#8C1414] hover:text-white hover:border-[#8C1414] transition duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      </div>

    </div>
  </footer>`;
}
