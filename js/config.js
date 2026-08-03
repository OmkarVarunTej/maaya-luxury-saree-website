/* ============================================================
   MAAYA — Mock data layer (config-driven, swap for real API later)
   ============================================================ */

export const BRAND = {
  name: "MAAYA",
  tagline: "The House of Handwoven Heritage",
  phone: "+91 98450 12345",
  email: "atelier@maaya.co.in",
  address: "12 Peddar Road, Mumbai 400026",
  instagram: "@maaya.sarees"
};

export const CATEGORIES = [
  { id:"wedding", name:"Wedding Sarees", img:"images/cat_wedding.png", count:64 },
  { id:"silk", name:"Silk Sarees", img:"images/cat_silk.png", count:98 },
  { id:"banarasi", name:"Banarasi", img:"images/cat_banarasi.png", count:52 },
  { id:"cotton", name:"Cotton Sarees", img:"images/cat_cotton.png", count:71 },
  { id:"party", name:"Party Wear", img:"images/cat_party.png", count:45 },
  { id:"designer", name:"Designer Collection", img:"images/cat_designer.png", count:38 }
];

export const OCCASIONS = [
  { id:"wedding", name:"Wedding", img:"images/cat_wedding.png" },
  { id:"festival", name:"Festival", img:"images/cat_cotton.png" },
  { id:"office", name:"Office", img:"images/cat_designer.png" },
  { id:"party", name:"Party", img:"images/cat_party.png" },
  { id:"casual", name:"Casual", img:"images/cat_silk.png" }
];

export const FABRICS = ["Silk","Cotton","Linen","Organza","Georgette","Chiffon"];

const LOCAL_IMGS = [
  "images/saree_model_5.png",
  "images/teal_saree.png",
  "images/saree_5.jpg",
  "images/saree_7.jpg",
  "images/saree_15.jpg",
  "images/saree_16.jpg",
  "images/saree_21.jpg",
  "images/saree_22.jpg",
  "images/saree_model_6.png",
  "images/saree_model_7.png",
  "images/saree_model_4.png",
  "images/cat_wedding.png",
  "images/cat_silk.png",
  "images/cat_banarasi.png",
  "images/cat_cotton.png",
  "images/cat_party.png",
  "images/cat_designer.png",
  "images/luxury-model.png"
];

function names(){
  return [
    "Royal Kanchipuram Silk Saree","Banarasi Zari Elegance","Ivory Wedding Silk Saree",
    "Heritage Cotton Handloom Saree","Maroon Tussar Silk Saree","Emerald Organza Party Saree",
    "Champagne Chiffon Drape","Gold Zari Bridal Saree","Peacock Blue Banarasi Silk",
    "Blush Pink Georgette Saree","Antique Gold Kanjivaram","Onion Pink Linen Saree",
    "Midnight Maroon Silk Saree","Ivory Organza Sequin Saree","Sunset Rust Tussar Saree",
    "Emerald Silk Wedding Saree","Rose Gold Designer Saree","Classic Ivory Cotton Saree",
    "Deep Wine Banarasi Saree","Champagne Gold Organza Saree","Regal Maroon Kanjivaram",
    "Pastel Sage Linen Saree","Copper Zari Silk Saree","Ivory Pearl Bridal Saree",
    "Teal Georgette Party Saree","Saffron Silk Festive Saree","Charcoal Chiffon Saree",
    "Amber Handloom Cotton Saree","Plum Velvet Border Saree","Cream Zari Wedding Saree"
  ];
}

const FABRIC_BY_CAT = {
  wedding:["Silk","Organza"], silk:["Silk"], banarasi:["Silk"], cotton:["Cotton","Linen"],
  party:["Organza","Georgette","Chiffon"], designer:["Silk","Organza","Georgette"]
};
const CAT_LIST = CATEGORIES.map(c=>c.id);
const COLORS = [
  {name:"Maroon",hex:"#5E1A26"},{name:"Gold",hex:"#B8862E"},{name:"Ivory",hex:"#F3EAD8"},
  {name:"Emerald",hex:"#1F4D3A"},{name:"Blush",hex:"#E7B7B0"},{name:"Peacock",hex:"#155263"},
  {name:"Rust",hex:"#A6472E"},{name:"Wine",hex:"#4A1024"}
];

function seededRandom(seed){
  let s = seed % 2147483647; if (s<=0) s += 2147483646;
  return function(){ s = s*16807 % 2147483647; return (s-1)/2147483646; };
}

export const PRODUCTS = names().map((name,i)=>{
  const rnd = seededRandom(i*97+13);
  const cat = CAT_LIST[i % CAT_LIST.length];
  const fabricPool = FABRIC_BY_CAT[cat];
  const fabric = fabricPool[i % fabricPool.length];
  const occasion = OCCASIONS[i % OCCASIONS.length].id;
  const price = Math.round((8500 + rnd()*42000)/100)*100;
  const hasDiscount = i % 3 !== 0;
  const discount = hasDiscount ? [10,15,20,25,30][i%5] : 0;
  const oldPrice = hasDiscount ? Math.round(price/(1-discount/100)/100)*100 : null;
  const img1 = LOCAL_IMGS[i % LOCAL_IMGS.length];
  const img2 = LOCAL_IMGS[(i+1) % LOCAL_IMGS.length];
  const gallery = [0,1,2,3].map(k => LOCAL_IMGS[(i+k) % LOCAL_IMGS.length]);
  const rating = (3.8 + rnd()*1.2).toFixed(1);
  const reviews = Math.round(8 + rnd()*260);
  const stock = i % 11 === 0 ? 0 : (i % 3 === 0 ? ((i % 5) + 1) : Math.floor(6 + rnd()*35));
  return {
    id: `mv-${1000+i}`,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    name,
    category: cat,
    fabric,
    occasion,
    colors: [COLORS[i%COLORS.length], COLORS[(i+3)%COLORS.length]],
    price, oldPrice, discount,
    rating: Number(rating), reviews, stock,
    isNew: i % 6 === 0,
    isNewToday: i % 5 === 0,
    isBestseller: i % 4 === 0,
    isTrending: i % 5 === 0,
    img1, img2, gallery,
    description: `Handwoven by master artisans, the ${name} brings together time-honoured weaving traditions with a refined, contemporary silhouette. Woven on traditional looms using fine ${fabric.toLowerCase()} yarns and finished with hand-embellished zari detailing, this piece is designed to be an heirloom for generations.`,
    specs: {
      Fabric: fabric,
      Weave: cat === "banarasi" ? "Banarasi Brocade" : "Traditional Handloom",
      Length: "6.3 metres (with blouse piece)",
      Blouse: "Unstitched running blouse fabric included",
      Wash: "Dry clean only",
      Origin: cat === "banarasi" ? "Varanasi, Uttar Pradesh" : "Kanchipuram, Tamil Nadu"
    }
  };
});

export const TESTIMONIALS = [
  { name:"Ananya Raghunathan", city:"Chennai", rating:5, text:"The Kanchipuram silk I ordered for my sister's wedding was beyond anything I imagined — the zari work looks even richer in person. It arrived beautifully boxed, like a keepsake." },
  { name:"Meera Iyer", city:"Bengaluru", rating:5, text:"I have bought sarees from many boutiques over the years, but the finishing and drape quality here is unmatched. Customer care helped me pick the right blouse fabric too." },
  { name:"Priyanka Sinha", city:"Delhi", rating:5, text:"My Banarasi saree looked exactly like the photos, if not better. The weight and fall of the fabric make it clear this is genuine handloom work." },
  { name:"Ritu Kapoor", city:"Mumbai", rating:4, text:"Beautiful packaging, prompt delivery, and the saree itself photographs stunningly. Will definitely be shopping here for the festive season." }
];

export const INSTAGRAM = Array.from({length:8}).map((_,i)=>({
  img: LOCAL_IMGS[i % LOCAL_IMGS.length], likes: 200+i*37
}));

export function getProductBySlug(slug){ return PRODUCTS.find(p=>p.slug===slug); }
export function getRelated(product, count=4){
  return PRODUCTS.filter(p=>p.id!==product.id && (p.category===product.category || p.fabric===product.fabric)).slice(0,count);
}
export function formatINR(n){ return "₹" + n.toLocaleString('en-IN'); }
