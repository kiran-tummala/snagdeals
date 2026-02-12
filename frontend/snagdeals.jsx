import { useState, useEffect, useMemo, useCallback } from "react";
// ================================================================
// SnagDeals — Live Deal Configuration
// Set API_URL to your deployed API server. When set, deals are
// fetched live from Supabase. When empty, falls back to hardcoded deals.
// ================================================================
const API_URL = ''; // e.g., 'https://api.snagdeals.co' or 'http://localhost:3001'
const S={am:'#ff9900',wm:'#0071dc',tg:'#cc0000',co:'#e31837',sm:'#0060a9',eb:'#e43137',bb:'#0046be',hd:'#f96302',nk:'#111',ua:'#1d1d1d',lo:'#004990',hb:'#ee1c25',tt:'#e31837',kr:'#0078d4',al:'#e01933',wf:'#006a4d',sp:'#ff7500',tj:'#c8102e',ab:'#ff385c',vb:'#3b5998',ag:'#af52de',mc:'#bb0000',tm:'#e20074'};
// Image helper: generates beautiful gradient product thumbnails as inline SVG data URIs
// Each image is unique based on seed, with category-aware colors and subtle patterns
const GRAD={
  // Product categories with gradient pairs
  headphones:['#1a1a2e','#16213e'],monitor:['#0f0f23','#1a1a40'],vacuum:['#2d132c','#ee4540'],
  tv:['#0c0c1d','#1e3d59'],airpods:['#f5f5f7','#e8e8ed'],tools:['#ff6600','#ff9933'],
  laptop:['#1a1a2e','#2d3436'],phone:['#1a1a2e','#0d47a1'],speaker:['#2d3436','#636e72'],
  watch:['#1a1a2e','#4a69bd'],camera:['#1a1a2e','#2c3e50'],gaming:['#0f0f23','#6c5ce7'],
  gpu:['#1a1a2e','#2d3436'],ssd:['#0c0c1d','#1e3a5f'],cpu:['#1a2332','#2c3e50'],
  ram:['#0f0f23','#341f97'],case:['#1a1a2e','#2d3436'],psu:['#1a2332','#2d3436'],
  cooler:['#0a3d62','#3c6382'],keyboard:['#1a1a2e','#2d3436'],mouse:['#1a1a2e','#636e72'],
  grocery:['#27ae60','#2ecc71'],meat:['#c0392b','#e74c3c'],fruit:['#f39c12','#f1c40f'],
  dairy:['#3498db','#5dade2'],bakery:['#8b6914','#d4a843'],
  fashion:['#2c3e50','#3498db'],shoes:['#1a1a2e','#e74c3c'],dress:['#8e44ad','#9b59b6'],
  jeans:['#2c3e50','#34495e'],jacket:['#1a1a2e','#2c3e50'],
  restaurant:['#e74c3c','#c0392b'],pizza:['#d35400','#e67e22'],burger:['#8b4513','#d2691e'],
  coffee:['#3e2723','#5d4037'],sushi:['#c0392b','#e74c3c'],
  furniture:['#795548','#8d6e63'],sofa:['#5d4037','#795548'],bed:['#4a235a','#7d3c98'],
  hotel:['#1a237e','#283593'],resort:['#006064','#00838f'],
  flight:['#0277bd','#0288d1'],cruise:['#01579b','#0277bd'],
  airbnb:['#ff5a5f','#ff385c'],
  outdoor:['#1b5e20','#2e7d32'],sports:['#e65100','#ef6c00'],
  car:['#263238','#37474f'],health:['#00695c','#00897b'],beauty:['#880e4f','#ad1457'],
  home:['#4e342e','#5d4037'],cleaning:['#0097a7','#00acc1'],
  baby:['#e1bee7','#ce93d8'],pet:['#33691e','#558b2f'],
  default:['#2c3e50','#3498db']
};
const PATS={
  dots:'<circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.06)"/><circle cx="30" cy="30" r="1" fill="rgba(255,255,255,0.06)"/>',
  grid:'<line x1="0" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/><line x1="20" y1="0" x2="20" y2="40" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>',
  diag:'<line x1="0" y1="40" x2="40" y2="0" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>',
  waves:'<path d="M0 20 Q10 10 20 20 T40 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>'
};
function P(seed,w=200,h=200){
  const s=seed.toLowerCase();
  let cat='default';
  if(/headphone|xm5|earbuds|jbl|bose|airpods/.test(s))cat='headphones';
  else if(/monitor|display|screen/.test(s))cat='monitor';
  else if(/vacuum|dyson|shark|roomba|mop|clean/.test(s))cat='vacuum';
  else if(/tv|television|lg-86|insignia|samsung-tv|oled|qled/.test(s))cat='tv';
  else if(/laptop|macbook|rog|legion|msi|cyborg|vector|stealth|tuf/.test(s))cat='laptop';
  else if(/phone|iphone|galaxy|pixel/.test(s))cat='phone';
  else if(/watch/.test(s))cat='watch';
  else if(/gpu|rtx|rx9|radeon|graphics/.test(s))cat='gpu';
  else if(/ssd|nvme|intel-ssd|samsung-9|seagate/.test(s))cat='ssd';
  else if(/cpu|ryzen|amd-r|processor/.test(s))cat='cpu';
  else if(/ram|gskill|ddr/.test(s))cat='ram';
  else if(/case|montech|tower/.test(s))cat='case';
  else if(/psu|corsair-rm|power-s/.test(s))cat='psu';
  else if(/cool|nzxt|kraken|aio/.test(s))cat='cooler';
  else if(/xbox|gaming|gamestop|abs-gaming/.test(s))cat='gaming';
  else if(/camera|gopro|blink|ring|dash/.test(s))cat='camera';
  else if(/echo|speaker|karaoke/.test(s))cat='speaker';
  else if(/steak|ny-strip|ribeye|wagyu|chuck|roast|rotisserie|meat|chicken|wing|tend|popeyes/.test(s))cat='meat';
  else if(/avocado|blueberr|honeycrisp|fruit/.test(s))cat='fruit';
  else if(/egg|milk|butter|cheese|fairlife|dairy|yogurt/.test(s))cat='dairy';
  else if(/bread|bagel|pretzel|bakery/.test(s))cat='bakery';
  else if(/grocery|food|vitamin|olive-oil|charmin|storage|shred/.test(s))cat='grocery';
  else if(/shoe|nike|adidas|skecher|puma|nb-1080|airmax/.test(s))cat='shoes';
  else if(/dress|boho|blouse|outfit|satin|vneck|cardigan/.test(s))cat='dress';
  else if(/jeans|gap-jean|oldnavy/.test(s))cat='jeans';
  else if(/jacket|columbia|north|eddie/.test(s))cat='jacket';
  else if(/fashion|nordstrom|macys|hanes|polo|briefs|hoodie|handbag|rack|outlet/.test(s))cat='fashion';
  else if(/pizza|dominos|frozen-pizza/.test(s))cat='pizza';
  else if(/burger|mcdonalds|wendys|carls|bww/.test(s))cat='burger';
  else if(/coffee|starbucks|dunkin|panera/.test(s))cat='coffee';
  else if(/sushi|chipotle|subway|ihop|taco|olive-garden|chickfila/.test(s))cat='restaurant';
  else if(/sofa|west-elm|couch|ashley|living/.test(s))cat='sofa';
  else if(/bed|mattress|serta|pillow|quilt|bedroom|beckham/.test(s))cat='bed';
  else if(/furniture|dining|cb2|pottery|chair|office-chair|wayfair|ikea|rooms/.test(s))cat='furniture';
  else if(/hotel|hyatt|ritz|w-hotel|park-hyatt|4seasons/.test(s))cat='hotel';
  else if(/flight|dfw|sfo|barcelona|cancun-van|london|paris|tokyo/.test(s))cat='flight';
  else if(/cruise|carnival|royal|celebrity|norwegian|msc/.test(s))cat='cruise';
  else if(/airbnb|condo|villa|chalet|cabin|treehouse|flat|bali-boat|smoky/.test(s))cat='airbnb';
  else if(/car|suv|hertz|rental|bridgestone|stereo|uber|lyft|japan-rail/.test(s))cat='car';
  else if(/outdoor|rei|traeger|grill|ryobi|blower|ridgid|kobalt|dewalt|craftsman/.test(s))cat='outdoor';
  else if(/clinique|skincare|beauty|cvs|lip|cream|shower/.test(s))cat='beauty';
  else if(/home|led|hue|govee|strip|power-strip|pot|kitchen|ninja|instant|shower-head|walkie|suncatch|ceramic|throw|mugs|target-bed|storage-bin|storage-bag/.test(s))cat='home';
  const g=GRAD[cat]||GRAD.default;
  const hash=s.split('').reduce((a,c)=>((a<<5)-a)+c.charCodeAt(0),0);
  const patKeys=Object.keys(PATS);
  const pat=PATS[patKeys[Math.abs(hash)%patKeys.length]];
  const angle=(Math.abs(hash)%360);
  const glow=`rgba(255,255,255,${0.03+(Math.abs(hash)%5)*0.01})`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${g[0]}"/><stop offset="100%" stop-color="${g[1]}"/></linearGradient>
      <radialGradient id="r" cx="${30+Math.abs(hash)%40}%" cy="${30+Math.abs(hash>>2)%40}%" r="60%"><stop offset="0%" stop-color="${glow}"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle%45})">${pat}</pattern>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#r)"/>
    <rect width="${w}" height="${h}" fill="url(#p)"/>
    <rect x="${w*0.15}" y="${h*0.15}" width="${w*0.7}" height="${h*0.7}" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const D=[
// RETAIL (40)
{id:1,cat:'retail',store:'Amazon',sc:S.am,img:P('sony-xm5'),em:'🎧',title:'Sony WH-1000XM5 Wireless Noise Canceling Headphones — 30hr Battery',price:248,orig:399.99,off:38,votes:1842,time:'2h ago',comments:156,tags:['hot','fp'],ship:'Free Prime'},
{id:2,cat:'retail',store:'Best Buy',sc:S.bb,img:P('lg-monitor'),em:'🖥️',title:'LG 34" UltraWide QHD Curved IPS Monitor w/ HDR10 — All-Time Low',price:299,orig:499.99,off:40,votes:2203,time:'45m ago',comments:289,tags:['hot','fp'],ship:'Free Ship'},
{id:3,cat:'retail',store:'Amazon',sc:S.am,img:P('dyson-vacuum'),em:'🧹',title:'Dyson V15 Detect Cordless Vacuum — Lightning Deal',price:449,orig:749.99,off:40,votes:1621,time:'1h ago',comments:434,tags:['hot','fp'],ship:'Free Prime'},
{id:4,cat:'retail',store:'Walmart',sc:S.wm,img:P('samsung-tv75'),em:'📺',title:'Samsung 75" Crystal UHD 4K Smart TV (2024) — Rollback',price:547,orig:799.99,off:32,votes:1234,time:'1h ago',comments:198,tags:['hot','fp'],ship:'Free Ship'},
{id:5,cat:'retail',store:'Amazon',sc:S.am,img:P('airpods-pro2'),em:'🎵',title:'Apple AirPods Pro 2 (USB-C) — Active Noise Cancellation',price:189,orig:249,off:24,votes:2341,time:'2h ago',comments:567,tags:['hot','fp'],ship:'Free Prime'},
{id:6,cat:'retail',store:'Home Depot',sc:S.hd,img:P('ryobi-kit'),em:'🔧',title:'RYOBI ONE+ 18V Kit: (2) 4.0Ah + 2.0Ah Batteries + FREE Saw',price:179,orig:329,off:46,votes:896,time:'1h ago',comments:102,tags:['hot','fp'],ship:'Free Ship'},
{id:7,cat:'retail',store:'Costco',sc:S.co,img:P('lg-86tv'),em:'📺',title:'Costco: LG 86" UR7800 4K UHD Smart LED TV — Members',price:799.99,orig:1199.99,off:33,votes:1567,time:'1h ago',comments:312,tags:['hot','fp'],ship:'Free Ship'},
{id:8,cat:'retail',store:'Walmart',sc:S.wm,img:P('xbox-series-x'),em:'🎮',title:'Xbox Series X 1TB Console — In Stock, Ships Same Day',price:449,orig:499.99,off:10,votes:2345,time:'30m ago',comments:567,tags:['hot','fp'],ship:'Free Ship'},
{id:9,cat:'retail',store:'Amazon',sc:S.am,img:P('asus-rog'),em:'💻',title:'ASUS ROG Zephyrus G14 — 3K OLED 120Hz, Ryzen 9, RTX 4060',price:1099,orig:1599.99,off:31,votes:762,time:'4h ago',comments:178,tags:['fp'],ship:'Free Ship'},
{id:10,cat:'retail',store:'eBay',sc:S.eb,img:P('macbook-pro14'),em:'💻',title:'Refurb: MacBook Pro 14" M3 Pro/18GB — 90%+ Battery',price:1050,orig:1999.99,off:47,votes:1234,time:'1h ago',comments:234,tags:['hot','fp'],ship:'Free Ship'},
{id:11,cat:'retail',store:'Target',sc:S.tg,img:P('apple-watch-se'),em:'⌚',title:'Apple Watch SE 2nd Gen 40mm GPS — $50 Off + RedCard',price:199,orig:249,off:20,votes:1456,time:'2h ago',comments:312,tags:['hot'],ship:'Free Ship'},
{id:12,cat:'retail',store:"Sam's Club",sc:S.sm,img:P('iphone-15'),em:'📱',title:'iPhone 15 128GB — $200 Gift Card w/ Activation',price:799,orig:999,off:20,votes:2345,time:'30m ago',comments:567,tags:['hot','fp'],ship:'Free Ship'},
{id:13,cat:'retail',store:'Amazon',sc:S.am,img:P('echo-dot5'),em:'🔊',title:'Echo Dot 5th Gen + Smart Plug Bundle — 65% Off',price:22.99,orig:64.98,off:65,votes:6789,time:'30m ago',comments:1567,tags:['hot','fp'],ship:'Free Prime'},
{id:14,cat:'retail',store:'Costco',sc:S.co,img:P('macbook-costco'),em:'💻',title:'MacBook Pro 14" M3 Pro — $200 Costco Shop Card',price:1799,orig:1999,off:10,votes:2345,time:'2h ago',comments:567,tags:['hot','fp'],ship:'Free Ship'},
{id:15,cat:'retail',store:'Best Buy',sc:S.bb,img:P('iphone15pro'),em:'📱',title:'iPhone 15 Pro — Save up to $1000 w/ Trade-in',price:0,orig:999,off:100,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free Ship'},
{id:16,cat:'retail',store:'Micro Center',sc:S.mc,img:P('ryzen-9800'),em:'💾',title:'Micro Center: AMD Ryzen 7 9800X3D — In Stock',price:449,orig:479,off:6,votes:5678,time:'30m ago',comments:1234,tags:['hot','fp'],ship:'In-Store'},
{id:17,cat:'retail',store:'T-Mobile',sc:S.tm,img:P('iphone16pro'),em:'📱',title:'T-Mobile: Free iPhone 16 Pro w/ Trade-In on Go5G Plus',price:0,orig:999,off:100,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'Free Ship'},
{id:18,cat:'retail',store:'Amazon',sc:S.am,img:P('blink-camera'),em:'📷',title:'Blink Outdoor 4 3-Camera System — 54% Off',price:119,orig:259.99,off:54,votes:493,time:'6h ago',comments:134,tags:['fp'],ship:'Free Prime'},
{id:19,cat:'retail',store:'Walmart',sc:S.wm,img:P('shark-vacuum'),em:'🧹',title:'Shark Navigator Lift-Away Vacuum — Half Price',price:98,orig:199.99,off:51,votes:892,time:'6h ago',comments:178,tags:['fp'],ship:'Free Ship'},
{id:20,cat:'retail',store:'Amazon',sc:S.am,img:P('jbl-headphones'),em:'🎧',title:'JBL Tune 770NC Over-Ear ANC Headphones — 50% Off',price:49.95,orig:99.95,off:50,votes:1567,time:'4h ago',comments:312,tags:['hot'],ship:'Free Prime'},
{id:21,cat:'retail',store:'Costco',sc:S.co,img:P('bridgestone'),em:'🛞',title:'Set of 4 Bridgestone Tires — $150 Off + Free Install',price:599,orig:899,off:33,votes:2345,time:'4h ago',comments:567,tags:['hot','fp'],ship:'In-Warehouse'},
{id:22,cat:'retail',store:'GameStop',sc:'#000',img:P('gamestop-deal'),em:'🎮',title:'GameStop: Buy 2 Get 1 Free Pre-Owned Games & Controllers',price:0,orig:0,off:33,votes:2345,time:'4h ago',comments:456,tags:['hot'],ship:'Free on $35+'},
{id:23,cat:'retail',store:'eBay',sc:S.eb,img:P('galaxy-s24'),em:'📱',title:'Galaxy S24 Ultra 256GB Unlocked — Open Box Excellent',price:749,orig:1299.99,off:42,votes:876,time:'2h ago',comments:156,tags:['hot'],ship:'Free Ship'},
{id:24,cat:'retail',store:'Amazon',sc:S.am,img:P('kindle-pw'),em:'📚',title:'Kindle Paperwhite 16GB — 6.8" Warm Light, Waterproof',price:119.99,orig:149.99,off:20,votes:2345,time:'4h ago',comments:567,tags:['fp'],ship:'Free Prime'},
{id:25,cat:'retail',store:"Kohl's",sc:'#7c1d42',img:P('shark-robot'),em:'🤖',title:"Kohl's: Shark AI Robot Vacuum + $60 Kohl's Cash",price:299,orig:549.99,off:46,votes:1234,time:'1h ago',comments:234,tags:['hot','fp'],ship:'Free Ship'},
{id:26,cat:'retail',store:'Amazon',sc:S.am,img:P('philips-hue'),em:'💡',title:'Philips Hue White & Color A19 Starter Kit — 3 Bulbs + Bridge',price:89.99,orig:134.99,off:33,votes:1234,time:'3h ago',comments:234,tags:[],ship:'Free Prime'},
{id:27,cat:'retail',store:'Walmart',sc:S.wm,img:P('hp-laptop'),em:'💻',title:'HP 15.6" FHD Laptop — Ryzen 5, 16GB, 512GB SSD',price:329,orig:499.99,off:34,votes:723,time:'2h ago',comments:134,tags:['fp'],ship:'Free Ship'},
{id:28,cat:'retail',store:'Amazon',sc:S.am,img:P('ring-doorbell'),em:'🔔',title:'Ring Video Doorbell Pro 2 — 1536p HD, 40% Off',price:149,orig:249.99,off:40,votes:434,time:'5h ago',comments:98,tags:[],ship:'Free Prime'},
{id:29,cat:'retail',store:'eBay',sc:S.eb,img:P('roomba-j7'),em:'🤖',title:'iRobot Roomba j7+ Self-Empty — Certified Refurb, 55% Off',price:269,orig:599.99,off:55,votes:1123,time:'8h ago',comments:234,tags:['hot'],ship:'Free Ship'},
{id:30,cat:'retail',store:"Sam's Club",sc:S.sm,img:P('shark-stratos'),em:'🧹',title:'Shark Stratos Robot Vacuum + Self-Empty — Members',price:299,orig:499.99,off:40,votes:1567,time:'1h ago',comments:312,tags:['hot','fp'],ship:'Free Ship'},
{id:31,cat:'retail',store:'Amazon',sc:S.am,img:P('skincare-set'),em:'🧴',title:'Skincare Essentials Bundle: Mineral Sunscreen $5 | Body Cream $3+',price:3,orig:12.99,off:77,votes:2345,time:'1h ago',comments:456,tags:['hot','fp'],ship:'Free Prime'},
{id:32,cat:'retail',store:'Amazon',sc:S.am,img:P('storage-bins'),em:'📦',title:'Light Up Picture Frame $9 | 4-Pack Storage Bins $11 | Ottoman $20',price:9,orig:24.99,off:64,votes:1567,time:'30m ago',comments:312,tags:['hot'],ship:'Free Prime'},
{id:33,cat:'retail',store:'Amazon',sc:S.am,img:P('galaxy-proj'),em:'🌌',title:'Galaxy Projector $11 | 2-Pack Bubble Machine $9 | LED Drawing Board $12',price:9,orig:29.99,off:70,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
{id:34,cat:'retail',store:'Amazon',sc:S.am,img:P('walkie-talkie'),em:'📻',title:'Walkie Talkies for Kids $9+ | Building Blocks Set $8+ — Gift Ideas',price:8,orig:24.99,off:68,votes:1876,time:'2h ago',comments:345,tags:['fp'],ship:'Free Prime'},
{id:35,cat:'retail',store:'Amazon',sc:S.am,img:P('ceramic-tray'),em:'🫖',title:'Ceramic Serving Trays $23 | Insulated Tumblers $7 | Parchment Paper $8',price:7,orig:19.99,off:65,votes:987,time:'3h ago',comments:178,tags:[],ship:'Free Prime'},
{id:36,cat:'retail',store:'Amazon',sc:S.am,img:P('coffee-mugs'),em:'☕',title:'Ceramic Coffee Mugs Set — Multiple Designs from $4+',price:4,orig:14.99,off:73,votes:2345,time:'1h ago',comments:456,tags:['hot'],ship:'Free Prime'},
{id:37,cat:'retail',store:'Amazon',sc:S.am,img:P('clinique-lip'),em:'💄',title:'Clinique Almost Lipstick in Black Honey — $19 (reg $25)',price:19,orig:25,off:24,votes:4567,time:'2h ago',comments:890,tags:['hot','fp'],ship:'Free Prime'},
{id:38,cat:'retail',store:'Amazon',sc:S.am,img:P('foot-cream'),em:'🧴',title:'Foot Cream $4 | 3-Pack Peeling Masks $6 | Arch Support Insoles $9',price:4,orig:15.99,off:75,votes:1234,time:'3h ago',comments:234,tags:['fp'],ship:'Free Prime'},
{id:39,cat:'retail',store:'Amazon',sc:S.am,img:P('suncatcher'),em:'🌈',title:'Suncatcher Kit $6 | Crystal Tree $7 — Home Decor Gifts',price:6,orig:18.99,off:68,votes:876,time:'4h ago',comments:156,tags:[],ship:'Free Prime'},
{id:40,cat:'retail',store:'Amazon',sc:S.am,img:P('karaoke-machine'),em:'🎤',title:'Portable Karaoke Machine $9+ | Instant Print Camera $9+',price:9,orig:34.99,off:74,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
// DOA (DealsOfAmerica) INSPIRED DEALS
{id:41,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('hp200d-power'),em:'🔋',title:'HP Portable Power Station 200W/268Wh — Solar Ready, 54% Off w/ Code',price:149,orig:329,off:55,votes:876,time:'1h ago',comments:134,tags:['hot','fp'],ship:'Free Ship'},
{id:42,cat:'retail',store:'Amazon',sc:S.am,img:P('norton-360'),em:'🛡️',title:'Norton 360 Deluxe 5-Device 15-Month — Digital Download',price:19.99,orig:89.99,off:78,votes:2345,time:'30m ago',comments:456,tags:['hot','fp'],ship:'Instant'},
{id:43,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('intel-ssd'),em:'💾',title:'Intel 670p 2TB NVMe M.2 SSD — 635 TBW Endurance',price:28.99,orig:74.99,off:61,votes:1567,time:'2h ago',comments:312,tags:['hot'],ship:'Free Ship'},
{id:44,cat:'retail',store:'Amazon',sc:S.am,img:P('car-stereo'),em:'📻',title:'Android Auto 10.1" Touchscreen Car Stereo — Clip $8 Coupon',price:89,orig:159.99,off:44,votes:987,time:'3h ago',comments:178,tags:['fp'],ship:'Free Prime'},
{id:45,cat:'retail',store:'Amazon',sc:S.am,img:P('shower-head'),em:'🚿',title:'High Pressure Shower Head 5" w/ Water Filter — Coupon Stack',price:18.14,orig:32.98,off:45,votes:1234,time:'1h ago',comments:234,tags:['hot'],ship:'Free Prime'},
{id:46,cat:'retail',store:'Amazon',sc:S.am,img:P('power-strip'),em:'🔌',title:'28-in-1 Versatile Power Strip w/ 6ft Cord — FCC Certified',price:25.99,orig:45.99,off:43,votes:567,time:'4h ago',comments:89,tags:[],ship:'Free Prime'},
{id:47,cat:'retail',store:'Home Depot',sc:S.hd,img:P('dewalt-impact'),em:'🔧',title:'DEWALT 20V MAX Impact Driver Kit w/ 2 Batteries — HD Clearance',price:99,orig:179,off:45,votes:2345,time:'1h ago',comments:456,tags:['hot','fp'],ship:'Free Ship'},
{id:48,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('msi-laptop'),em:'💻',title:'MSI Stealth 15" i7-11800H RTX 3060 — $50 Off w/ Code',price:1149,orig:1299,off:12,votes:876,time:'2h ago',comments:156,tags:['fp'],ship:'Free Ship'},
{id:49,cat:'retail',store:'Amazon',sc:S.am,img:P('dash-cam'),em:'📹',title:'Vantrue N4 3-Channel Dash Cam 4K+1080P — Lightning Deal',price:199,orig:299.99,off:34,votes:1567,time:'45m ago',comments:312,tags:['hot'],ship:'Free Prime'},
{id:50,cat:'retail',store:"Lowe's",sc:S.lo,img:P('kobalt-tool'),em:'🧰',title:"Lowe's: Kobalt 227-Piece Mechanic Tool Set — Presidents Day",price:99,orig:199,off:50,votes:1876,time:'1h ago',comments:345,tags:['hot','fp'],ship:'Free Ship'},
{id:51,cat:'fashion',store:'Amazon',sc:S.am,img:P('hanes-briefs'),em:'🩲',title:'Hanes 10-Pack ComfortSoft Boxer Briefs — Multiple Colors',price:20,orig:36.99,off:46,votes:3456,time:'2h ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
{id:52,cat:'fashion',store:"Kohl's",sc:'#7c1d42',img:P('sonoma-quilt'),em:'🛏️',title:"Kohl's: Sonoma Heritage Quilt or Sham — Extra 20% + Kohl's Cash",price:29,orig:79.99,off:64,votes:987,time:'3h ago',comments:178,tags:['fp'],ship:'Free Ship'},
{id:53,cat:'furniture',store:'Amazon',sc:S.am,img:P('led-strip-100'),em:'💡',title:'100ft LED Strip Lights w/ App & Remote — Music Sync, 16M Colors',price:12.99,orig:29.99,off:57,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'Free Prime'},
{id:54,cat:'furniture',store:'Home Depot',sc:S.hd,img:P('ridgid-vac'),em:'🧹',title:'RIDGID 16-Gallon Shop Vac w/ Cart — HD Special Buy',price:79,orig:149,off:47,votes:1234,time:'4h ago',comments:234,tags:['hot'],ship:'Free Ship'},
{id:55,cat:'retail',store:'Amazon',sc:S.am,img:P('wireless-earbuds'),em:'🎧',title:'Wireless Earbuds ANC 40hr Battery — Clip 60% Off Coupon',price:19.99,orig:49.99,off:60,votes:2345,time:'30m ago',comments:456,tags:['hot','fp'],ship:'Free Prime'},
{id:56,cat:'retail',store:'Walmart',sc:S.wm,img:P('onn-tablet'),em:'📱',title:'onn. 10.4" 2K Tablet 128GB Android 14 — Rollback',price:99,orig:179,off:45,votes:1567,time:'2h ago',comments:312,tags:['hot'],ship:'Free Ship'},
{id:57,cat:'furniture',store:'Amazon',sc:S.am,img:P('robot-mop'),em:'🤖',title:'Robot Vacuum & Mop Combo LiDAR Navigation — 72% Off Coupon',price:139,orig:499.99,off:72,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
{id:58,cat:'retail',store:'Best Buy',sc:S.bb,img:P('insignia-tv50'),em:'📺',title:'Insignia 50" Class F30 4K Fire TV — Presidents Day Price',price:179.99,orig:279.99,off:36,votes:1876,time:'3h ago',comments:345,tags:['fp'],ship:'Free Ship'},
// GROCERY (28)
{id:100,cat:'grocery',store:'H-E-B',sc:S.hb,img:P('ribeye-steak'),em:'🥩',title:'H-E-B Prime 1 Beef Ribeye (Bone-In) — $9.97/lb Weekly Special',price:9.97,orig:16.99,off:41,votes:3456,time:'30m ago',comments:678,tags:['hot','fp'],ship:'In-Store'},
{id:101,cat:'grocery',store:'H-E-B',sc:S.hb,img:P('avocados'),em:'🥑',title:'H-E-B: Large Hass Avocados 5 for $5 — Produce Deal',price:1,orig:1.99,off:50,votes:2345,time:'1h ago',comments:456,tags:['hot'],ship:'In-Store / Curbside'},
{id:102,cat:'grocery',store:'H-E-B',sc:S.hb,img:P('french-bread'),em:'🍞',title:'H-E-B Bakery: Fresh French Bread 2-Pack — Combo Loco',price:2.50,orig:5.98,off:58,votes:1567,time:'2h ago',comments:312,tags:['fp'],ship:'In-Store'},
{id:103,cat:'grocery',store:'H-E-B',sc:S.hb,img:P('shredded-cheese'),em:'🧀',title:'H-E-B Select Shredded Cheese 32oz — Digital Coupon',price:5.49,orig:8.99,off:39,votes:987,time:'3h ago',comments:178,tags:[],ship:'In-Store'},
{id:104,cat:'grocery',store:'Tom Thumb',sc:S.tt,img:P('rotisserie'),em:'🍗',title:'Tom Thumb: Whole Rotisserie Chicken — Just for U Price',price:5.99,orig:8.99,off:33,votes:2345,time:'1h ago',comments:456,tags:['hot','fp'],ship:'In-Store'},
{id:105,cat:'grocery',store:'Tom Thumb',sc:S.tt,img:P('fairlife-milk'),em:'🥛',title:'Tom Thumb: Fairlife Milk 52oz — Digital Coupon BOGO',price:3.49,orig:6.99,off:50,votes:1234,time:'2h ago',comments:234,tags:['hot'],ship:'In-Store'},
{id:106,cat:'grocery',store:'Tom Thumb',sc:S.tt,img:P('honeycrisp'),em:'🍎',title:'Tom Thumb: Organic Honeycrisp Apples $1.99/lb — Weekly Ad',price:1.99,orig:3.49,off:43,votes:876,time:'3h ago',comments:156,tags:['fp'],ship:'In-Store'},
{id:107,cat:'grocery',store:'Kroger',sc:S.kr,img:P('eggs-18ct'),em:'🥚',title:'Kroger: Large Eggs 18ct — Digital Coupon, Limit 2',price:2.99,orig:5.49,off:46,votes:4567,time:'30m ago',comments:890,tags:['hot','fp'],ship:'In-Store'},
{id:108,cat:'grocery',store:'Kroger',sc:S.kr,img:P('chuck-roast'),em:'🍖',title:'Kroger: USDA Choice Chuck Roast $4.99/lb — Mega Sale',price:4.99,orig:8.99,off:44,votes:2345,time:'2h ago',comments:456,tags:['hot'],ship:'In-Store'},
{id:109,cat:'grocery',store:'Aldi',sc:S.al,img:P('irish-butter'),em:'🧈',title:'Aldi: Grass-Fed Butter (Irish Style) 8oz — $2.99 Aldi Find',price:2.99,orig:5.49,off:46,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'In-Store'},
{id:110,cat:'grocery',store:'Aldi',sc:S.al,img:P('frozen-pizza'),em:'🍕',title:'Aldi: Mama Cozzi\'s Take & Bake Pizza — Weekly Find',price:4.49,orig:6.99,off:36,votes:2345,time:'2h ago',comments:456,tags:['fp'],ship:'In-Store'},
{id:111,cat:'grocery',store:'Costco',sc:S.co,img:P('wagyu-steak'),em:'🥩',title:'Costco: A5 Wagyu Ribeye Steaks 2-Pack — Ships Frozen',price:109.99,orig:159.99,off:31,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Ships Frozen'},
{id:112,cat:'grocery',store:'Costco',sc:S.co,img:P('parmigiano'),em:'🧀',title:'Kirkland Parmigiano Reggiano 72-Month 2lbs',price:17.99,orig:27.99,off:36,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'In-Warehouse'},
{id:113,cat:'grocery',store:'Costco',sc:S.co,img:P('bordeaux-wine'),em:'🍷',title:'Kirkland Bordeaux Supérieur 2022 — Case of 12',price:89.99,orig:143.88,off:37,votes:1876,time:'3h ago',comments:345,tags:['hot'],ship:'In-Warehouse'},
{id:114,cat:'grocery',store:"Sam's Club",sc:S.sm,img:P('ny-strip'),em:'🥩',title:'Sam\'s: Whole Boneless NY Strip ~12 lbs',price:89.88,orig:129,off:30,votes:1234,time:'1h ago',comments:234,tags:['hot','fp'],ship:'In-Club'},
{id:115,cat:'grocery',store:"Sam's Club",sc:S.sm,img:P('cage-free-eggs'),em:'🥚',title:'Sam\'s: Cage-Free Large Eggs 5 Dozen',price:9.98,orig:16.48,off:39,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'In-Club'},
{id:116,cat:'grocery',store:"Sam's Club",sc:S.sm,img:P('rotisserie-sm'),em:'🍗',title:'Sam\'s: Rotisserie Chicken — Hot & Ready $4.98',price:4.98,orig:7.99,off:38,votes:6789,time:'30m ago',comments:1567,tags:['hot','fp'],ship:'In-Club'},
{id:117,cat:'grocery',store:'Walmart',sc:S.wm,img:P('butter-sticks'),em:'🧈',title:'Great Value Butter Sticks 4-Pack — Rollback',price:2.97,orig:4.98,off:40,votes:1234,time:'2h ago',comments:234,tags:['fp'],ship:'Pickup'},
{id:118,cat:'grocery',store:'Whole Foods',sc:S.wf,img:P('whole-foods'),em:'🥬',title:'Whole Foods: Prime Extra 10% Off Sale Items This Week',price:0,orig:0,off:10,votes:2345,time:'1h ago',comments:456,tags:['fp'],ship:'Prime Delivery'},
{id:119,cat:'grocery',store:'Trader Joe\'s',sc:S.tj,img:P('everything-bagel'),em:'🌸',title:'Trader Joe\'s: Everything But The Bagel Seasoning $2.49',price:2.49,orig:2.49,off:0,votes:5678,time:'1h ago',comments:1234,tags:['hot','fp'],ship:'In-Store'},
{id:120,cat:'grocery',store:'Sprouts',sc:S.sp,img:P('blueberries'),em:'🫐',title:'Sprouts: Organic Blueberries 1pt $1.98 — Wednesday Ad',price:1.98,orig:4.99,off:60,votes:1567,time:'2h ago',comments:312,tags:['hot'],ship:'In-Store'},
{id:121,cat:'grocery',store:'Amazon',sc:S.am,img:P('pb-pretzels'),em:'🥜',title:'Amazon: PB Filled Pretzels 24oz — Clip Coupon + S&S',price:4.19,orig:7.99,off:48,votes:1133,time:'1h ago',comments:234,tags:['hot'],ship:'Free Prime'},
{id:122,cat:'grocery',store:'Amazon',sc:S.am,img:P('charmin-bounty'),em:'🧻',title:'Charmin 30 Mega + Bounty 12 Rolls — $20 Credit',price:63,orig:89.99,off:30,votes:2345,time:'3h ago',comments:567,tags:['hot','fp'],ship:'Free Prime'},
{id:123,cat:'grocery',store:'Target',sc:S.tg,img:P('starbucks-kcup'),em:'☕',title:'Target: Starbucks K-Cup 44ct — Circle + RedCard Stack',price:19.99,orig:29.99,off:33,votes:987,time:'3h ago',comments:178,tags:['fp'],ship:'Free Ship $35+'},
{id:124,cat:'grocery',store:'Costco',sc:S.co,img:P('olive-oil-2l'),em:'🫒',title:'Kirkland Extra Virgin Olive Oil 2L — Italian',price:13.99,orig:19.99,off:30,votes:3456,time:'4h ago',comments:678,tags:['fp'],ship:'In-Warehouse'},
{id:125,cat:'grocery',store:'Costco',sc:S.co,img:P('costco-gas'),em:'⛽',title:'Costco Gas: ~$0.30/gal Less Than Competition — Members',price:0,orig:0,off:0,votes:8901,time:'Today',comments:2345,tags:['hot','fp'],ship:'Members Only'},
{id:126,cat:'grocery',store:'CVS',sc:'#cc0000',img:P('cvs-beauty'),em:'🧴',title:'CVS: Spend $30 Beauty, Get $10 ExtraBucks — Stacks',price:0,orig:0,off:33,votes:876,time:'3h ago',comments:156,tags:['fp'],ship:'Free Ship $35+'},
{id:127,cat:'grocery',store:'Walgreens',sc:'#e31837',img:P('vitamins'),em:'💊',title:'Walgreens: BOGO Free All Vitamins & Supplements',price:0,orig:0,off:50,votes:1234,time:'2h ago',comments:234,tags:['hot'],ship:'Free Pickup'},
// FASHION (25)
{id:200,cat:'fashion',store:'Nike',sc:S.nk,img:P('nike-airmax90'),em:'👟',title:'Nike Air Max 90 — Extra 30% Off Clearance w/ SAVE30',price:65,orig:130,off:50,votes:1934,time:'30m ago',comments:401,tags:['hot','fp'],ship:'Free on $50+'},
{id:201,cat:'fashion',store:'Adidas',sc:'#000',img:P('adidas-outlet'),em:'👟',title:'adidas End of Season: Extra 50% Off Outlet — EXTRA50',price:30,orig:100,off:70,votes:2345,time:'1h ago',comments:567,tags:['hot','fp'],ship:'Free Ship'},
{id:202,cat:'fashion',store:'Under Armour',sc:S.ua,img:P('ua-outlet'),em:'👕',title:'UA: Extra 50% Off Outlet + Extra 15% Sitewide — Stacks',price:16.98,orig:45,off:62,votes:734,time:'3h ago',comments:145,tags:['hot'],ship:'Free $99+'},
{id:203,cat:'fashion',store:'Columbia',sc:'#1b365d',img:P('columbia-jacket'),em:'🧥',title:'Columbia Voodoo Falls 590 TurboDown II Jacket — 2 Colors',price:39.98,orig:160,off:75,votes:987,time:'3h ago',comments:178,tags:['hot','fp'],ship:'Free Ship'},
{id:204,cat:'fashion',store:'Gap Factory',sc:'#000066',img:P('gap-jeans'),em:'👖',title:'Gap Factory: Extra 60% Off Clearance — Jeans from $9.60',price:9.60,orig:49.99,off:81,votes:1567,time:'4h ago',comments:312,tags:['hot'],ship:'Free $50+'},
{id:205,cat:'fashion',store:'The North Face',sc:'#000',img:P('northface-jacket'),em:'🧥',title:'North Face Aconcagua 3 Jacket — Ltd Sizes, 66% Off',price:74.98,orig:220,off:66,votes:623,time:'5h ago',comments:98,tags:['fp'],ship:'Free Ship'},
{id:206,cat:'fashion',store:'Nordstrom Rack',sc:'#000',img:P('nordstrom-rack'),em:'👠',title:'Nordstrom Rack: Clear the Rack Extra 25% Off Clearance',price:0,orig:0,off:25,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free $89+'},
{id:207,cat:'fashion',store:'Amazon',sc:S.am,img:P('hanes-hoodie'),em:'👕',title:'Hanes EcoSmart Full-Zip Hoodie — Lightning Deal $13',price:13,orig:27,off:52,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
{id:208,cat:'fashion',store:'Old Navy',sc:'#004b87',img:P('oldnavy-jeans'),em:'👖',title:'Old Navy: 50% Off All Jeans — Stacks w/ Super Cash',price:15,orig:34.99,off:57,votes:2345,time:'2h ago',comments:456,tags:['hot','fp'],ship:'Free $50+'},
{id:209,cat:'fashion',store:"Macy's",sc:'#e21a2c',img:P('macys-sale'),em:'👗',title:"Macy's: Extra 25% Off Sale — EXTRA25, Star Rewards Stack",price:0,orig:0,off:25,votes:987,time:'3h ago',comments:178,tags:['hot'],ship:'Free $25+'},
{id:210,cat:'fashion',store:'REI',sc:'#000',img:P('rei-outdoor'),em:'🏕️',title:'REI Anniversary Sale: Up to 40% Off + 20% Off Outlet',price:0,orig:0,off:40,votes:1876,time:'1h ago',comments:345,tags:['hot','fp'],ship:'Free $50+'},
{id:211,cat:'fashion',store:'Costco',sc:S.co,img:P('costco-glasses'),em:'👓',title:'Costco Optical: Frames + Lenses from $68 — Members',price:68,orig:200,off:66,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'In-Warehouse'},
{id:212,cat:'fashion',store:"Sam's Club",sc:S.sm,img:P('eddie-bauer'),em:'👖',title:'Eddie Bauer Fleece-Lined Pants 2-Pack — $19.98',price:19.98,orig:39.98,off:50,votes:1234,time:'8h ago',comments:234,tags:['fp'],ship:'Free for Plus'},
{id:213,cat:'fashion',store:'Puma',sc:'#000',img:P('puma-shoes'),em:'👟',title:'Puma Semi-Annual: Extra 30% Off Sale — From $20.99',price:20.99,orig:64.99,off:68,votes:876,time:'5h ago',comments:156,tags:['fp'],ship:'Free $50+'},
{id:214,cat:'fashion',store:'Amazon',sc:S.am,img:P('adidas-cloud'),em:'👟',title:'adidas Cloudfoam Go Running Shoes — Extra 30% Off',price:35,orig:75,off:53,votes:1234,time:'2h ago',comments:234,tags:['hot'],ship:'Free Prime'},
{id:215,cat:'fashion',store:'Target',sc:S.tg,img:P('target-shoes'),em:'👟',title:'Target: Running Shoes BOGO 50% Off — Circle Offer',price:34.99,orig:69.99,off:50,votes:567,time:'5h ago',comments:98,tags:['fp'],ship:'Free $35+'},
{id:216,cat:'fashion',store:"Sam's Club",sc:S.sm,img:P('skechers'),em:'👟',title:'Skechers Slip-In Sneakers — In-Club Only $34.98',price:34.98,orig:59.98,off:42,votes:1567,time:'3h ago',comments:312,tags:['hot'],ship:'In-Club'},
{id:217,cat:'fashion',store:'New Balance',sc:'#cf0a2c',img:P('nb-1080'),em:'👟',title:'NB Outlet: Fresh Foam 1080v14 — $67.49',price:67.49,orig:164.99,off:59,votes:1234,time:'2h ago',comments:234,tags:['fp'],ship:'Free $99+'},
{id:218,cat:'fashion',store:'Amazon',sc:S.am,img:P('boho-dress'),em:'👗',title:'Women\'s Boho Floral Maxi Dresses — Multiple Styles from $14+',price:14,orig:39.99,off:65,votes:2876,time:'1h ago',comments:534,tags:['hot','fp'],ship:'Free Prime'},
{id:219,cat:'fashion',store:'Amazon',sc:S.am,img:P('vneck-blouse'),em:'👚',title:'Women\'s V-Neck Blouse — Casual Work Tops, 15 Colors from $9+',price:9,orig:24.99,off:64,votes:1987,time:'2h ago',comments:345,tags:['hot'],ship:'Free Prime'},
{id:220,cat:'fashion',store:'Amazon',sc:S.am,img:P('2pc-outfit'),em:'👗',title:'Women\'s 2-Piece Outfit Sets — Matching Top & Pants from $12+',price:12,orig:35.99,off:67,votes:3456,time:'30m ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
{id:221,cat:'fashion',store:'Amazon',sc:S.am,img:P('mens-polo'),em:'👔',title:'Men\'s Textured Polos $9+ | Fleece Sweatpants $9+ — All Sizes',price:9,orig:29.99,off:70,votes:1567,time:'3h ago',comments:312,tags:['hot'],ship:'Free Prime'},
{id:222,cat:'fashion',store:'Amazon',sc:S.am,img:P('brand-handbag'),em:'👜',title:'Premium Brand Handbags from $45 — Crossbody, Tote & Shoulder',price:45,orig:129,off:65,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'Free Prime'},
{id:223,cat:'fashion',store:'Amazon',sc:S.am,img:P('satin-top'),em:'👚',title:'Women\'s Satin Tops $5-$7+ | Cotton Button Down Tops $5+',price:5,orig:18.99,off:74,votes:2345,time:'2h ago',comments:456,tags:['hot','fp'],ship:'Free Prime'},
{id:224,cat:'fashion',store:'Amazon',sc:S.am,img:P('cardigan'),em:'🧥',title:'Women\'s Short Sleeve Cardigans $7-$11+ — Open Front, All Colors',price:7,orig:22.99,off:70,votes:1876,time:'4h ago',comments:345,tags:['fp'],ship:'Free Prime'},
// FURNITURE & HOME (24)
{id:300,cat:'furniture',store:'West Elm',sc:'#2e4057',img:P('west-elm-sofa'),em:'🛋️',title:'West Elm Mid-Century Sofa — Warehouse + Extra 20%',price:799,orig:1799,off:56,votes:413,time:'8h ago',comments:119,tags:[],ship:'$99 Delivery'},
{id:301,cat:'furniture',store:'Wayfair',sc:'#7f187f',img:P('wayfair-sale'),em:'🛏️',title:'Wayfair Closeout: Up to 80% Off Furniture — Extra 10%',price:0,orig:0,off:80,votes:2345,time:'2h ago',comments:456,tags:['hot','fp'],ship:'Free Ship'},
{id:302,cat:'furniture',store:'IKEA',sc:'#0051ba',img:P('ikea-sofa'),em:'📦',title:'IKEA Family: 20% Off All Sofas & Storage',price:0,orig:0,off:20,votes:567,time:'3h ago',comments:89,tags:[],ship:'$5 Ship'},
{id:303,cat:'furniture',store:'Pottery Barn',sc:'#2c2c2c',img:P('pottery-barn'),em:'🛋️',title:'Pottery Barn Warehouse: Up to 70% Off Everything',price:0,orig:0,off:70,votes:456,time:'6h ago',comments:67,tags:['fp'],ship:'$99+ Del'},
{id:304,cat:'furniture',store:'Amazon',sc:S.am,img:P('beckham-pillows'),em:'🛏️',title:'Beckham Hotel Pillows Queen 2-Pack — 67% Off',price:16.49,orig:49.99,off:67,votes:8901,time:'2h ago',comments:2345,tags:['hot','fp'],ship:'Free Prime'},
{id:305,cat:'furniture',store:'Amazon',sc:S.am,img:P('govee-led'),em:'💡',title:'Govee LED Strip Lights 65.6ft — Wi-Fi, Music Sync',price:19.99,orig:39.99,off:50,votes:3456,time:'4h ago',comments:678,tags:['hot','fp'],ship:'Free Prime'},
{id:306,cat:'furniture',store:'Ashley',sc:'#6b4c3b',img:P('ashley-sofa'),em:'🛋️',title:'Ashley: Sofa & Loveseat Set — Presidents Day 40% Off',price:899,orig:1499,off:40,votes:1567,time:'1h ago',comments:312,tags:['hot','fp'],ship:'Free Delivery'},
{id:307,cat:'furniture',store:'Rooms To Go',sc:'#003366',img:P('rooms-bedroom'),em:'🛏️',title:'Rooms To Go: 5-Piece Queen Bedroom — Clearance',price:799,orig:1599,off:50,votes:987,time:'3h ago',comments:178,tags:['hot'],ship:'$99 Del'},
{id:308,cat:'furniture',store:'Costco',sc:S.co,img:P('kitchenaid'),em:'🍳',title:'KitchenAid Artisan 5-Qt Mixer — $80 Off All Colors',price:299.99,orig:379.99,off:21,votes:2345,time:'3h ago',comments:456,tags:['hot','fp'],ship:'Free Ship'},
{id:309,cat:'furniture',store:'Walmart',sc:S.wm,img:P('ninja-airfryer'),em:'🍳',title:'Ninja Foodi 6-in-1 XL 2-Basket Air Fryer',price:119,orig:179.99,off:34,votes:1567,time:'4h ago',comments:234,tags:['hot'],ship:'Free Ship'},
{id:310,cat:'furniture',store:'Amazon',sc:S.am,img:P('instant-pot'),em:'🍽️',title:'Instant Pot Duo 7-in-1 6qt Pressure Cooker',price:59,orig:89.95,off:34,votes:5678,time:'6h ago',comments:1234,tags:['fp'],ship:'Free Prime'},
{id:311,cat:'furniture',store:'Home Depot',sc:S.hd,img:P('ryobi-blower'),em:'🧰',title:'RYOBI 18V Cordless Leaf Blower + Battery — $54',price:54,orig:99,off:45,votes:1234,time:'1h ago',comments:234,tags:['hot'],ship:'Free Ship'},
{id:312,cat:'furniture',store:'Target',sc:S.tg,img:P('target-bedding'),em:'🛏️',title:'Target Circle: 30% Off All Bedding — Threshold + RedCard',price:0,orig:0,off:30,votes:1567,time:'30m ago',comments:345,tags:['hot','fp'],ship:'Free $35+'},
{id:313,cat:'furniture',store:'CB2',sc:'#000',img:P('cb2-lighting'),em:'💡',title:'CB2: Up to 60% Off Lighting, Decor & Wall Art',price:0,orig:0,off:60,votes:456,time:'5h ago',comments:89,tags:['fp'],ship:'Free $149+'},
{id:314,cat:'furniture',store:'Costco',sc:S.co,img:P('traeger-grill'),em:'🔥',title:'Traeger Ironwood 650 Pellet Grill — $200 Off',price:1199,orig:1399.99,off:14,votes:987,time:'5h ago',comments:178,tags:['fp'],ship:'In-Warehouse'},
{id:315,cat:'furniture',store:"Sam's Club",sc:S.sm,img:P('serta-mattress'),em:'🛏️',title:'Serta Perfect Sleeper Queen Set — Free Delivery',price:499,orig:899,off:44,votes:876,time:'4h ago',comments:156,tags:['fp'],ship:'Free Del'},
{id:316,cat:'furniture',store:"Lowe's",sc:S.lo,img:P('craftsman-tool'),em:'🔨',title:"Lowe's: Craftsman 12V Air Inflator — Clearance",price:24.98,orig:54.98,off:55,votes:896,time:'18h ago',comments:67,tags:['fp'],ship:'Pickup'},
{id:317,cat:'furniture',store:'Amazon',sc:S.am,img:P('office-chair'),em:'🪑',title:'Amazon Basics PU Office Chair — 38% Off',price:74,orig:119.53,off:38,votes:1234,time:'6h ago',comments:234,tags:[],ship:'Free Ship'},
{id:318,cat:'furniture',store:'Costco',sc:S.co,img:P('lg-washtower'),em:'🧊',title:'LG WashTower — $400 Off + Free Install',price:1699,orig:2099,off:19,votes:876,time:'2h ago',comments:156,tags:['fp'],ship:'Free Install'},
{id:319,cat:'furniture',store:'Wayfair',sc:'#7f187f',img:P('dining-furn'),em:'🪑',title:'Clearance: Kitchen & Dining Furniture — Up to 84% Off',price:0,orig:0,off:84,votes:3456,time:'1h ago',comments:678,tags:['hot','fp'],ship:'Free Ship'},
{id:320,cat:'furniture',store:'Wayfair',sc:'#7f187f',img:P('living-room'),em:'🛋️',title:'Clearance: Living Room Seating Up to 87% Off | Pantry 81% Off',price:0,orig:0,off:87,votes:2345,time:'2h ago',comments:456,tags:['hot','fp'],ship:'Free Ship'},
{id:321,cat:'furniture',store:'Amazon',sc:S.am,img:P('boho-throw'),em:'🧶',title:'100% Cotton Boho Throws & Blankets from $13+ (Reg $22+)',price:13,orig:22,off:41,votes:1876,time:'3h ago',comments:345,tags:['fp'],ship:'Free Prime'},
{id:322,cat:'furniture',store:'Amazon',sc:S.am,img:P('storage-bags'),em:'👕',title:'6-Pack Clothes Storage Bags $8 | 7-Piece Bedding Set $25+',price:8,orig:24.99,off:68,votes:1567,time:'2h ago',comments:312,tags:['hot'],ship:'Free Prime'},
{id:323,cat:'furniture',store:'Amazon',sc:S.am,img:P('cleaning-set'),em:'🧹',title:'Toilet Cleaning Brush Set $5 | 10 Wooden Hangers $9 | Vanity Tray $5',price:5,orig:16.99,off:71,votes:987,time:'4h ago',comments:178,tags:[],ship:'Free Prime'},
// RESTAURANTS (15)
{id:400,cat:'restaurant',store:'Chipotle',sc:'#a81612',img:P('chipotle-bowl'),em:'🌯',title:'Chipotle: BOGO Free Entrée — CHIPBOGO in App',price:0,orig:12.5,off:100,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'App order'},
{id:401,cat:'restaurant',store:'Chick-fil-A',sc:'#e51636',img:P('chickfila-nugs'),em:'🐔',title:'Chick-fil-A: Free 8-Count Nuggets w/ Any Purchase',price:0,orig:5.95,off:100,votes:6789,time:'1h ago',comments:1567,tags:['hot','fp'],ship:'App required'},
{id:402,cat:'restaurant',store:'Starbucks',sc:'#00704A',img:P('starbucks-cup'),em:'☕',title:'Starbucks Happy Hour: 50% Off Drinks (Today 2–7 PM)',price:0,orig:7.25,off:50,votes:5678,time:'3h ago',comments:1234,tags:['hot','fp'],ship:'In-store'},
{id:403,cat:'restaurant',store:"McDonald's",sc:'#ffc72c',img:P('mcdonalds-fries'),em:'🍟',title:"McDonald's: Free Fries w/ $1+ Purchase — Fridays",price:0,orig:4.29,off:100,votes:2345,time:'2h ago',comments:456,tags:['hot'],ship:'App'},
{id:404,cat:'restaurant',store:'Olive Garden',sc:'#5c7d2b',img:P('olive-garden'),em:'🍝',title:'Olive Garden: Never Ending Pasta Bowl — Unlimited',price:13.99,orig:22.99,off:39,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'Dine-in'},
{id:405,cat:'restaurant',store:'Taco Bell',sc:'#702082',img:P('tacobell-dlt'),em:'🌮',title:'Taco Bell: Free DLT — Every Tuesday, No Purchase',price:0,orig:2.19,off:100,votes:3456,time:'2h ago',comments:678,tags:['hot'],ship:'Drive-thru'},
{id:406,cat:'restaurant',store:"Domino's",sc:'#006491',img:P('dominos-pizza'),em:'🍕',title:"Domino's: Medium 2-Topping $6.99 — Carryout",price:6.99,orig:14.99,off:53,votes:2345,time:'5h ago',comments:456,tags:['fp'],ship:'Carryout'},
{id:407,cat:'restaurant',store:'Panera',sc:'#4a7729',img:P('panera-coffee'),em:'🥖',title:'Panera Sip Club: First Month Free — Unlimited Coffee',price:0,orig:14.99,off:100,votes:1876,time:'3h ago',comments:345,tags:['hot','fp'],ship:'In-store'},
{id:408,cat:'restaurant',store:"Wendy's",sc:'#e2203a',img:P('wendys-combo'),em:'🍔',title:"Wendy's: $3 Breakfast Combo in App — All Week",price:3,orig:7.49,off:60,votes:1234,time:'4h ago',comments:234,tags:['fp'],ship:'App'},
{id:409,cat:'restaurant',store:'BWW',sc:'#ffc322',img:P('bww-wings'),em:'🍗',title:'BWW: Half-Price Wings — Every Tuesday, Dine-in',price:0,orig:0,off:50,votes:3456,time:'2h ago',comments:678,tags:['hot','fp'],ship:'Dine-in'},
{id:410,cat:'restaurant',store:'Popeyes',sc:'#f15c22',img:P('popeyes-tend'),em:'🍗',title:'Popeyes: 5-Piece Tenders + Biscuit — App Deal',price:6.99,orig:12.49,off:44,votes:1567,time:'4h ago',comments:312,tags:['fp'],ship:'App'},
{id:411,cat:'restaurant',store:'IHOP',sc:'#003da5',img:P('ihop-pancakes'),em:'🥞',title:'IHOP: All You Can Eat Pancakes $5.99 w/ Combo',price:5.99,orig:12.99,off:54,votes:2345,time:'6h ago',comments:456,tags:['hot'],ship:'Dine-in'},
{id:412,cat:'restaurant',store:'Subway',sc:'#008c15',img:P('subway-foot'),em:'🥪',title:'Subway: Any Footlong $6.99 — Code FOOTLONG',price:6.99,orig:11.99,off:42,votes:1234,time:'7h ago',comments:234,tags:[],ship:'App'},
{id:413,cat:'restaurant',store:"Dunkin'",sc:'#ff671f',img:P('dunkin-iced'),em:'🍩',title:"Dunkin': Free Iced Coffee w/ $5 Purchase — App",price:0,orig:4.59,off:100,votes:1876,time:'3h ago',comments:345,tags:['fp'],ship:'App'},
{id:414,cat:'restaurant',store:"Carl's Jr.",sc:'#ffd700',img:P('carls-burger'),em:'🍔',title:"Carl's Jr.: Free Hangover Burger — App Today Only",price:0,orig:6.99,off:100,votes:3456,time:'30m ago',comments:567,tags:['hot','fp'],ship:'App'},
// HOTELS (5)
{id:500,cat:'hotel',store:'Multi-site',sc:S.ag,img:P('hyatt-maui'),em:'🏝️',title:'Hyatt Regency Maui — Ocean View Suite',price:189,orig:429,off:56,votes:288,time:'1h ago',comments:42,tags:['hot'],ship:'Free cancel',loc:'Maui, HI',dt:'Mar 15–22',stars:5,amen:['Pool','Spa','Beach'],prices:[{s:'Booking.com',p:189,a:'#'},{s:'Expedia',p:209,a:'#'},{s:'Hotels.com',p:215,a:'#'},{s:'Agoda',p:195,a:'#'},{s:'Kayak',p:199,a:'#'}]},
{id:501,cat:'hotel',store:'Multi-site',sc:S.ag,img:P('ritz-tahoe'),em:'🏔️',title:'Ritz-Carlton Lake Tahoe — Ski-in/Ski-out + Spa',price:279,orig:599,off:53,votes:234,time:'3h ago',comments:68,tags:['fp'],ship:'Free cancel',loc:'Lake Tahoe, CA',dt:'Feb 20–27',stars:5,amen:['Ski-in','Spa','Dining'],prices:[{s:'Booking.com',p:279,a:'#'},{s:'Hotels.com',p:289,a:'#'},{s:'Expedia',p:299,a:'#'},{s:'Agoda',p:285,a:'#'}]},
{id:502,cat:'hotel',store:'Multi-site',sc:S.ag,img:P('w-hotel-nyc'),em:'🌆',title:'W Hotel NYC — Upgrade + Late Checkout',price:159,orig:349,off:54,votes:401,time:'5h ago',comments:91,tags:['hot','fp'],ship:'Free cancel',loc:'New York, NY',dt:'Mar 1–5',stars:4,amen:['Rooftop','Fitness'],prices:[{s:'Expedia',p:159,a:'#'},{s:'Priceline',p:162,a:'#'},{s:'Agoda',p:165,a:'#'},{s:'Booking.com',p:169,a:'#'}]},
{id:503,cat:'hotel',store:'Multi-site',sc:S.ag,img:P('park-hyatt-tk'),em:'🏯',title:'Park Hyatt Tokyo — Club Lounge, Breakfast',price:380,orig:720,off:47,votes:198,time:'4h ago',comments:35,tags:[],ship:'Free cancel',loc:'Tokyo',dt:'Apr 20–27',stars:5,amen:['Club','Pool','Spa'],prices:[{s:'Agoda',p:380,a:'#'},{s:'Booking.com',p:395,a:'#'},{s:'Expedia',p:399,a:'#'}]},
{id:504,cat:'hotel',store:'Multi-site',sc:S.ag,img:P('4seasons-bora'),em:'🌴',title:'Four Seasons Bora Bora — Overwater Bungalow',price:899,orig:2100,off:57,votes:156,time:'2h ago',comments:28,tags:['hot'],ship:'Free cancel',loc:'Bora Bora',dt:'May 10–17',stars:5,amen:['Overwater','Pool','Diving'],prices:[{s:'Booking.com',p:899,a:'#'},{s:'Expedia',p:920,a:'#'},{s:'Agoda',p:910,a:'#'}]},
// FLIGHTS (6)
{id:600,cat:'travel',store:'Google Flights',sc:'#4285f4',img:P('dfw-tokyo'),em:'✈️',title:'Dallas/Fort Worth (DFW) → Tokyo Narita (NRT) — Nonstop RT, ANA Economy',price:589,orig:1200,off:51,votes:845,time:'20m ago',comments:167,tags:['hot'],ship:'Taxes incl',route:'DFW → NRT',airline:'ANA',dt:'Apr 10–24',prices:[{s:'Google Flights',p:589,a:'#'},{s:'Skyscanner',p:599,a:'#'},{s:'Kayak',p:612,a:'#'}]},
{id:601,cat:'travel',store:'Kayak',sc:'#ff690f',img:P('dfw-barcelona'),em:'🌍',title:'Dallas/Fort Worth (DFW) → Barcelona (BCN) — RT, Delta Economy Plus',price:398,orig:890,off:55,votes:634,time:'1h ago',comments:105,tags:['fp'],ship:'Taxes incl',route:'DFW → BCN',airline:'Delta',dt:'May 1–15',prices:[{s:'Kayak',p:398,a:'#'},{s:'Google Flights',p:405,a:'#'},{s:'Expedia',p:435,a:'#'}]},
{id:602,cat:'travel',store:'Southwest',sc:'#304cb2',img:P('dfw-cancun'),em:'🏖️',title:'Dallas/Fort Worth (DFW) → Cancún (CUN) — Direct RT, 2 Free Checked Bags',price:198,orig:420,off:53,votes:967,time:'3h ago',comments:189,tags:['hot','fp'],ship:'Bags fly free',route:'DFW → CUN',airline:'Southwest',dt:'Mar 8–15',prices:[{s:'Southwest.com',p:198,a:'#'},{s:'Google Flights',p:198,a:'#'},{s:'Kayak',p:205,a:'#'}]},
{id:603,cat:'travel',store:'Google Flights',sc:'#4285f4',img:P('dfw-london'),em:'🇬🇧',title:'Dallas/Fort Worth (DFW) → London Heathrow (LHR) — Nonstop RT, British Airways',price:445,orig:950,off:53,votes:512,time:'2h ago',comments:95,tags:[],ship:'Taxes incl',route:'DFW → LHR',airline:'British Airways',dt:'May 15–29',prices:[{s:'Google Flights',p:445,a:'#'},{s:'Skyscanner',p:452,a:'#'},{s:'Kayak',p:460,a:'#'}]},
{id:604,cat:'travel',store:'Booking.com',sc:'#003580',img:P('sfo-tahiti'),em:'🌏',title:'San Francisco (SFO) → Tahiti Faa\'a (PPT) — Nonstop RT, French Bee Basic',price:476,orig:725,off:34,votes:289,time:'6h ago',comments:45,tags:['fp'],ship:'Taxes incl',route:'SFO → PPT',airline:'French Bee',dt:'Nov–Dec',prices:[{s:'Booking.com',p:476,a:'#'},{s:'Google Flights',p:480,a:'#'}]},
{id:605,cat:'travel',store:'Google Flights',sc:'#4285f4',img:P('dfw-paris'),em:'🗼',title:'Dallas/Fort Worth (DFW) → Paris Charles de Gaulle (CDG) — Nonstop RT, American',price:479,orig:1050,off:54,votes:389,time:'4h ago',comments:67,tags:[],ship:'Taxes incl',route:'DFW → CDG',airline:'American Airlines',dt:'Jun 1–14',prices:[{s:'Google Flights',p:479,a:'#'},{s:'Kayak',p:490,a:'#'},{s:'Expedia',p:510,a:'#'}]},
// CRUISES (5)
{id:700,cat:'cruise',store:'Royal Caribbean',sc:'#0047ab',img:P('royal-carib'),em:'🚢',title:'7-Night Caribbean — Galveston → Cozumel, Roatan',price:499,orig:1099,off:55,votes:1076,time:'1h ago',comments:234,tags:['hot','fp'],ship:'Interior · All meals',prices:[{s:'Royal Caribbean',p:499,a:'#'},{s:'CruiseDirect',p:529,a:'#'},{s:'Costco Travel',p:515,a:'#'}]},
{id:701,cat:'cruise',store:'Carnival',sc:'#0028a8',img:P('carnival-ship'),em:'🛳️',title:'5-Night Bahamas — Galveston → Nassau',price:289,orig:649,off:55,votes:854,time:'2h ago',comments:198,tags:['hot'],ship:'Interior · Drink pkg',prices:[{s:'Carnival.com',p:289,a:'#'},{s:'Costco Travel',p:299,a:'#'},{s:'CruiseDirect',p:309,a:'#'}]},
{id:702,cat:'cruise',store:'Norwegian',sc:'#0b2545',img:P('norwegian-viva'),em:'🏝️',title:'7-Night Greek Isles — Rome → Santorini',price:899,orig:1899,off:53,votes:645,time:'3h ago',comments:107,tags:['fp'],ship:'Balcony · Free at Sea',prices:[{s:'Norwegian.com',p:899,a:'#'},{s:'Costco Travel',p:919,a:'#'},{s:'CruiseDirect',p:929,a:'#'}]},
{id:703,cat:'cruise',store:'MSC',sc:'#003b73',img:P('msc-seashore'),em:'⛵',title:'4-Night Mexico — Galveston → Progreso Flash Sale',price:199,orig:499,off:60,votes:989,time:'45m ago',comments:256,tags:['hot','fp'],ship:'Kids free',prices:[{s:'MSC',p:199,a:'#'},{s:'Costco Travel',p:209,a:'#'}]},
{id:704,cat:'cruise',store:'Celebrity',sc:'#1c1c3c',img:P('celebrity-edge'),em:'🍾',title:'10-Night Alaska — Seattle → Juneau, Skagway',price:1299,orig:2599,off:50,votes:545,time:'4h ago',comments:89,tags:[],ship:'Oceanview · Drinks+WiFi',prices:[{s:'Celebrity.com',p:1299,a:'#'},{s:'Costco Travel',p:1329,a:'#'},{s:'Expedia',p:1399,a:'#'}]},
// AIRBNB (6)
{id:800,cat:'airbnb',store:'Airbnb',sc:S.ab,img:P('tulum-villa'),em:'🏡',title:'Beachfront Villa Tulum — Pool, 4BR, Sleeps 8',price:185,orig:340,off:46,votes:767,time:'1h ago',comments:129,tags:['hot'],ship:'Superhost',loc:'Tulum, MX',stars:5,amen:['Pool','Beach','Kitchen']},
{id:801,cat:'airbnb',store:'Airbnb',sc:S.ab,img:P('smoky-cabin'),em:'🌲',title:'A-Frame Cabin Smoky Mts — Hot Tub, Views',price:129,orig:225,off:43,votes:1091,time:'2h ago',comments:234,tags:['hot','fp'],ship:'Superhost',loc:'Gatlinburg, TN',stars:5,amen:['Hot Tub','Fireplace','Views']},
{id:802,cat:'airbnb',store:'Vrbo',sc:S.vb,img:P('maui-condo'),em:'🏖️',title:'Oceanfront Condo Maui — Pool & Beach Access',price:210,orig:399,off:47,votes:623,time:'3h ago',comments:96,tags:[],ship:'Premier Host',loc:'Kihei, Maui',stars:4,amen:['Pool','Beach']},
{id:803,cat:'airbnb',store:'Airbnb',sc:S.ab,img:P('paris-flat'),em:'🗼',title:'Luxury Flat Paris — Eiffel Tower View',price:155,orig:280,off:45,votes:1323,time:'4h ago',comments:278,tags:['fp'],ship:'Superhost',loc:'Paris',stars:5,amen:['View','Kitchen','Metro']},
{id:804,cat:'airbnb',store:'Airbnb',sc:S.ab,img:P('bali-treehouse'),em:'🌺',title:'Treehouse Bali — Infinity Pool, Jungle',price:75,orig:160,off:53,votes:2234,time:'1h ago',comments:367,tags:['hot','fp'],ship:'Superhost',loc:'Ubud, Bali',stars:5,amen:['Pool','Jungle','Breakfast']},
{id:805,cat:'airbnb',store:'Vrbo',sc:S.vb,img:P('parkcity-chalet'),em:'🏔️',title:'Ski Chalet Park City — 5BR, Hot Tub, Ski-in',price:395,orig:750,off:47,votes:412,time:'5h ago',comments:65,tags:[],ship:'Premier Host',loc:'Park City, UT',stars:5,amen:['Ski-in','Hot Tub']},
// TRANSPORT (4)
{id:900,cat:'transport',store:'RentalCars',sc:'#f5a623',img:P('suv-rental'),em:'🚗',title:'Full-Size SUV Maui 7 Days — Free Cancel',price:189,orig:420,off:55,votes:223,time:'2h ago',comments:38,tags:[],ship:'Free cancel'},
{id:901,cat:'transport',store:'Rome2Rio',sc:'#3dc38d',img:P('japan-rail'),em:'🚄',title:'Japan Rail Pass 7-Day Unlimited Bullet Train',price:225,orig:320,off:30,votes:467,time:'5h ago',comments:74,tags:['fp'],ship:'Digital'},
{id:902,cat:'transport',store:'Bookaway',sc:'#2eb398',img:P('cancun-van'),em:'🚐',title:'Cancun Airport → Hotel Zone Private Van',price:28,orig:55,off:49,votes:645,time:'1h ago',comments:96,tags:['hot'],ship:'Instant'},
{id:903,cat:'transport',store:'GetTransfer',sc:'#4a90d9',img:P('bali-boat'),em:'⛴️',title:'Bali → Gili Islands Fast Boat + Pickup',price:19,orig:38,off:50,votes:734,time:'3h ago',comments:112,tags:[],ship:'Instant'},
// ACTIVITIES (6)
{id:950,cat:'activity',store:'Viator',sc:'#2b1160',img:P('liberty-tour'),em:'🗽',title:'NYC: Statue of Liberty Skip-the-Line Tour',price:44,orig:72,off:39,votes:2834,time:'1h ago',comments:413,tags:['hot'],ship:'4 hrs · ⭐ 4.8',loc:'New York'},
{id:951,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('louvre-tour'),em:'🎭',title:'Paris: Louvre Semi-Private, Mona Lisa Priority',price:52,orig:89,off:42,votes:3103,time:'2h ago',comments:389,tags:['fp'],ship:'2.5 hrs · ⭐ 4.9',loc:'Paris'},
{id:952,cat:'activity',store:'Viator',sc:'#2b1160',img:P('molokini-snork'),em:'🤿',title:'Maui: Molokini Snorkel — BBQ Lunch Included',price:89,orig:159,off:44,votes:1267,time:'3h ago',comments:198,tags:[],ship:'5 hrs · ⭐ 4.7',loc:'Maui'},
{id:953,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('tsukiji-tour'),em:'🏯',title:'Tokyo: Tsukiji Market + Sake & Street Food',price:65,orig:95,off:32,votes:923,time:'4h ago',comments:107,tags:[],ship:'3 hrs · ⭐ 4.9',loc:'Tokyo'},
{id:954,cat:'activity',store:'Viator',sc:'#2b1160',img:P('chichen-itza'),em:'🌋',title:'Cancun: Chichen Itza + Cenote + Lunch',price:59,orig:110,off:46,votes:2456,time:'2h ago',comments:356,tags:['hot','fp'],ship:'12 hrs · ⭐ 4.6',loc:'Cancun'},
{id:955,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('hp-studio'),em:'🎡',title:'London: Harry Potter Studio + Transport',price:89,orig:125,off:29,votes:4201,time:'5h ago',comments:512,tags:['fp'],ship:'7 hrs · ⭐ 4.9',loc:'London'},
{id:956,cat:'activity',store:'Viator',sc:'#2b1160',img:P('vegas-helicopter'),em:'🚁',title:'Las Vegas: Night Helicopter Strip Flight + Champagne',price:119,orig:229,off:48,votes:1893,time:'1h ago',comments:287,tags:['hot'],ship:'15 min · ⭐ 4.8',loc:'Las Vegas'},
{id:957,cat:'activity',store:'Klook',sc:'#ff6348',img:P('dubai-desert'),em:'🐪',title:'Dubai: Desert Safari — BBQ Dinner, Camel Ride, Shows',price:39,orig:89,off:56,votes:3421,time:'2h ago',comments:445,tags:['hot','fp'],ship:'6 hrs · ⭐ 4.7',loc:'Dubai'},
{id:958,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('rome-colosseum'),em:'🏛️',title:'Rome: Colosseum Underground + Arena Floor Tour',price:69,orig:120,off:43,votes:2876,time:'3h ago',comments:378,tags:['fp'],ship:'3 hrs · ⭐ 4.9',loc:'Rome'},
{id:959,cat:'activity',store:'Viator',sc:'#2b1160',img:P('bali-rice'),em:'🌴',title:'Bali: Ubud Rice Terrace, Waterfall + Monkey Forest',price:29,orig:65,off:55,votes:1567,time:'4h ago',comments:210,tags:['hot'],ship:'10 hrs · ⭐ 4.8',loc:'Bali'},
{id:8001,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('barcelona-sagrada'),em:'⛪',title:'Barcelona: Sagrada Familia Fast-Track + Audio Guide',price:47,orig:85,off:45,votes:3890,time:'1h ago',comments:498,tags:['hot','fp'],ship:'1.5 hrs · ⭐ 4.9',loc:'Barcelona'},
{id:8002,cat:'activity',store:'Viator',sc:'#2b1160',img:P('sf-alcatraz'),em:'🌉',title:'San Francisco: Alcatraz Island + City Cruise Combo',price:89,orig:145,off:39,votes:2134,time:'2h ago',comments:312,tags:['fp'],ship:'5 hrs · ⭐ 4.7',loc:'San Francisco'},
{id:8003,cat:'activity',store:'Klook',sc:'#ff6348',img:P('bangkok-temple'),em:'🛕',title:'Bangkok: Grand Palace + Wat Pho + Boat Tour',price:25,orig:55,off:55,votes:1890,time:'3h ago',comments:256,tags:['hot'],ship:'6 hrs · ⭐ 4.8',loc:'Bangkok'},
{id:8004,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('sydney-opera'),em:'🎭',title:'Sydney: Opera House Tour + Harbour Bridge Climb',price:149,orig:259,off:42,votes:1456,time:'1h ago',comments:198,tags:['fp'],ship:'4 hrs · ⭐ 4.9',loc:'Sydney'},
{id:8005,cat:'activity',store:'Viator',sc:'#2b1160',img:P('istanbul-hagia'),em:'🕌',title:'Istanbul: Hagia Sophia + Blue Mosque + Bazaar Walk',price:35,orig:70,off:50,votes:2345,time:'4h ago',comments:301,tags:['hot','fp'],ship:'5 hrs · ⭐ 4.8',loc:'Istanbul'},
{id:8006,cat:'activity',store:'Klook',sc:'#ff6348',img:P('singapore-zoo'),em:'🦁',title:'Singapore: Night Safari + Tram Ride + Fire Show',price:38,orig:55,off:31,votes:1678,time:'2h ago',comments:219,tags:[],ship:'4 hrs · ⭐ 4.7',loc:'Singapore'},
{id:8007,cat:'activity',store:'Viator',sc:'#2b1160',img:P('hawaii-luau'),em:'🌺',title:'Hawaii: Polynesian Luau + Fire Dance + Buffet',price:119,orig:195,off:39,votes:2901,time:'1h ago',comments:389,tags:['hot','fp'],ship:'4 hrs · ⭐ 4.8',loc:'Hawaii'},
{id:8008,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('amsterdam-canal'),em:'🚤',title:'Amsterdam: Canal Cruise + Heineken Experience',price:39,orig:72,off:46,votes:1234,time:'3h ago',comments:178,tags:['fp'],ship:'3 hrs · ⭐ 4.6',loc:'Amsterdam'},
{id:8009,cat:'activity',store:'Viator',sc:'#2b1160',img:P('dallas-jfk'),em:'🤠',title:'Dallas: JFK Sixth Floor + Cowboys Stadium Tour',price:55,orig:95,off:42,votes:987,time:'2h ago',comments:134,tags:[],ship:'5 hrs · ⭐ 4.5',loc:'Dallas'},
{id:8010,cat:'activity',store:'Klook',sc:'#ff6348',img:P('orlando-theme'),em:'🎢',title:'Orlando: Universal 2-Park Ticket — Express Pass Add-On',price:179,orig:289,off:38,votes:4567,time:'1h ago',comments:678,tags:['hot','fp'],ship:'All day · ⭐ 4.8',loc:'Orlando'},
{id:8011,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('miami-everglades'),em:'🐊',title:'Miami: Everglades Airboat Ride + Gator Show',price:29,orig:55,off:47,votes:1789,time:'4h ago',comments:234,tags:['hot'],ship:'4 hrs · ⭐ 4.6',loc:'Miami'},
{id:8012,cat:'activity',store:'Viator',sc:'#2b1160',img:P('chicago-arch'),em:'🏙️',title:'Chicago: Architecture River Cruise — First Lady Ship',price:49,orig:75,off:35,votes:3456,time:'2h ago',comments:456,tags:['fp'],ship:'1.5 hrs · ⭐ 4.9',loc:'Chicago'},
{id:8013,cat:'activity',store:'Klook',sc:'#ff6348',img:P('phuket-island'),em:'🏝️',title:'Phuket: Phi Phi + Maya Bay Speedboat — Lunch Included',price:35,orig:75,off:53,votes:2345,time:'3h ago',comments:312,tags:['hot','fp'],ship:'8 hrs · ⭐ 4.7',loc:'Phuket'},
{id:8014,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('athens-acropolis'),em:'🏛️',title:'Athens: Acropolis + Parthenon Skip-the-Line Guided Tour',price:42,orig:78,off:46,votes:1890,time:'1h ago',comments:245,tags:['fp'],ship:'2 hrs · ⭐ 4.8',loc:'Athens'},
{id:8015,cat:'activity',store:'Viator',sc:'#2b1160',img:P('la-hollywood'),em:'🎬',title:'Los Angeles: Hollywood Sign Hike + Griffith Observatory',price:39,orig:69,off:43,votes:2678,time:'2h ago',comments:345,tags:['hot'],ship:'3 hrs · ⭐ 4.7',loc:'Los Angeles'},
{id:8020,cat:'activity',store:'StubHub',sc:'#3b1e8e',img:P('msg-concert'),em:'🎤',title:'NYC: Madison Square Garden — Live Concert Tickets',price:65,orig:120,off:46,votes:3412,time:'1h ago',comments:456,tags:['hot','fp'],ship:'3 hrs · ⭐ 4.7',loc:'New York'},
{id:8021,cat:'activity',store:'SeatGeek',sc:'#2563eb',img:P('nba-game'),em:'🏀',title:'NBA: Lakers vs Celtics — Crypto.com Arena Floor Seats',price:149,orig:299,off:50,votes:4567,time:'30m ago',comments:678,tags:['hot','fp'],ship:'3 hrs · ⭐ 4.8',loc:'Los Angeles'},
{id:8022,cat:'activity',store:'StubHub',sc:'#3b1e8e',img:P('nfl-cowboys'),em:'🏈',title:'NFL: Dallas Cowboys at AT&T Stadium — Tailgate + Seats',price:95,orig:189,off:50,votes:3890,time:'1h ago',comments:534,tags:['hot','fp'],ship:'5 hrs · ⭐ 4.7',loc:'Dallas'},
{id:8023,cat:'activity',store:'Ticketmaster',sc:'#026cdf',img:P('vegas-concert'),em:'🎸',title:'Las Vegas Residency: Top Artists Live at MGM Grand',price:99,orig:199,off:50,votes:2345,time:'2h ago',comments:312,tags:['fp'],ship:'2 hrs · ⭐ 4.8',loc:'Las Vegas'},
{id:8024,cat:'activity',store:'SeatGeek',sc:'#2563eb',img:P('epl-match'),em:'⚽',title:'London: Premier League Match Day — VIP Experience',price:120,orig:250,off:52,votes:1890,time:'3h ago',comments:267,tags:['hot'],ship:'3 hrs · ⭐ 4.8',loc:'London'},
{id:8025,cat:'activity',store:'StubHub',sc:'#3b1e8e',img:P('ufc-vegas'),em:'🥊',title:'UFC Fight Night — T-Mobile Arena VIP Ringside',price:199,orig:399,off:50,votes:1567,time:'2h ago',comments:198,tags:['hot','fp'],ship:'5 hrs · ⭐ 4.9',loc:'Las Vegas'},
{id:8026,cat:'activity',store:'Ticketmaster',sc:'#026cdf',img:P('nashville-opry'),em:'🎵',title:'Nashville: Grand Ole Opry + Honky Tonk Bar Crawl',price:55,orig:95,off:42,votes:2901,time:'1h ago',comments:389,tags:['fp'],ship:'5 hrs · ⭐ 4.9',loc:'Nashville'},
{id:8027,cat:'activity',store:'StubHub',sc:'#3b1e8e',img:P('fcb-campnou'),em:'⚽',title:'Barcelona: FC Barcelona at Camp Nou — La Liga',price:99,orig:199,off:50,votes:3456,time:'2h ago',comments:445,tags:['hot','fp'],ship:'3 hrs · ⭐ 4.8',loc:'Barcelona'},
{id:8028,cat:'activity',store:'SeatGeek',sc:'#2563eb',img:P('cubs-wrigley'),em:'⚾',title:'Chicago: Cubs at Wrigley Field — Classic Ballpark',price:39,orig:79,off:51,votes:2134,time:'3h ago',comments:312,tags:['hot'],ship:'4 hrs · ⭐ 4.8',loc:'Chicago'},
{id:8029,cat:'activity',store:'Ticketmaster',sc:'#026cdf',img:P('f1-dubai'),em:'🏎️',title:'Dubai: F1 Abu Dhabi Grand Prix — Grandstand Tickets',price:299,orig:599,off:50,votes:1234,time:'4h ago',comments:178,tags:['fp'],ship:'Full day · ⭐ 4.9',loc:'Dubai'},
{id:8030,cat:'activity',store:'BookMyShow',sc:'#c4242d',img:P('hyd-charminar'),em:'🕌',title:'Hyderabad: Charminar + Laad Bazaar Heritage Walk',price:15,orig:30,off:50,votes:1456,time:'1h ago',comments:234,tags:['hot'],ship:'3 hrs · ⭐ 4.7',loc:'Hyderabad'},
{id:8031,cat:'activity',store:'BookMyShow',sc:'#c4242d',img:P('hyd-ipl'),em:'🏏',title:'Hyderabad: IPL Sunrisers — VIP Box at Rajiv Gandhi Intl',price:35,orig:70,off:50,votes:3456,time:'30m ago',comments:567,tags:['hot','fp'],ship:'4 hrs · ⭐ 4.8',loc:'Hyderabad'},
{id:8032,cat:'activity',store:'Thrillophilia',sc:'#ff6f00',img:P('hyd-ramoji'),em:'🎢',title:'Hyderabad: Ramoji Film City Full Day Pass',price:19,orig:40,off:52,votes:2345,time:'2h ago',comments:312,tags:['fp'],ship:'8 hrs · ⭐ 4.7',loc:'Hyderabad'},
{id:8033,cat:'activity',store:'BookMyShow',sc:'#c4242d',img:P('mumbai-ipl'),em:'🏏',title:'Mumbai: IPL Mumbai Indians — Wankhede Stadium',price:40,orig:80,off:50,votes:4567,time:'1h ago',comments:678,tags:['hot','fp'],ship:'4 hrs · ⭐ 4.8',loc:'Mumbai'},
{id:8034,cat:'activity',store:'Thrillophilia',sc:'#ff6f00',img:P('delhi-taj'),em:'🏰',title:'Delhi: Agra Day Trip — Taj Mahal Sunrise Tour',price:25,orig:50,off:50,votes:3890,time:'2h ago',comments:445,tags:['hot','fp'],ship:'12 hrs · ⭐ 4.9',loc:'Delhi'},
{id:8035,cat:'activity',store:'BookMyShow',sc:'#c4242d',img:P('blr-ipl'),em:'🏏',title:'Bangalore: IPL RCB — Chinnaswamy Stadium VIP',price:35,orig:70,off:50,votes:2901,time:'3h ago',comments:389,tags:['hot'],ship:'4 hrs · ⭐ 4.8',loc:'Bangalore'},
{id:8036,cat:'activity',store:'Thrillophilia',sc:'#ff6f00',img:P('goa-beach'),em:'🏖️',title:'Goa: Beach Hopping + Water Sports Full Day',price:15,orig:35,off:57,votes:1890,time:'2h ago',comments:256,tags:['hot','fp'],ship:'8 hrs · ⭐ 4.7',loc:'Goa'},
{id:960,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('rtx5070ti'),em:'🎮',title:'ASUS TUF Gaming GeForce RTX 5070 Ti 16GB GDDR7 — DLSS 4, PCIe 5.0',price:849,orig:899,off:6,votes:3456,time:'25m ago',comments:678,tags:['hot','fp'],ship:'Free Ship'},
{id:961,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('rx9070xt'),em:'🖥️',title:'ASRock Challenger Radeon RX 9070 XT 16GB — $50 Off, Black Friday Price Protection',price:599,orig:649,off:8,votes:2345,time:'1h ago',comments:456,tags:['hot','fp'],ship:'Free Ship'},
{id:962,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('msi-cyborg-17'),em:'💻',title:'MSI Cyborg 17" RTX 5060 — Intel Core 9 270H, 16GB DDR5, 1TB SSD, 144Hz IPS',price:1199,orig:1499,off:20,votes:1234,time:'30m ago',comments:234,tags:['hot','fp'],ship:'Free Ship'},
{id:963,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('asus-tuf-a16'),em:'💻',title:'ASUS TUF Gaming A16 RTX 5060 — Ryzen 7 260, 32GB DDR5, 1TB SSD, 165Hz',price:1299,orig:1599,off:19,votes:1890,time:'45m ago',comments:345,tags:['hot','fp'],ship:'Free Ship'},
{id:964,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('samsung-990evo'),em:'💾',title:'Samsung 990 EVO Plus 1TB NVMe M.2 SSD — PCIe 5.0, Up to 7,150 MB/s',price:89,orig:129,off:31,votes:4567,time:'1h ago',comments:890,tags:['hot','fp'],ship:'Free Ship'},
{id:965,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('samsung-ssd-4tb'),em:'💾',title:'Samsung 9100 PRO 4TB PCIe 5.0 NVMe SSD — 14,800 MB/s, AI & Gaming',price:399,orig:549,off:27,votes:678,time:'2h ago',comments:123,tags:['hot'],ship:'Free Ship'},
{id:966,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('gigabyte-monitor'),em:'🖥️',title:'GIGABYTE 27" QHD 1440p 180Hz IPS Monitor — FreeSync Premium, 1ms, HDR',price:159,orig:249,off:36,votes:2345,time:'1h ago',comments:456,tags:['hot','fp'],ship:'Free Ship'},
{id:967,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('corsair-rm750e'),em:'🔌',title:'Corsair RM750e (2025) Fully Modular PSU — ATX 3.1, PCIe 5.1, 80+ Gold',price:89,orig:109,off:18,votes:1290,time:'2h ago',comments:234,tags:['fp'],ship:'Free Ship'},
{id:968,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('amd-ryzen5-5500'),em:'🔲',title:'AMD Ryzen 5 5500 6-Core 3.6GHz Desktop CPU — Socket AM4, 65W',price:89,orig:159,off:44,votes:3456,time:'30m ago',comments:567,tags:['hot','fp'],ship:'Free Ship'},
{id:969,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('abs-gaming-pc'),em:'🖥️',title:'ABS Aquilon Aqua Gaming PC — i7-14700F, RTX 5060 Ti, 32GB DDR5, 1TB SSD',price:1299,orig:1599,off:19,votes:890,time:'1h ago',comments:167,tags:['hot','fp'],ship:'Free Ship'},
{id:970,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('gskill-ram'),em:'🧩',title:'G.SKILL Flare X5 32GB (2x16GB) DDR5 6000 — AMD EXPO, Desktop RAM',price:79,orig:119,off:34,votes:2345,time:'2h ago',comments:345,tags:['hot','fp'],ship:'Free Ship'},
{id:971,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('lenovo-legion-5i'),em:'💻',title:'Lenovo Legion 5i 16" RTX 5060 — i7-14700HX, 16GB, 512GB SSD, 165Hz OLED',price:1199,orig:1549,off:23,votes:1567,time:'45m ago',comments:289,tags:['hot','fp'],ship:'Free Ship'},
{id:972,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('msi-vector'),em:'💻',title:'MSI Vector 16" QHD+ RTX 5080 — LCD Display, 32GB DDR5, 1TB SSD',price:1999,orig:2499,off:20,votes:678,time:'1h ago',comments:123,tags:['hot'],ship:'Free Ship'},
{id:973,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('seagate-ironwolf'),em:'💽',title:'Seagate IronWolf 4TB NAS HDD — 5400 RPM, 256MB Cache, SATA 6Gb/s',price:79,orig:109,off:28,votes:1234,time:'3h ago',comments:234,tags:['fp'],ship:'Free Ship'},
{id:974,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('nzxt-kraken'),em:'❄️',title:'NZXT Kraken 240mm AIO Liquid Cooler — LCD Display, LGA 1851/1700/AM5',price:179,orig:229,off:22,votes:890,time:'2h ago',comments:156,tags:['fp'],ship:'Free Ship'},
{id:975,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('amd-r9-9950x3d'),em:'🔲',title:'AMD Ryzen 9 9950X3D 16-Core 4.3GHz — Zen 5, AM5, Best Gaming CPU',price:649,orig:749,off:13,votes:5678,time:'15m ago',comments:1234,tags:['hot','fp'],ship:'Free Ship'},
{id:976,cat:'retail',store:'Newegg',sc:'#d76b00',img:P('montech-case'),em:'🗄️',title:'MONTECH KING 95 PRO ATX Mid-Tower Case — 6 ARGB Fans, Tempered Glass',price:69,orig:99,off:30,votes:1567,time:'1h ago',comments:234,tags:['hot','fp'],ship:'Free Ship'},
// ===== MORE FLIGHTS =====
{id:1800,cat:'travel',store:'Google Flights',sc:'#4285f4',img:P('flight-dfw-lax'),em:'✈️',title:'DFW → LAX Nonstop — American Airlines',price:89,orig:249,off:64,votes:1890,time:'20m ago',comments:312,tags:['hot','fp'],ship:'Round trip',route:'DFW → LAX',airline:'American',dt:'Mar 15-22',stops:0,prices:[{s:'Google Flights',p:89,a:'#'},{s:'Kayak',p:95,a:'#'},{s:'Expedia',p:99,a:'#'},{s:'Skyscanner',p:92,a:'#'}]},
{id:1801,cat:'travel',store:'Kayak',sc:'#ff690f',img:P('flight-dfw-nyc'),em:'🗽',title:'DFW → JFK Nonstop — Delta Airlines',price:129,orig:389,off:67,votes:1654,time:'35m ago',comments:267,tags:['hot','fp'],ship:'Round trip',route:'DFW → JFK',airline:'Delta',dt:'Apr 1-8',stops:0,prices:[{s:'Kayak',p:129,a:'#'},{s:'Google Flights',p:135,a:'#'},{s:'Expedia',p:142,a:'#'},{s:'Skyscanner',p:131,a:'#'}]},
{id:1802,cat:'travel',store:'Skyscanner',sc:'#0770e3',img:P('flight-cancun'),em:'🏖️',title:'DFW → CUN Cancun — Spirit Airlines Flash Sale',price:69,orig:299,off:77,votes:2340,time:'15m ago',comments:489,tags:['hot','fp'],ship:'Round trip',route:'DFW → CUN',airline:'Spirit',dt:'Mar 20-27',stops:0,prices:[{s:'Skyscanner',p:69,a:'#'},{s:'Google Flights',p:75,a:'#'},{s:'Kayak',p:79,a:'#'},{s:'WayAway',p:72,a:'#'}]},
{id:1803,cat:'travel',store:'Google Flights',sc:'#4285f4',img:P('flight-london'),em:'🇬🇧',title:'DFW → LHR London — British Airways',price:349,orig:899,off:61,votes:987,time:'1h ago',comments:156,tags:['fp'],ship:'Round trip',route:'DFW → LHR',airline:'British Airways',dt:'May 5-15',stops:0,prices:[{s:'Google Flights',p:349,a:'#'},{s:'Skyscanner',p:365,a:'#'},{s:'Expedia',p:379,a:'#'},{s:'Kayak',p:355,a:'#'}]},
{id:1804,cat:'travel',store:'WayAway',sc:'#6c5ce7',img:P('flight-paris'),em:'🇫🇷',title:'DFW → CDG Paris — Air France Error Fare',price:279,orig:1099,off:75,votes:3210,time:'5m ago',comments:678,tags:['hot','fp'],ship:'Round trip',route:'DFW → CDG',airline:'Air France',dt:'Apr 10-20',stops:1,prices:[{s:'WayAway',p:279,a:'#'},{s:'Google Flights',p:289,a:'#'},{s:'Skyscanner',p:285,a:'#'},{s:'Kayak',p:295,a:'#'}]},
{id:1805,cat:'travel',store:'Kayak',sc:'#ff690f',img:P('flight-tokyo'),em:'🇯🇵',title:'DFW → NRT Tokyo — ANA Sale',price:499,orig:1399,off:64,votes:1456,time:'45m ago',comments:234,tags:['hot'],ship:'Round trip',route:'DFW → NRT',airline:'ANA',dt:'May 1-14',stops:1,prices:[{s:'Kayak',p:499,a:'#'},{s:'Google Flights',p:515,a:'#'},{s:'Expedia',p:529,a:'#'},{s:'Skyscanner',p:505,a:'#'}]},
{id:806,cat:'travel',store:'Skyscanner',sc:'#0770e3',img:P('flight-miami'),em:'🌴',title:'DFW → MIA Miami — Frontier $49 Sale',price:49,orig:179,off:73,votes:1876,time:'10m ago',comments:345,tags:['hot','fp'],ship:'One way',route:'DFW → MIA',airline:'Frontier',dt:'Mar–May',stops:0,prices:[{s:'Skyscanner',p:49,a:'#'},{s:'Google Flights',p:55,a:'#'},{s:'Kayak',p:52,a:'#'}]},
{id:807,cat:'travel',store:'Google Flights',sc:'#4285f4',img:P('flight-hawaii'),em:'🌺',title:'DFW → HNL Honolulu — Hawaiian Airlines',price:299,orig:749,off:60,votes:1234,time:'2h ago',comments:198,tags:['fp'],ship:'Round trip',route:'DFW → HNL',airline:'Hawaiian',dt:'Jun 1-10',stops:1,prices:[{s:'Google Flights',p:299,a:'#'},{s:'Expedia',p:315,a:'#'},{s:'Kayak',p:309,a:'#'},{s:'Skyscanner',p:305,a:'#'}]},
{id:808,cat:'travel',store:'Expedia',sc:'#00355f',img:P('flight-denver'),em:'⛷️',title:'DFW → DEN Denver — United Airlines',price:79,orig:219,off:64,votes:876,time:'3h ago',comments:112,tags:[],ship:'Round trip',route:'DFW → DEN',airline:'United',dt:'Mar 8-12',stops:0,prices:[{s:'Expedia',p:79,a:'#'},{s:'Google Flights',p:85,a:'#'},{s:'Kayak',p:82,a:'#'}]},
{id:809,cat:'travel',store:'WayAway',sc:'#6c5ce7',img:P('flight-barcelona'),em:'🇪🇸',title:'DFW → BCN Barcelona — Iberia Sale',price:329,orig:999,off:67,votes:1567,time:'1h ago',comments:267,tags:['hot','fp'],ship:'Round trip',route:'DFW → BCN',airline:'Iberia',dt:'Apr 18-28',stops:1,prices:[{s:'WayAway',p:329,a:'#'},{s:'Google Flights',p:345,a:'#'},{s:'Skyscanner',p:339,a:'#'},{s:'Kayak',p:349,a:'#'}]},
// ===== MORE HOTELS =====
{id:810,cat:'hotel',store:'Booking.com',sc:'#003580',img:P('hotel-vegas'),em:'🎰',title:'Bellagio Las Vegas — Fountain View Room',price:119,orig:329,off:64,votes:1789,time:'30m ago',comments:345,tags:['hot','fp'],ship:'Free cancel',loc:'Las Vegas, NV',dt:'Mar 20-23',stars:5,amen:['Pool','Spa','Casino'],prices:[{s:'Booking.com',p:119,a:'#'},{s:'Hotels.com',p:129,a:'#'},{s:'Expedia',p:135,a:'#'},{s:'Priceline',p:125,a:'#'},{s:'Kayak',p:122,a:'#'}]},
{id:811,cat:'hotel',store:'Hotels.com',sc:'#d32f2f',img:P('hotel-chicago'),em:'🏙️',title:'The Drake Hotel Chicago — Lakeview Suite',price:159,orig:399,off:60,votes:1023,time:'1h ago',comments:187,tags:['fp'],ship:'Free cancel',loc:'Chicago, IL',dt:'Apr 5-9',stars:5,amen:['Lake View','Dining','Fitness'],prices:[{s:'Hotels.com',p:159,a:'#'},{s:'Booking.com',p:165,a:'#'},{s:'Expedia',p:175,a:'#'},{s:'Agoda',p:162,a:'#'}]},
{id:812,cat:'hotel',store:'Expedia',sc:'#00355f',img:P('hotel-orlando'),em:'🏰',title:'Disney Swan Resort — Theme Park View',price:129,orig:349,off:63,votes:2345,time:'45m ago',comments:456,tags:['hot','fp'],ship:'Free cancel',loc:'Orlando, FL',dt:'Mar 15-20',stars:4,amen:['Pool','Shuttle','Beach'],prices:[{s:'Expedia',p:129,a:'#'},{s:'Hotels.com',p:139,a:'#'},{s:'Booking.com',p:145,a:'#'},{s:'Priceline',p:132,a:'#'}]},
{id:813,cat:'hotel',store:'Priceline',sc:'#0e4cb3',img:P('hotel-sanfran'),em:'🌉',title:'Fairmont San Francisco — Express Deal',price:109,orig:299,off:64,votes:876,time:'2h ago',comments:134,tags:['hot'],ship:'Free cancel',loc:'San Francisco, CA',dt:'Apr 1-5',stars:4,amen:['Rooftop','Fitness','Downtown'],prices:[{s:'Priceline',p:109,a:'#'},{s:'Booking.com',p:125,a:'#'},{s:'Expedia',p:129,a:'#'},{s:'Hotels.com',p:119,a:'#'}]},
{id:814,cat:'hotel',store:'Agoda',sc:'#5542f6',img:P('hotel-bali'),em:'🌿',title:'AYANA Resort Bali — Cliffside Pool Villa',price:199,orig:599,off:67,votes:1567,time:'1h ago',comments:289,tags:['hot','fp'],ship:'Free cancel',loc:'Bali, Indonesia',dt:'May 1-8',stars:5,amen:['Infinity Pool','Spa','Beach'],prices:[{s:'Agoda',p:199,a:'#'},{s:'Booking.com',p:219,a:'#'},{s:'Expedia',p:229,a:'#'},{s:'Hotels.com',p:225,a:'#'}]},
{id:815,cat:'hotel',store:'Booking.com',sc:'#003580',img:P('hotel-miami'),em:'🌊',title:'Fontainebleau Miami Beach — Ocean Front',price:179,orig:449,off:60,votes:1234,time:'3h ago',comments:198,tags:['fp'],ship:'Free cancel',loc:'Miami Beach, FL',dt:'Apr 10-14',stars:5,amen:['Beach','Pool','Nightlife'],prices:[{s:'Booking.com',p:179,a:'#'},{s:'Hotels.com',p:189,a:'#'},{s:'Expedia',p:195,a:'#'},{s:'Agoda',p:185,a:'#'}]},
// ===== MORE CRUISES =====
{id:820,cat:'cruise',store:'Princess',sc:'#1a4789',img:P('princess-alaska'),em:'🏔️',title:'7-Night Alaska Inside Passage — Seattle → Juneau',price:599,orig:1499,off:60,votes:1123,time:'1h ago',comments:198,tags:['hot','fp'],ship:'Balcony · All meals',prices:[{s:'Princess',p:599,a:'#'},{s:'CruiseDirect',p:629,a:'#'},{s:'Costco Travel',p:615,a:'#'},{s:'Expedia',p:649,a:'#'}]},
{id:821,cat:'cruise',store:'Royal Caribbean',sc:'#0047ab',img:P('royal-bermuda'),em:'🏝️',title:'5-Night Bermuda — Cape Liberty → King\'s Wharf',price:399,orig:899,off:56,votes:987,time:'2h ago',comments:156,tags:['hot'],ship:'Interior · WiFi pkg',prices:[{s:'Royal Caribbean',p:399,a:'#'},{s:'CruiseDirect',p:419,a:'#'},{s:'Costco Travel',p:409,a:'#'}]},
{id:822,cat:'cruise',store:'Disney Cruise',sc:'#1a1a6c',img:P('disney-cruise'),em:'✨',title:'4-Night Bahamas — Port Canaveral → Castaway Cay',price:449,orig:1199,off:63,votes:2456,time:'30m ago',comments:567,tags:['hot','fp'],ship:'Oceanview · Kids free',prices:[{s:'Disney Cruise Line',p:449,a:'#'},{s:'Costco Travel',p:459,a:'#'},{s:'CruiseDirect',p:469,a:'#'}]},
{id:823,cat:'cruise',store:'Norwegian',sc:'#0b2545',img:P('ncl-hawaii'),em:'🌺',title:'7-Night Hawaii Inter-Island — Honolulu Roundtrip',price:799,orig:1899,off:58,votes:876,time:'3h ago',comments:145,tags:['fp'],ship:'Balcony · Free at Sea',prices:[{s:'Norwegian',p:799,a:'#'},{s:'CruiseDirect',p:829,a:'#'},{s:'Expedia Cruises',p:849,a:'#'}]},
{id:824,cat:'cruise',store:'Carnival',sc:'#0028a8',img:P('carnival-mexico'),em:'🇲🇽',title:'3-Night Weekend Getaway — Galveston → Cozumel',price:159,orig:399,off:60,votes:1890,time:'15m ago',comments:389,tags:['hot','fp'],ship:'Interior · Drink deal',prices:[{s:'Carnival',p:159,a:'#'},{s:'CruiseDirect',p:169,a:'#'},{s:'Costco Travel',p:165,a:'#'}]},
// ===== MORE AIRBNB =====
{id:830,cat:'airbnb',store:'Airbnb',sc:'#ff385c',img:P('airbnb-cabin'),em:'🏔️',title:'Luxury A-Frame Cabin — Hot Tub, Mountain Views, Stargazing',price:89,orig:219,off:59,votes:1567,time:'1h ago',comments:289,tags:['hot','fp'],ship:'Superhost',loc:'Broken Bow, OK',dt:'Mar–May',stars:5,amen:['Hot Tub','Fireplace','WiFi'],prices:[{s:'Airbnb',p:89,a:'#'},{s:'Vrbo',p:99,a:'#'},{s:'Booking.com',p:109,a:'#'}]},
{id:831,cat:'airbnb',store:'Vrbo',sc:'#3662d8',img:P('vrbo-beach'),em:'🏖️',title:'Beachfront Condo — Gulf Views, Pool, Sleeps 8',price:149,orig:349,off:57,votes:1234,time:'2h ago',comments:198,tags:['hot'],ship:'Entire place',loc:'Destin, FL',dt:'Apr–Jun',stars:5,amen:['Beach','Pool','Kitchen'],prices:[{s:'Vrbo',p:149,a:'#'},{s:'Airbnb',p:159,a:'#'},{s:'Booking.com',p:169,a:'#'}]},
{id:832,cat:'airbnb',store:'Airbnb',sc:'#ff385c',img:P('airbnb-treehouse'),em:'🌲',title:'Treehouse Retreat — Secluded, Creek Views, King Bed',price:129,orig:279,off:54,votes:2345,time:'45m ago',comments:456,tags:['hot','fp'],ship:'Superhost',loc:'Fredericksburg, TX',dt:'Mar–Jun',stars:5,amen:['Treehouse','Nature','Privacy'],prices:[{s:'Airbnb',p:129,a:'#'},{s:'Vrbo',p:139,a:'#'}]},
{id:833,cat:'airbnb',store:'Booking.com',sc:'#003580',img:P('bnb-lake'),em:'🛶',title:'Lakefront Lodge — Kayaks, Fire Pit, Private Dock',price:179,orig:399,off:55,votes:987,time:'3h ago',comments:167,tags:['fp'],ship:'Entire place',loc:'Lake Travis, TX',dt:'Apr–Jul',stars:5,amen:['Lake','Kayaks','Fire Pit'],prices:[{s:'Booking.com',p:179,a:'#'},{s:'Airbnb',p:189,a:'#'},{s:'Vrbo',p:195,a:'#'}]},
{id:834,cat:'airbnb',store:'Vrbo',sc:'#3662d8',img:P('vrbo-ski'),em:'⛷️',title:'Ski Chalet — Walk to Lifts, Hot Tub, Sleeps 10',price:199,orig:499,off:60,votes:1456,time:'1h ago',comments:234,tags:['hot'],ship:'Entire place',loc:'Park City, UT',dt:'Mar–Apr',stars:5,amen:['Ski-in','Hot Tub','Fireplace'],prices:[{s:'Vrbo',p:199,a:'#'},{s:'Airbnb',p:219,a:'#'},{s:'Booking.com',p:229,a:'#'}]},
// ===== MORE ACTIVITIES =====
{id:840,cat:'activity',store:'GetYourGuide',sc:'#ff5533',img:P('activity-disney'),em:'🎢',title:'Walt Disney World — 4-Park Magic Ticket, 4 Days',price:89,orig:159,off:44,votes:3456,time:'30m ago',comments:567,tags:['hot','fp'],ship:'E-ticket',prices:[{s:'GetYourGuide',p:89,a:'#'},{s:'Undercover Tourist',p:95,a:'#'},{s:'Klook',p:92,a:'#'}]},
{id:841,cat:'activity',store:'Viator',sc:'#2f855a',img:P('activity-canyon'),em:'🏜️',title:'Grand Canyon Helicopter Tour + Landing — Las Vegas',price:199,orig:449,off:56,votes:1234,time:'1h ago',comments:234,tags:['hot','fp'],ship:'Instant confirm',prices:[{s:'Viator',p:199,a:'#'},{s:'GetYourGuide',p:219,a:'#'},{s:'Klook',p:209,a:'#'}]},
{id:842,cat:'activity',store:'Klook',sc:'#ff6348',img:P('activity-snorkel'),em:'🤿',title:'Cancun Snorkeling + Catamaran — All Inclusive Drinks',price:49,orig:109,off:55,votes:876,time:'2h ago',comments:145,tags:['fp'],ship:'Free cancel',prices:[{s:'Klook',p:49,a:'#'},{s:'Viator',p:55,a:'#'},{s:'GetYourGuide',p:52,a:'#'}]},
];

const TABS=[
  {key:'all',icon:'🔥',label:'Frontpage'},
  {key:'hot',icon:'⚡',label:'Popular'},
  {key:'retail',icon:'🛒',label:'Retail'},
  {key:'grocery',icon:'🥬',label:'Grocery'},
  {key:'fashion',icon:'👗',label:'Fashion'},
  {key:'furniture',icon:'🏠',label:'Home'},
  {key:'restaurant',icon:'🍔',label:'Food'},
  {key:'hotel',icon:'🏨',label:'Hotels'},
  {key:'travel',icon:'✈️',label:'Flights'},
  {key:'cruise',icon:'🚢',label:'Cruises'},
  {key:'airbnb',icon:'🏡',label:'Airbnb'},
  {key:'transport',icon:'🚗',label:'Transport'},
  {key:'activity',icon:'🎫',label:'Activities'},
];
const SORTS=['Popular','Newest','Biggest Savings','Price Low','Price High'];


// ============================================
// REDESIGNED COMPONENTS — Premium Deal Hub UI
// ============================================

function ImgBox({src,em,alt}){
  return (
    <div style={{width:100,height:100,borderRadius:14,overflow:'hidden',flexShrink:0,position:'relative',boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
      <img src={src} alt={alt||''} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
      <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',fontSize:36,textShadow:'0 2px 16px rgba(0,0,0,0.4)',filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>{em||'📦'}</div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'50%',background:'linear-gradient(transparent,rgba(0,0,0,0.3))',borderRadius:'0 0 14px 14px'}}/>
    </div>
  );
}

function PriceRows({prices,unit}){
  if(!prices?.length)return null;
  const sorted=[...prices].sort((a,b)=>a.p-b.p);
  return(
    <div style={{marginTop:10,paddingTop:10,borderTop:'1px dashed rgba(0,0,0,0.08)'}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Price comparison</div>
      {sorted.map((p,i)=>(
        <div key={i} onClick={()=>window.open(p.a,'_blank')} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 10px',borderRadius:8,marginBottom:2,cursor:'pointer',background:i===0?'rgba(16,185,129,0.08)':'transparent',transition:'background 0.15s'}}
          onMouseEnter={e=>{if(i!==0)e.currentTarget.style.background='rgba(0,0,0,0.02)'}} onMouseLeave={e=>{if(i!==0)e.currentTarget.style.background='transparent'}}>
          <span style={{fontWeight:600,fontSize:12,color:'var(--text-secondary)',minWidth:100}}>{p.s}</span>
          <span style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,color:i===0?'var(--green)':'var(--text)'}}>${p.p}{unit}</span>
            {i===0&&<span style={{fontSize:8,fontWeight:800,background:'var(--green)',color:'#fff',padding:'2px 8px',borderRadius:20,textTransform:'uppercase',letterSpacing:0.5}}>Best</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function DealCard({d,onAlert,watching,idx}){
  const isH=d.cat==='hotel',isF=d.cat==='travel',isCr=d.cat==='cruise',isAb=d.cat==='airbnb',isR=d.cat==='restaurant';
  const unit=isH||isAb?'/night':isF||isCr?'/person':'';
  const hot=d.tags.includes('hot'),isFree=d.price===0;
  return(
    <div className="deal-card" style={{display:'flex',gap:14,padding:16,background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,transition:'all .25s cubic-bezier(.4,0,.2,1)',cursor:'pointer',position:'relative',overflow:'hidden',animationDelay:`${(idx||0)*30}ms`}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.08)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
      {hot&&<div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:'linear-gradient(180deg,#ff4444,#ff8800)',borderRadius:'3px 0 0 3px'}}/>}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,minWidth:44,flexShrink:0,paddingTop:4}}>
        <button className="vote-btn" style={{width:30,height:24,display:'grid',placeItems:'center',background:'transparent',border:'1px solid var(--border)',borderRadius:6,cursor:'pointer',fontSize:11,color:'var(--muted)',transition:'all .15s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--accent-light)';e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)'}}>▲</button>
        <span style={{fontWeight:800,fontSize:15,color:'var(--accent)',fontFamily:'var(--font-display)'}}>{d.votes>=1000?(d.votes/1000).toFixed(1)+'k':d.votes}</span>
      </div>
      <ImgBox src={d.img} em={d.em} alt={d.title}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:d.sc,display:'inline-block',boxShadow:`0 0 6px ${d.sc}40`}}></span>
          <span style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{d.store}</span>
          {hot&&<span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'linear-gradient(135deg,#ff4444,#ff8800)',color:'#fff',textTransform:'uppercase',letterSpacing:0.3}}>Hot</span>}
          {d.tags.includes('fp')&&<span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'linear-gradient(135deg,#f59e0b,#f97316)',color:'#fff'}}>Featured</span>}
        </div>
        <div style={{fontSize:14,fontWeight:700,lineHeight:1.45,marginBottom:8,color:'var(--text)',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',letterSpacing:'-0.01em'}}>{d.title}</div>
        {(isH||isAb)&&d.loc&&(
          <div style={{marginBottom:6}}>
            <span style={{fontSize:11,color:'#f59e0b'}}>{'★'.repeat(d.stars||4)}</span>
            <span style={{fontSize:11,color:'var(--muted)',marginLeft:6}}>📍 {d.loc}{d.dt?` · ${d.dt}`:''}</span>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>
              {(d.amen||[]).map((a,i)=><span key={i} style={{fontSize:9,color:'var(--muted)',background:'var(--bg)',padding:'3px 8px',borderRadius:20,fontWeight:500}}>{a}</span>)}
            </div>
          </div>
        )}
        {isF&&d.route&&(
          <div style={{display:'flex',alignItems:'center',gap:6,margin:'6px 0',padding:'8px 14px',background:'linear-gradient(135deg,rgba(26,115,232,0.06),rgba(26,115,232,0.02))',borderRadius:10,border:'1px solid rgba(26,115,232,0.1)'}}>
            <span style={{fontWeight:800,fontSize:13,color:'var(--accent)',background:'#fff',padding:'3px 10px',borderRadius:6,border:'1px solid rgba(26,115,232,0.15)',fontFamily:'var(--font-mono)',letterSpacing:1}}>{d.route.split('→')[0]?.trim()}</span>
            <span style={{color:'var(--muted)',fontSize:16}}>✈️</span>
            <span style={{fontWeight:800,fontSize:13,color:'var(--accent)',background:'#fff',padding:'3px 10px',borderRadius:6,border:'1px solid rgba(26,115,232,0.15)',fontFamily:'var(--font-mono)',letterSpacing:1}}>{d.route.split('→')[1]?.trim()}</span>
            <span style={{fontSize:11,color:'var(--muted)',marginLeft:2}}>{d.airline}</span>
            {(d.stops===0||!d.stops)&&<span style={{fontSize:9,fontWeight:700,color:'var(--green)',background:'rgba(16,185,129,0.1)',padding:'2px 8px',borderRadius:20}}>Nonstop</span>}
          </div>
        )}
        <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap',marginTop:2}}>
          {isFree?(
            <>
              <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:22,background:'linear-gradient(135deg,var(--green),#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>FREE</span>
              {d.orig>0&&<span style={{fontSize:13,color:'var(--muted)',textDecoration:'line-through'}}>${d.orig}</span>}
              <span style={{fontSize:10,fontWeight:800,color:'#ef4444',background:'rgba(239,68,68,0.08)',padding:'3px 8px',borderRadius:20}}>100% OFF</span>
            </>
          ):d.price>0?(
            <>
              <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:22,color:'var(--green)'}}>${d.price}<span style={{fontSize:12,fontWeight:500,color:'var(--muted)'}}>{unit}</span></span>
              {d.orig>0&&<span style={{fontSize:13,color:'var(--muted)',textDecoration:'line-through'}}>${d.orig}</span>}
              {d.off>0&&<span style={{fontSize:10,fontWeight:800,color:'#ef4444',background:'rgba(239,68,68,0.08)',padding:'3px 8px',borderRadius:20}}>-{d.off}%</span>}
            </>
          ):null}
          {d.ship&&<span style={{fontSize:10,color:isR?'#f59e0b':'var(--green)',fontWeight:600}}>{d.ship}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
          <span style={{fontSize:11,color:'var(--muted)'}}>{d.time}</span>
          <span style={{fontSize:11,color:'var(--text-secondary)'}}>💬 {d.comments}</span>
        </div>
        <PriceRows prices={d.prices} unit={unit}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'space-between',flexShrink:0,minWidth:85,gap:8}}>
        <button onClick={e=>{e.stopPropagation();window.open(d.aff||'#','_blank')}} className="get-deal-btn" style={{padding:'10px 20px',background:'var(--accent)',color:'#fff',border:0,borderRadius:10,fontWeight:700,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',letterSpacing:0.3,transition:'all .2s',boxShadow:'0 2px 8px rgba(26,115,232,0.25)'}}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.boxShadow='0 4px 16px rgba(26,115,232,0.35)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(26,115,232,0.25)'}}>{isR?'Claim':'Get Deal'}</button>
        <button onClick={e=>{e.stopPropagation();onAlert(d)}} style={{padding:'6px 12px',background:watching?'rgba(16,185,129,0.08)':'transparent',border:`1px solid ${watching?'var(--green)':'var(--border)'}`,borderRadius:8,fontWeight:600,fontSize:10,color:watching?'var(--green)':'var(--muted)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{watching?'✅ Watching':'🔔 Alert'}</button>
      </div>
    </div>
  );
}

function ProductSearch({query,showToast}){
const[searchQ,setSearchQ]=useState(query||'');
const[results,setResults]=useState(null);
const[loading,setLoading]=useState(false);
const[sortBy,setSortBy]=useState('price');
const[filterStore,setFilterStore]=useState('all');
const[priceRange,setPriceRange]=useState([0,9999]);
const STORE_DB=[
{name:'Amazon',color:'#ff9900',icon:'📦',ship:'Free Prime 2-day',rating:()=>3.5+Math.random()*1.5,reviews:()=>Math.floor(Math.random()*8000)+100,mult:1.0},
{name:'Walmart',color:'#0071dc',icon:'🏪',ship:'Free Ship $35+',rating:()=>3.2+Math.random()*1.8,reviews:()=>Math.floor(Math.random()*5000)+50,mult:0.95},
{name:'Target',color:'#cc0000',icon:'🎯',ship:'Free Ship $35+',rating:()=>3.5+Math.random()*1.5,reviews:()=>Math.floor(Math.random()*3000)+30,mult:1.05},
{name:'Best Buy',color:'#0046be',icon:'💻',ship:'Free Ship $35+',rating:()=>3.8+Math.random()*1.2,reviews:()=>Math.floor(Math.random()*4000)+80,mult:1.08},
{name:'eBay',color:'#e43137',icon:'🏷️',ship:'Varies',rating:()=>3.0+Math.random()*2.0,reviews:()=>Math.floor(Math.random()*2000)+20,mult:0.85},
{name:'Costco',color:'#e31837',icon:'🛒',ship:'Free Ship (Members)',rating:()=>4.0+Math.random()*1.0,reviews:()=>Math.floor(Math.random()*1500)+40,mult:0.92},
{name:'Home Depot',color:'#f96302',icon:'🔧',ship:'Free Ship $45+',rating:()=>3.6+Math.random()*1.4,reviews:()=>Math.floor(Math.random()*3000)+60,mult:1.02},
{name:'Wayfair',color:'#7f187f',icon:'🪑',ship:'Free Ship',rating:()=>3.4+Math.random()*1.6,reviews:()=>Math.floor(Math.random()*2500)+30,mult:1.1},
{name:'Newegg',color:'#d76b00',icon:'🖥️',ship:'Free Ship $50+',rating:()=>3.7+Math.random()*1.3,reviews:()=>Math.floor(Math.random()*3500)+70,mult:0.97},
{name:'Kroger',color:'#0078d4',icon:'🥫',ship:'Delivery $7.95',rating:()=>3.3+Math.random()*1.2,reviews:()=>Math.floor(Math.random()*500)+10,mult:0.98},
];
const PRODUCT_DB={
'hand warmer':[{t:'Rechargeable Hand Warmer 10000mAh Power Bank — 3 Heat Levels',base:19.99,img:'hand-warmer'},{t:'OCOOPA Hand Warmers 2-Pack — Electric USB Rechargeable',base:29.99,img:'hand-warmer-2pk'},{t:'HotHands Hand Warmers 40-Pair Value Pack — Up to 10hrs Heat',base:21.99,img:'hothands-pack'},{t:'Zippo Rechargeable Hand Warmer — 6hr Heat, Silver',base:34.99,img:'zippo-warmer'}],
'air fryer':[{t:'Ninja Air Fryer Pro 4-in-1 — 5 Qt, 400°F, Crisp & Roast',base:79.99,img:'ninja-airfryer'},{t:'COSORI Air Fryer Pro LE 5Qt — 9 Cooking Functions, Dishwasher Safe',base:69.99,img:'cosori-airfryer'},{t:'Instant Vortex Plus 6-in-1 Air Fryer 6Qt — Stainless Steel',base:89.99,img:'instant-airfryer'},{t:'Philips Premium Digital Airfryer XXL — Fat Removal, 3lb/7qt',base:199.99,img:'philips-airfryer'}],
'laptop stand':[{t:'Rain Design mStand Laptop Stand — Aluminum, Silver',base:44.99,img:'rain-stand'},{t:'Nulaxy C1 Laptop Stand — Ergonomic Aluminum, Adjustable',base:25.99,img:'nulaxy-stand'},{t:'Twelve South Curve SE Laptop Stand — Matte Black',base:49.99,img:'curve-stand'},{t:'SOUNDANCE Laptop Stand Adjustable — Multi-Angle, Foldable',base:16.99,img:'soundance-stand'}],
'bluetooth speaker':[{t:'JBL Flip 6 Portable Bluetooth Speaker — IP67 Waterproof',base:99.99,img:'jbl-flip6'},{t:'Bose SoundLink Flex Bluetooth Speaker — PositionIQ',base:119.99,img:'bose-flex'},{t:'Anker Soundcore 3 Bluetooth Speaker — BassUp, 24H Play',base:39.99,img:'anker-sc3'},{t:'Sony SRS-XB100 Bluetooth Speaker — Ultra Portable, 16Hr',base:49.99,img:'sony-xb100'}],
'robot vacuum':[{t:'iRobot Roomba j7+ Self-Emptying Robot Vacuum — Smart Mapping',base:399.99,img:'roomba-j7'},{t:'roborock Q7 Max+ Robot Vacuum Mop Combo — Auto Empty',base:359.99,img:'roborock-q7'},{t:'Shark IQ Robot Self-Empty XL — Row-by-Row Cleaning',base:299.99,img:'shark-iq'},{t:'eufy RoboVac G30 Edge Robot Vacuum — Smart Dynamic Nav',base:199.99,img:'eufy-g30'}],
'default':[{t:'${Q} — Top Rated Best Seller',base:29.99,img:'product-1'},{t:'${Q} — Premium Quality, High Reviews',base:49.99,img:'product-2'},{t:'${Q} — Budget Friendly Pick',base:14.99,img:'product-3'},{t:'${Q} — Professional Grade',base:79.99,img:'product-4'}],
};
const doSearch=useCallback((q)=>{
if(!q?.trim())return;
setLoading(true);setResults(null);
const key=q.toLowerCase().trim();
setTimeout(()=>{
const prods=PRODUCT_DB[key]||PRODUCT_DB['default'].map(p=>({...p,t:p.t.replace('${Q}',q.trim().split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' '))}));
const allResults=[];
prods.forEach((prod,pi)=>{
const stores=STORE_DB.sort(()=>Math.random()-0.5).slice(0,Math.floor(Math.random()*4)+5);
stores.forEach(store=>{
const variance=(Math.random()*0.25-0.1);
const price=Math.max(4.99,+(prod.base*store.mult*(1+variance)).toFixed(2));
const origPrice=+(price*(1+Math.random()*0.4+0.1)).toFixed(2);
const off=Math.round((1-price/origPrice)*100);
const rat=+store.rating().toFixed(1);
const revs=store.reviews();
allResults.push({id:`${pi}-${store.name}`,title:prod.t,store:store.name,storeColor:store.color,storeIcon:store.icon,price,origPrice,off,ship:store.ship,rating:rat,reviews:revs,img:P(prod.img+'-'+store.name.toLowerCase().replace(/\s/g,''),200,200),inStock:Math.random()>0.1,prime:store.name==='Amazon',sponsored:pi===0&&store.name==='Amazon'});
});
});
setResults(allResults);
setLoading(false);
},1800);
},[]);
const filteredResults=useMemo(()=>{
if(!results)return[];
let r=[...results];
if(filterStore!=='all')r=r.filter(x=>x.store===filterStore);
r=r.filter(x=>x.price>=priceRange[0]&&x.price<=priceRange[1]);
if(sortBy==='price')r.sort((a,b)=>a.price-b.price);
else if(sortBy==='rating')r.sort((a,b)=>b.rating-a.rating);
else if(sortBy==='reviews')r.sort((a,b)=>b.reviews-a.reviews);
else if(sortBy==='savings')r.sort((a,b)=>b.off-a.off);
return r;
},[results,sortBy,filterStore,priceRange]);
const uniqueStores=useMemo(()=>{if(!results)return[];const s=[...new Set(results.map(r=>r.store))];return s.sort()},[results]);
const bestPrice=useMemo(()=>{if(!filteredResults.length)return null;return filteredResults.reduce((min,r)=>r.price<min.price?r:min,filteredResults[0])},[filteredResults]);
const Star=({v})=>{const full=Math.floor(v);const half=v-full>=0.5;return(<span style={{color:'#ff9500',fontSize:12,letterSpacing:-1}}>{Array.from({length:5},(_, i)=>i<full?'★':i===full&&half?'★':'☆').join('')}</span>)};
return(<div>
<div style={{background:'linear-gradient(135deg,#1a73e8,#4a9af5)',borderRadius:14,padding:'28px 24px',marginBottom:16}}>
<div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}><span style={{fontSize:24}}>🏷️</span><h2 style={{fontSize:18,fontWeight:800,color:'#fff',margin:0}}>SnagDeals Product Search</h2></div>
<p style={{fontSize:13,color:'rgba(255,255,255,.85)',margin:'4px 0 16px'}}>Search any product — we compare prices across 10+ stores to find the cheapest.</p>
<div style={{display:'flex',gap:8}}>
<div style={{flex:1,position:'relative'}}><span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
<input value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')doSearch(searchQ)}} placeholder="Try: hand warmer, air fryer, bluetooth speaker, robot vacuum..." style={{width:'100%',padding:'12px 14px 12px 38px',border:'2px solid rgba(255,255,255,.3)',borderRadius:10,fontSize:14,fontFamily:'inherit',background:'rgba(255,255,255,.95)',color:'#1d1d1f',outline:'none'}}/>
</div>
<button onClick={()=>doSearch(searchQ)} style={{padding:'12px 28px',background:'#fff',color:'#1a73e8',border:0,borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Search All Stores</button>
</div>
<div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>{['hand warmer','air fryer','laptop stand','bluetooth speaker','robot vacuum'].map(s=>(<button key={s} onClick={()=>{setSearchQ(s);doSearch(s)}} style={{padding:'5px 12px',background:'rgba(255,255,255,.2)',color:'#fff',border:'1px solid rgba(255,255,255,.3)',borderRadius:20,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>{s}</button>))}</div>
</div>
{loading&&<div style={{background:'#fff',border:'1px solid #e5e5ea',borderRadius:12,padding:40,textAlign:'center'}}>
<div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:16}}>{STORE_DB.slice(0,6).map((s,i)=>(<div key={i} style={{width:36,height:36,borderRadius:8,background:s.color,display:'grid',placeItems:'center',color:'#fff',fontSize:14,animation:`pulse 1.5s ease-in-out ${i*0.15}s infinite`}}>{s.icon}</div>))}</div>
<style>{`@keyframes pulse{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}`}</style>
<div style={{fontSize:15,fontWeight:600,color:'#424245'}}>Searching 10+ stores for the best prices...</div>
<div style={{fontSize:12,color:'#86868b',marginTop:6}}>Comparing Amazon, Walmart, Target, Best Buy, eBay, Costco & more</div>
</div>}
{results&&<div>
<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:8}}>
<div style={{fontSize:13,color:'#86868b'}}><strong style={{color:'#1d1d1f'}}>{filteredResults.length}</strong> results across <strong style={{color:'#1d1d1f'}}>{uniqueStores.length}</strong> stores{bestPrice&&<span> — Best price: <strong style={{color:'#34c759',fontFamily:'Fraunces,serif'}}>${bestPrice.price}</strong> at {bestPrice.store}</span>}</div>
<div style={{display:'flex',gap:6}}>
<select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e5e5ea',borderRadius:6,fontSize:12,fontFamily:'inherit',color:'#424245',outline:'none'}}>
<option value="price">Sort: Lowest Price</option><option value="rating">Sort: Highest Rated</option><option value="reviews">Sort: Most Reviews</option><option value="savings">Sort: Biggest Savings</option>
</select>
<select value={filterStore} onChange={e=>setFilterStore(e.target.value)} style={{padding:'6px 10px',border:'1px solid #e5e5ea',borderRadius:6,fontSize:12,fontFamily:'inherit',color:'#424245',outline:'none'}}>
<option value="all">All Stores</option>{uniqueStores.map(s=><option key={s} value={s}>{s}</option>)}
</select>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',gap:3}}>
{filteredResults.map((r,i)=>{const isBest=bestPrice&&r.id===bestPrice.id;return(
<div key={r.id} style={{display:'flex',gap:14,padding:'14px 16px',background:isBest?'#f0fdf4':'#fff',border:`1px solid ${isBest?'#34c759':'#e5e5ea'}`,borderLeft:isBest?'3px solid #34c759':'1px solid #e5e5ea',borderRadius:10,transition:'all .2s',cursor:'pointer',position:'relative'}} onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.08)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'}}>
{r.sponsored&&<span style={{position:'absolute',top:6,right:8,fontSize:9,color:'#aeaeb2',fontWeight:500}}>Sponsored</span>}
{isBest&&<span style={{position:'absolute',top:6,left:16,fontSize:9,fontWeight:700,background:'#34c759',color:'#fff',padding:'2px 8px',borderRadius:20}}>🏆 BEST PRICE</span>}
<ImgBox src={r.img} em={'📦'} alt={r.title}/>
<div style={{flex:1,minWidth:0,paddingTop:isBest?16:0}}>
<div style={{fontSize:11,color:'#86868b',textTransform:'uppercase',letterSpacing:'.3px',marginBottom:3,display:'flex',alignItems:'center',gap:6}}>
<span style={{width:6,height:6,borderRadius:'50%',background:r.storeColor,display:'inline-block'}}></span>
<span style={{fontWeight:600}}>{r.storeIcon} {r.store}</span>
{r.prime&&<span style={{fontSize:9,fontWeight:700,background:'#ff9900',color:'#fff',padding:'1px 6px',borderRadius:3}}>Prime</span>}
{!r.inStock&&<span style={{fontSize:9,fontWeight:600,color:'#ff3b30'}}>Out of Stock</span>}
</div>
<div style={{fontSize:14,fontWeight:600,lineHeight:1.4,marginBottom:5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{r.title}</div>
<div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}><Star v={r.rating}/><span style={{fontSize:11,color:'#86868b'}}>{r.rating}</span><span style={{fontSize:11,color:'#aeaeb2'}}>({r.reviews.toLocaleString()} reviews)</span></div>
<div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
<span style={{fontFamily:'Fraunces,serif',fontWeight:700,fontSize:20,color:isBest?'#34c759':'#1d1d1f'}}>${r.price}</span>
<span style={{fontSize:13,color:'#aeaeb2',textDecoration:'line-through'}}>${r.origPrice}</span>
{r.off>0&&<span style={{fontSize:11,fontWeight:700,color:'#ff3b30',background:'#fff0ef',padding:'2px 7px',borderRadius:4}}>-{r.off}%</span>}
<span style={{fontSize:11,color:'#34c759',fontWeight:500}}>{r.ship}</span>
</div>
</div>
<div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'space-between',flexShrink:0,minWidth:100}}>
<button onClick={e=>{e.stopPropagation();window.open(`https://www.${r.store.toLowerCase().replace(/\s+/g,'')}.com/s?k=${encodeURIComponent(searchQ)}`,'_blank')}} style={{padding:'9px 20px',background:isBest?'#34c759':'#0066cc',color:'#fff',border:0,borderRadius:6,fontWeight:600,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>View on {r.store.split(' ')[0]}</button>
<button onClick={()=>{showToast(`✅ Alert set for "${r.title.substring(0,30)}..." below $${(r.price*0.9).toFixed(2)}`)}} style={{padding:'5px 10px',background:'transparent',border:'1px solid #e5e5ea',borderRadius:5,fontWeight:500,fontSize:10,color:'#86868b',cursor:'pointer',fontFamily:'inherit',marginTop:6}}>🔔 Price Alert</button>
</div>
</div>
)})}
</div>
{filteredResults.length===0&&results.length>0&&<div style={{textAlign:'center',padding:40,color:'#86868b'}}><p style={{fontSize:15,fontWeight:600}}>No results match your filters</p><button onClick={()=>{setFilterStore('all');setPriceRange([0,9999])}} style={{padding:'8px 16px',background:'#0066cc',color:'#fff',border:0,borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',marginTop:8}}>Clear Filters</button></div>}
</div>}
{!results&&!loading&&<div style={{background:'#fff',border:'1px solid #e5e5ea',borderRadius:12,padding:'40px 20px',textAlign:'center'}}>
<div style={{fontSize:48,marginBottom:12}}>🏷️</div>
<h3 style={{fontSize:17,fontWeight:700,color:'#1d1d1f',marginBottom:6}}>Search Any Product</h3>
<p style={{fontSize:13,color:'#86868b',lineHeight:1.6,maxWidth:400,margin:'0 auto'}}>Type any product above and SnagDeals will scan Amazon, Walmart, Target, Best Buy, eBay, Costco, and more to find you the lowest price.</p>
<div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16,flexWrap:'wrap'}}>
{['🔥 Hand Warmers','🍳 Air Fryers','💻 Laptop Stands','🔊 Speakers','🤖 Robot Vacuums'].map(s=>(<button key={s} onClick={()=>{const q=s.split(' ').slice(1).join(' ').toLowerCase();setSearchQ(q);doSearch(q)}} style={{padding:'8px 14px',background:'#f8f8fa',border:'1px solid #e5e5ea',borderRadius:8,fontSize:12,fontWeight:600,color:'#424245',cursor:'pointer',fontFamily:'inherit'}}>{s}</button>))}
</div>
</div>}
</div>);}

// ===== GEO DETECTION — timezone-based, no API needed =====
function detectUserCity(){try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';const tzCity={
'America/New_York':'New York','America/Chicago':'Dallas','America/Denver':'Las Vegas','America/Los_Angeles':'Los Angeles',
'America/Phoenix':'Las Vegas','America/Detroit':'Chicago','America/Indiana':'Chicago',
'America/Boise':'Las Vegas','America/Anchorage':'Hawaii','Pacific/Honolulu':'Hawaii',
'Europe/London':'London','Europe/Paris':'Paris','Europe/Berlin':'Barcelona','Europe/Rome':'Rome',
'Europe/Madrid':'Barcelona','Europe/Amsterdam':'Amsterdam','Europe/Athens':'Athens',
'Europe/Istanbul':'Istanbul','Europe/Lisbon':'London',
'Asia/Tokyo':'Tokyo','Asia/Osaka':'Tokyo','Asia/Seoul':'Tokyo',
'Asia/Kolkata':'Hyderabad','Asia/Calcutta':'Hyderabad','Asia/Mumbai':'Mumbai',
'Asia/Dubai':'Dubai','Asia/Muscat':'Dubai','Asia/Riyadh':'Dubai',
'Asia/Singapore':'Singapore','Asia/Kuala_Lumpur':'Singapore',
'Asia/Bangkok':'Bangkok','Asia/Ho_Chi_Minh':'Bangkok','Asia/Jakarta':'Bali',
'Asia/Shanghai':'Tokyo','Asia/Hong_Kong':'Singapore','Asia/Taipei':'Tokyo',
'Australia/Sydney':'Sydney','Australia/Melbourne':'Sydney','Australia/Brisbane':'Sydney',
'Pacific/Auckland':'Sydney',
'America/Sao_Paulo':'Miami','America/Argentina':'Miami','America/Mexico_City':'Dallas',
'America/Toronto':'New York','America/Vancouver':'San Francisco','America/Edmonton':'Las Vegas',
'Africa/Cairo':'Dubai','Africa/Johannesburg':'Dubai','Africa/Lagos':'London','Africa/Nairobi':'Dubai'
};const city=tzCity[tz];if(city)return city;const parts=tz.split('/');if(parts.length>1){const region=parts[0];const regionMap={'America':'New York','Europe':'London','Asia':'Tokyo','Australia':'Sydney','Africa':'Dubai','Pacific':'Hawaii'};return regionMap[region]||'New York'}return'New York'}catch(e){return'New York'}}
function detectUserCountry(){try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';if(tz.startsWith('America/'))return tz.includes('Toronto')||tz.includes('Vancouver')||tz.includes('Edmonton')?'CA':tz.includes('Mexico')?'MX':'US';if(tz.startsWith('Europe/'))return tz.includes('London')?'UK':'EU';if(tz.includes('Kolkata')||tz.includes('Calcutta')||tz.includes('Mumbai'))return'IN';if(tz.includes('Tokyo')||tz.includes('Osaka'))return'JP';if(tz.includes('Dubai')||tz.includes('Muscat')||tz.includes('Riyadh'))return'AE';if(tz.startsWith('Australia'))return'AU';if(tz.includes('Singapore'))return'SG';if(tz.includes('Bangkok'))return'TH';return'US'}catch(e){return'US'}}
function getCurrencySymbol(country){const m={'US':'$','IN':'₹','JP':'¥','UK':'£','EU':'€','AE':'AED ','AU':'A$','CA':'C$','SG':'S$','TH':'฿','MX':'$'};return m[country]||'$'}
function convertPrice(usd,country){const rates={'US':1,'IN':83,'JP':150,'UK':0.79,'EU':0.92,'AE':3.67,'AU':1.55,'CA':1.36,'SG':1.34,'TH':35,'MX':17};return Math.round(usd*(rates[country]||1))}

function SearchPanel({type,detectedCity}){const[results,setResults]=useState(null);const[loading,setLoading]=useState(false);const[actLoc,setActLoc]=useState(detectedCity||'');const[actCat,setActCat]=useState('All');const[actResults,setActResults]=useState(null);useEffect(()=>{if(type==='activity'&&detectedCity&&!actResults){search(detectedCity)}},[]);const search=useCallback((overrideLoc)=>{if(type==='activity'){setLoading(true);setActResults(null);setTimeout(()=>{const loc=(overrideLoc||actLoc).trim().toLowerCase();const acts=[{t:'🗽 Statue of Liberty Express Tour',p:44,s:'Viator',r:4.8,d:'4 hrs',loc:'new york',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎭 Broadway Show Tickets — Up to 50% Off',p:69,s:'TodayTix',r:4.7,d:'2.5 hrs',loc:'new york',aff:'https://www.todaytix.com'},{t:'🌃 NYC Night Bus Tour + Top of the Rock',p:55,s:'GetYourGuide',r:4.6,d:'3 hrs',loc:'new york',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🚁 Manhattan Helicopter Tour — 20 Min',p:199,s:'FlyNYON',r:4.9,d:'20 min',loc:'new york',aff:'https://flynyon.com'},{t:'🍕 NYC Pizza Walking Tour — 8 Slices',p:39,s:'Viator',r:4.8,d:'2 hrs',loc:'new york',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎭 Louvre Semi-Private + Mona Lisa Priority',p:52,s:'GetYourGuide',r:4.9,d:'2.5 hrs',loc:'paris',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🗼 Eiffel Tower Summit + Seine Cruise',p:79,s:'Viator',r:4.7,d:'4 hrs',loc:'paris',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🍷 Paris Wine & Cheese Tasting Experience',p:45,s:'Klook',r:4.8,d:'2 hrs',loc:'paris',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏰 Versailles Palace + Gardens Day Trip',p:59,s:'GetYourGuide',r:4.6,d:'8 hrs',loc:'paris',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎨 Musée d\'Orsay Skip-the-Line Tour',p:35,s:'Viator',r:4.8,d:'2 hrs',loc:'paris',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🏛️ Colosseum Underground + Arena Floor',p:69,s:'GetYourGuide',r:4.9,d:'3 hrs',loc:'rome',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🍝 Rome: Pasta Making Class + Tiramisu',p:55,s:'Viator',r:4.9,d:'3 hrs',loc:'rome',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🛵 Rome Vespa Tour + Gelato Stop',p:89,s:'Klook',r:4.7,d:'3.5 hrs',loc:'rome',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'⛪ Vatican + Sistine Chapel Skip-the-Line',p:59,s:'GetYourGuide',r:4.8,d:'3 hrs',loc:'rome',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🏯 Tsukiji Market + Sake & Street Food',p:65,s:'GetYourGuide',r:4.9,d:'3 hrs',loc:'tokyo',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🗾 Mt. Fuji Day Trip from Tokyo',p:79,s:'Klook',r:4.6,d:'11 hrs',loc:'tokyo',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'👘 Kimono Rental + Asakusa Photo Tour',p:35,s:'Viator',r:4.8,d:'4 hrs',loc:'tokyo',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🍣 Tsukiji Sushi Workshop — Make 8 Pieces',p:89,s:'GetYourGuide',r:4.9,d:'2 hrs',loc:'tokyo',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎢 Walt Disney World 4-Park Magic Ticket',p:89,s:'GetYourGuide',r:4.8,d:'All day',loc:'orlando',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🦈 Orlando: Kennedy Space Center Day Trip',p:65,s:'Viator',r:4.7,d:'10 hrs',loc:'orlando',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎡 Universal 2-Park with Express Pass',p:179,s:'Klook',r:4.8,d:'All day',loc:'orlando',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🐊 Everglades Airboat + Gator Show',p:29,s:'GetYourGuide',r:4.6,d:'4 hrs',loc:'miami',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🚤 Miami: Biscayne Bay Jet Ski + Skyline Tour',p:69,s:'Viator',r:4.5,d:'1.5 hrs',loc:'miami',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🌴 South Beach Art Deco Walking Tour',p:25,s:'Klook',r:4.7,d:'2 hrs',loc:'miami',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🚁 Las Vegas Night Helicopter + Champagne',p:119,s:'Viator',r:4.8,d:'15 min',loc:'las vegas',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎰 Grand Canyon Helicopter + Landing',p:199,s:'GetYourGuide',r:4.9,d:'4 hrs',loc:'las vegas',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎪 Cirque du Soleil Show Ticket',p:89,s:'Klook',r:4.8,d:'2 hrs',loc:'las vegas',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🐪 Desert Safari — BBQ, Camel, Shows',p:39,s:'Klook',r:4.7,d:'6 hrs',loc:'dubai',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏗️ Burj Khalifa At The Top — 124th Floor',p:35,s:'GetYourGuide',r:4.6,d:'1.5 hrs',loc:'dubai',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🚤 Dubai Marina Yacht Cruise + Brunch',p:65,s:'Viator',r:4.8,d:'3 hrs',loc:'dubai',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🌉 Alcatraz Island + City Cruise Combo',p:89,s:'Viator',r:4.7,d:'5 hrs',loc:'san francisco',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🚃 Napa Valley Wine Train — Gourmet Lunch',p:149,s:'GetYourGuide',r:4.8,d:'6 hrs',loc:'san francisco',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🌁 Golden Gate Bike Ride + Sausalito Ferry',p:39,s:'Klook',r:4.6,d:'3 hrs',loc:'san francisco',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'⛪ Sagrada Familia Fast-Track + Guide',p:47,s:'GetYourGuide',r:4.9,d:'1.5 hrs',loc:'barcelona',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎨 Park Güell + Gothic Quarter Walking Tour',p:35,s:'Viator',r:4.7,d:'3 hrs',loc:'barcelona',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🍷 Barcelona Wine + Tapas Evening Tour',p:55,s:'Klook',r:4.8,d:'3 hrs',loc:'barcelona',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🌺 Polynesian Luau + Fire Dance Buffet',p:119,s:'Viator',r:4.8,d:'4 hrs',loc:'hawaii',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🤿 Molokini Snorkel — BBQ Lunch Included',p:89,s:'Viator',r:4.7,d:'5 hrs',loc:'hawaii',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🌋 Big Island: Volcanoes National Park Tour',p:159,s:'GetYourGuide',r:4.9,d:'11 hrs',loc:'hawaii',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🏙️ Architecture River Cruise — First Lady Ship',p:49,s:'Viator',r:4.9,d:'1.5 hrs',loc:'chicago',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🍕 Chicago Deep Dish Pizza Tour — 4 Stops',p:69,s:'GetYourGuide',r:4.8,d:'3 hrs',loc:'chicago',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎬 Hollywood Sign Hike + Griffith Observatory',p:39,s:'Viator',r:4.7,d:'3 hrs',loc:'los angeles',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎡 Santa Monica Pier + Venice Beach Bike Tour',p:45,s:'Klook',r:4.6,d:'3 hrs',loc:'los angeles',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🤠 JFK Sixth Floor + Cowboys Stadium Tour',p:55,s:'Viator',r:4.5,d:'5 hrs',loc:'dallas',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🏇 Fort Worth Stockyards + BBQ Trail',p:39,s:'GetYourGuide',r:4.7,d:'4 hrs',loc:'dallas',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🛕 Grand Palace + Wat Pho + Boat Tour',p:25,s:'Klook',r:4.8,d:'6 hrs',loc:'bangkok',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🥊 Muay Thai Match Tickets — Ringside',p:45,s:'Viator',r:4.6,d:'3 hrs',loc:'bangkok',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🕌 Hagia Sophia + Blue Mosque + Bazaar',p:35,s:'GetYourGuide',r:4.8,d:'5 hrs',loc:'istanbul',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎈 Cappadocia Hot Air Balloon from Istanbul',p:189,s:'Viator',r:4.9,d:'Day trip',loc:'istanbul',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🏝️ Phi Phi + Maya Bay Speedboat + Lunch',p:35,s:'Klook',r:4.7,d:'8 hrs',loc:'phuket',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🐘 Phuket Elephant Sanctuary Visit',p:49,s:'GetYourGuide',r:4.9,d:'4 hrs',loc:'phuket',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🏛️ Acropolis + Parthenon Guided Tour',p:42,s:'GetYourGuide',r:4.8,d:'2 hrs',loc:'athens',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'⛵ Athens: Sunset Sailing Cruise + Dinner',p:69,s:'Viator',r:4.7,d:'3 hrs',loc:'athens',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🚤 Canal Cruise + Heineken Experience',p:39,s:'GetYourGuide',r:4.6,d:'3 hrs',loc:'amsterdam',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🌷 Keukenhof Gardens Day Trip',p:29,s:'Klook',r:4.8,d:'5 hrs',loc:'amsterdam',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🌴 Ubud Rice Terrace + Waterfall + Monkeys',p:29,s:'Viator',r:4.8,d:'10 hrs',loc:'bali',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🤿 Bali: Snorkeling at Blue Lagoon + Lunch',p:39,s:'Klook',r:4.7,d:'6 hrs',loc:'bali',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🦁 Night Safari + Tram Ride + Fire Show',p:38,s:'Klook',r:4.7,d:'4 hrs',loc:'singapore',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🎡 Singapore Flyer + Gardens by the Bay',p:45,s:'GetYourGuide',r:4.8,d:'3 hrs',loc:'singapore',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎭 Opera House Tour + Harbour Bridge Climb',p:149,s:'GetYourGuide',r:4.9,d:'4 hrs',loc:'sydney',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🐨 Sydney: Taronga Zoo Ferry + Entry',p:39,s:'Viator',r:4.7,d:'4 hrs',loc:'sydney',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎵 Nashville: Honky Tonk Bar Crawl + Live Music',p:29,s:'Viator',r:4.6,d:'3 hrs',loc:'nashville',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎸 Grand Ole Opry Backstage Tour',p:35,s:'GetYourGuide',r:4.8,d:'1.5 hrs',loc:'nashville',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🐎 Nashville: Jack Daniel\'s Distillery Day Trip',p:89,s:'Klook',r:4.7,d:'8 hrs',loc:'nashville',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🎤 Madison Square Garden Concert Tickets — Live Music',p:65,s:'StubHub',r:4.7,d:'3 hrs',loc:'new york',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎸 NYC Jazz Club Live Show — Village Vanguard',p:35,s:'SeatGeek',r:4.8,d:'2 hrs',loc:'new york',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🏀 NBA: Knicks Game at MSG — Floor Seats Available',p:89,s:'StubHub',r:4.6,d:'3 hrs',loc:'new york',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'⚾ Yankees Stadium Tour + Game Day Tickets',p:45,s:'SeatGeek',r:4.7,d:'4 hrs',loc:'new york',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🎤 O2 Arena Concert — Major Artists Weekly',p:55,s:'Ticketmaster',r:4.7,d:'3 hrs',loc:'london',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'⚽ Premier League Match Day Experience',p:120,s:'StubHub',r:4.8,d:'3 hrs',loc:'london',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎸 Camden Live Music Crawl — 3 Venues',p:29,s:'GetYourGuide',r:4.6,d:'4 hrs',loc:'london',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎤 Moulin Rouge Cabaret Show — Dinner + Show',p:169,s:'Viator',r:4.9,d:'4 hrs',loc:'paris',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'⚽ PSG Match at Parc des Princes',p:89,s:'StubHub',r:4.7,d:'3 hrs',loc:'paris',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎵 Paris Jazz Club Night — Le Caveau de la Huchette',p:25,s:'GetYourGuide',r:4.8,d:'3 hrs',loc:'paris',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'⚽ Serie A: AS Roma Game at Stadio Olimpico',p:65,s:'StubHub',r:4.7,d:'3 hrs',loc:'rome',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎤 Las Vegas Residency Shows — Top Artists',p:99,s:'Ticketmaster',r:4.8,d:'2 hrs',loc:'las vegas',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'🥊 UFC Fight Night — T-Mobile Arena VIP',p:199,s:'StubHub',r:4.9,d:'5 hrs',loc:'las vegas',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🏀 NBA: Lakers Game at Crypto.com Arena',p:79,s:'SeatGeek',r:4.7,d:'3 hrs',loc:'los angeles',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🎤 Hollywood Bowl Concert — Open Air Live Music',p:49,s:'Ticketmaster',r:4.8,d:'3 hrs',loc:'los angeles',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'🎸 Sunset Strip Live Music Tour — 3 Clubs',p:39,s:'Viator',r:4.6,d:'4 hrs',loc:'los angeles',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🏈 NFL: Cowboys at AT&T Stadium — Game Day',p:95,s:'StubHub',r:4.7,d:'4 hrs',loc:'dallas',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎤 Billy Bobs Texas — Live Country Music',p:25,s:'SeatGeek',r:4.6,d:'3 hrs',loc:'dallas',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🏀 NBA: Mavericks at American Airlines Center',p:55,s:'StubHub',r:4.7,d:'3 hrs',loc:'dallas',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🏈 NFL: Dolphins Game + Tailgate Experience',p:75,s:'StubHub',r:4.6,d:'5 hrs',loc:'miami',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎤 Miami Beach Concert Series — Bayfront Park',p:35,s:'Ticketmaster',r:4.5,d:'3 hrs',loc:'miami',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'🎵 Nashville Live Music Venue Pass — 5 Bars',p:19,s:'Viator',r:4.7,d:'5 hrs',loc:'nashville',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎸 Grand Ole Opry Live Show Tickets',p:55,s:'Ticketmaster',r:4.9,d:'2.5 hrs',loc:'nashville',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'🎤 Bluebird Cafe Songwriter Night',p:15,s:'SeatGeek',r:4.8,d:'2 hrs',loc:'nashville',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🏀 NBA: Bulls at United Center',p:49,s:'StubHub',r:4.6,d:'3 hrs',loc:'chicago',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎤 Chicago Blues Club Crawl — 3 Venues',p:35,s:'GetYourGuide',r:4.7,d:'4 hrs',loc:'chicago',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'⚾ Cubs at Wrigley Field — Classic Ballpark',p:39,s:'SeatGeek',r:4.8,d:'4 hrs',loc:'chicago',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🎤 Tokyo Shibuya Live House — J-Pop + Rock',p:29,s:'Klook',r:4.6,d:'3 hrs',loc:'tokyo',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏏 IPL Cricket Match — Premium Box Seats',p:45,s:'BookMyShow',r:4.7,d:'4 hrs',loc:'dubai',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🎤 Dubai Opera Gala Night',p:89,s:'Platinumlist',r:4.8,d:'3 hrs',loc:'dubai',aff:'https://www.platinumlist.net'},{t:'🏎️ F1 Abu Dhabi Grand Prix Day Trip from Dubai',p:299,s:'GetYourGuide',r:4.9,d:'14 hrs',loc:'dubai',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'⚽ FC Barcelona at Camp Nou — La Liga',p:99,s:'StubHub',r:4.8,d:'3 hrs',loc:'barcelona',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎤 Razzmatazz Live Music Night — DJ + Bands',p:19,s:'Klook',r:4.5,d:'5 hrs',loc:'barcelona',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏉 Sydney Rugby Match + Stadium Tour',p:55,s:'StubHub',r:4.6,d:'4 hrs',loc:'sydney',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎤 Sydney Opera House Live Performance',p:79,s:'Ticketmaster',r:4.9,d:'2.5 hrs',loc:'sydney',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'🥊 Muay Thai Championship — Lumpinee Stadium',p:55,s:'Klook',r:4.7,d:'4 hrs',loc:'bangkok',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🎤 Bangkok Rooftop DJ Night — Skybar',p:29,s:'Klook',r:4.5,d:'4 hrs',loc:'bangkok',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏀 NBA: Magic at Amway Center',p:35,s:'SeatGeek',r:4.6,d:'3 hrs',loc:'orlando',aff:'https://seatgeek.com/?aid=SNAGDEALS'},{t:'🏈 NFL: 49ers at Levis Stadium',p:89,s:'StubHub',r:4.7,d:'4 hrs',loc:'san francisco',aff:'https://www.stubhub.com/?gcid=SNAGDEALS'},{t:'🎸 Fillmore SF Live Concert — Legendary Venue',p:45,s:'Ticketmaster',r:4.8,d:'3 hrs',loc:'san francisco',aff:'https://www.ticketmaster.com/?did=SNAGDEALS'},{t:'🌺 Hawaii Slack Key Guitar Concert',p:29,s:'Viator',r:4.8,d:'2 hrs',loc:'hawaii',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🕌 Charminar + Laad Bazaar Heritage Walk',p:15,s:'Thrillophilia',r:4.7,d:'3 hrs',loc:'hyderabad',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🍛 Hyderabadi Biryani Food Crawl — 5 Stops',p:12,s:'Klook',r:4.8,d:'4 hrs',loc:'hyderabad',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏰 Golconda Fort Sound + Light Show',p:8,s:'BookMyShow',r:4.6,d:'2 hrs',loc:'hyderabad',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🏏 IPL: Sunrisers Hyderabad — VIP Box',p:35,s:'BookMyShow',r:4.8,d:'4 hrs',loc:'hyderabad',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🎤 Live Concert — Shilpakala Vedika',p:15,s:'BookMyShow',r:4.5,d:'3 hrs',loc:'hyderabad',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🎢 Ramoji Film City Full Day Pass',p:19,s:'Thrillophilia',r:4.7,d:'8 hrs',loc:'hyderabad',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🚤 Hussain Sagar Boat + Buddha Statue',p:5,s:'Klook',r:4.4,d:'1 hr',loc:'hyderabad',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🎬 Tollywood Studio Tour + Lunch',p:22,s:'Thrillophilia',r:4.6,d:'5 hrs',loc:'hyderabad',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🏛️ Gateway of India + Elephanta Caves Boat',p:18,s:'Thrillophilia',r:4.7,d:'6 hrs',loc:'mumbai',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🎤 Bollywood Night Live Concert',p:20,s:'BookMyShow',r:4.6,d:'3 hrs',loc:'mumbai',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🍛 Mumbai Street Food Trail — Vada Pav Tour',p:10,s:'Klook',r:4.8,d:'3 hrs',loc:'mumbai',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏏 IPL: Mumbai Indians — Wankhede Stadium',p:40,s:'BookMyShow',r:4.8,d:'4 hrs',loc:'mumbai',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'⚽ ISL: Mumbai City FC Match',p:12,s:'BookMyShow',r:4.5,d:'3 hrs',loc:'mumbai',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🕌 Old Delhi Walk + Chandni Chowk Food',p:12,s:'Thrillophilia',r:4.7,d:'4 hrs',loc:'delhi',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🏰 Agra Day Trip — Taj Mahal Sunrise',p:25,s:'GetYourGuide',r:4.9,d:'12 hrs',loc:'delhi',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🎤 Live Sufi Night — Nizamuddin Area',p:8,s:'BookMyShow',r:4.6,d:'2 hrs',loc:'delhi',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🏏 IPL: Delhi Capitals — Arun Jaitley Stadium',p:30,s:'BookMyShow',r:4.7,d:'4 hrs',loc:'delhi',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'💻 Bangalore Tech Park + Startup Tour',p:15,s:'Thrillophilia',r:4.5,d:'4 hrs',loc:'bangalore',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🏏 IPL: RCB — Chinnaswamy Stadium',p:35,s:'BookMyShow',r:4.8,d:'4 hrs',loc:'bangalore',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🎤 Live Music — Hard Rock Cafe Bangalore',p:12,s:'BookMyShow',r:4.6,d:'3 hrs',loc:'bangalore',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🍷 Nandi Hills Sunrise + Wine Tasting',p:18,s:'Thrillophilia',r:4.7,d:'8 hrs',loc:'bangalore',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🏖️ Goa Beach Hopping + Water Sports',p:15,s:'Thrillophilia',r:4.7,d:'8 hrs',loc:'goa',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'🎤 Goa Trance Party — Anjuna Beach',p:10,s:'BookMyShow',r:4.5,d:'6 hrs',loc:'goa',aff:'https://in.bookmyshow.com/?utm_source=snagdeals'},{t:'🚤 Dudhsagar Falls Trek + Spice Plantation',p:20,s:'Klook',r:4.8,d:'10 hrs',loc:'goa',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🏰 Jaipur: Amber Fort + City Palace + Hawa Mahal',p:15,s:'GetYourGuide',r:4.8,d:'8 hrs',loc:'jaipur',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🐘 Jaipur Elephant Sanctuary Visit',p:18,s:'Viator',r:4.9,d:'3 hrs',loc:'jaipur',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎤 Rajasthani Folk Music + Dinner',p:12,s:'Thrillophilia',r:4.7,d:'3 hrs',loc:'jaipur',aff:'https://www.thrillophilia.com/?ref=SNAGDEALS'},{t:'⛩️ Kyoto: Fushimi Inari + Bamboo Forest + Tea',p:45,s:'GetYourGuide',r:4.9,d:'6 hrs',loc:'tokyo',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🏯 Osaka: Dotonbori Food Tour + Castle',p:35,s:'Klook',r:4.8,d:'4 hrs',loc:'tokyo',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'🎤 Tokyo Dome Concert — J-Pop Live',p:55,s:'Klook',r:4.7,d:'3 hrs',loc:'tokyo',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'⚾ NPB: Tokyo Giants at Tokyo Dome',p:30,s:'Klook',r:4.6,d:'3 hrs',loc:'tokyo',aff:'https://www.klook.com/?aid=SNAGDEALS'},{t:'♨️ Hakone Hot Springs Day Trip from Tokyo',p:59,s:'Viator',r:4.8,d:'10 hrs',loc:'tokyo',aff:'https://www.viator.com/?pid=P00089289&mcid=42383&medium=link'},{t:'🎮 Akihabara Anime + Gaming Tour',p:25,s:'GetYourGuide',r:4.7,d:'3 hrs',loc:'tokyo',aff:'https://www.getyourguide.com/?partner_id=SNAGDEALS'},{t:'🥋 Sumo Wrestling Tournament Tickets',p:45,s:'Klook',r:4.9,d:'5 hrs',loc:'tokyo',aff:'https://www.klook.com/?aid=SNAGDEALS'}];let filtered=loc?acts.filter(a=>a.loc.includes(loc)):acts;if(actCat!=='All'){const cats={Tours:['tour','walk','trip','cruise'],Food:['food','pizza','wine','sushi','pasta','cheese','bbq','dinner','brunch','lunch'],Adventure:['snorkel','helicopter','jet ski','bike','hike','airboat','safari','balloon','climb'],Shows:['show','broadway','cirque','opera','luau','match','music'],Attractions:['museum','temple','palace','tower','park','zoo','garden','floor','studio','church','mosque'],'Gigs & Concerts':['concert','gig','live music','festival','dj','band','singer','tour','rap','pop','rock','jazz','country','edm','rave','arena','stadium show'],'Sports':['game','match','nba','nfl','mlb','soccer','football','basketball','baseball','hockey','nhl','boxing','mma','ufc','f1','racing','tennis','cricket','rugby','premier league']};const kws=cats[actCat]||[];filtered=filtered.filter(a=>kws.some(k=>a.t.toLowerCase().includes(k)))}setActResults(filtered.sort((a,b)=>a.p-b.p));setLoading(false)},800);return}setLoading(true);setResults(null);setTimeout(()=>{const sites=type==='hotel'?['Booking.com','Expedia','Hotels.com','Agoda','Priceline','Kayak']:type==='travel'?['Google Flights','Kayak','Skyscanner','Expedia','WayAway']:type==='cruise'?['Royal Caribbean','Carnival.com','CruiseDirect','Costco Travel','Expedia Cruises','Vacations To Go']:['Airbnb','Vrbo','Booking.com Homes','Hotels.com Rentals','Expedia Vacation'];const base=type==='cruise'?Math.floor(Math.random()*600)+299:type==='hotel'?Math.floor(Math.random()*200)+120:type==='airbnb'?Math.floor(Math.random()*150)+80:Math.floor(Math.random()*400)+250;setResults(sites.map(s=>({s,p:base+Math.floor(Math.random()*60)-15})).sort((a,b)=>a.p-b.p));setLoading(false)},2000)},[type,actLoc,actCat]);const unit=type==='hotel'||type==='airbnb'?'/night':'/person';const titles={hotel:'🏨 Compare Hotel Prices Across 6 Sites',travel:'✈️ Compare Flight Prices',cruise:'🚢 Compare Cruise Prices',airbnb:'🏡 Search Airbnb & Vacation Rentals',activity:'🎫 Find Activities & Experiences'};const btnC={hotel:'#af52de',travel:'#0066cc',cruise:'#0891b2',airbnb:'#ff385c',activity:'#7c3aed'};const L=({l,children})=>(<div style={{flex:1}}><label style={{fontSize:11,fontWeight:600,color:'var(--muted,#86868b)',textTransform:'uppercase',letterSpacing:'.3px',display:'block',marginBottom:4}}>{l}</label>{children}</div>);const I=p=>(<input {...p} style={{width:'100%',padding:'9px 12px',border:'2px solid var(--border,#e5e5ea)',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none',background:'var(--bg,#f8f8fa)',transition:'all .2s',...(p.style||{})}}/>);const Se=p=>(<select {...p} style={{width:'100%',padding:'9px 12px',border:'2px solid var(--border,#e5e5ea)',borderRadius:10,fontSize:14,fontFamily:'inherit',outline:'none',background:'var(--bg,#f8f8fa)',transition:'all .2s',...(p.style||{})}}>{p.children}</select>);const locs=['New York','Paris','London','Rome','Tokyo','Orlando','Miami','Las Vegas','Dubai','San Francisco','Barcelona','Hawaii','Chicago','Los Angeles','Dallas','Bangkok','Istanbul','Phuket','Athens','Amsterdam','Bali','Singapore','Sydney','Nashville','Hyderabad','Mumbai','Delhi','Bangalore','Goa','Jaipur'];return(<div style={{background:'var(--card,#fff)',border:'1px solid var(--border,#e5e5ea)',borderRadius:16,padding:20,marginBottom:12}}><h3 style={{fontSize:16,fontWeight:800,marginBottom:14,color:'var(--text,#1d1d1f)'}}>{titles[type]}</h3>{type==='activity'&&<><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Where are you going?"><div style={{position:'relative'}}><I value={actLoc} onChange={e=>setActLoc(e.target.value)} placeholder="Enter a city — Paris, Tokyo, NYC..."/></div></L></div><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Category"><Se value={actCat} onChange={e=>setActCat(e.target.value)}><option>All</option><option>Tours</option><option>Food</option><option>Adventure</option><option>Shows</option><option>Attractions</option><option>Gigs & Concerts</option><option>Sports</option></Se></L></div><div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>{locs.map(l=>(<button key={l} onClick={()=>{setActLoc(l);search(l)}} style={{padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:500,color:actLoc.toLowerCase()===l.toLowerCase()?'#fff':'var(--text-secondary,#475569)',background:actLoc.toLowerCase()===l.toLowerCase()?'#7c3aed':'var(--bg,#f0f0f2)',border:'none',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{l}{detectedCity&&l===detectedCity?' 📍':''}</button>))}</div></>}{type==='hotel'&&<><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Destination"><I placeholder="City, hotel, or address"/></L></div><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Check-in"><I type="date"/></L><L l="Check-out"><I type="date"/></L><L l="Guests"><Se><option>2</option><option>1</option><option>3</option><option>4</option></Se></L></div></>}{type==='travel'&&<><div style={{display:'flex',gap:8,marginBottom:10}}><L l="From"><I defaultValue="DFW" placeholder="City or airport"/></L><L l="To"><I placeholder="City or airport"/></L></div><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Depart"><I type="date"/></L><L l="Return"><I type="date"/></L><L l="Passengers"><Se><option>1</option><option>2</option><option>3</option></Se></L></div></>}{type==='cruise'&&<><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Destination"><Se><option>Caribbean</option><option>Mediterranean</option><option>Alaska</option><option>Bahamas</option></Se></L><L l="Duration"><Se><option>3–5 Nights</option><option>7 Nights</option><option>10–14 Nights</option></Se></L></div><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Depart From"><I defaultValue="Galveston, TX"/></L><L l="Month"><Se><option>March</option><option>April</option><option>May</option><option>June</option></Se></L></div></>}{type==='airbnb'&&<><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Where"><I placeholder="City, region, or neighborhood"/></L></div><div style={{display:'flex',gap:8,marginBottom:10}}><L l="Check-in"><I type="date"/></L><L l="Check-out"><I type="date"/></L><L l="Type"><Se><option>Any</option><option>Entire Place</option><option>Unique Stays</option><option>Beachfront</option></Se></L></div></>}<button onClick={search} style={{width:'100%',padding:12,background:btnC[type],color:'#fff',border:0,borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'inherit',marginTop:4,letterSpacing:0.3,transition:'all .2s',boxShadow:`0 2px 8px ${btnC[type]}40`}}>{type==='activity'?'🎫 Find Activities':'🔍 Compare Prices'}</button>{loading&&<div style={{textAlign:'center',padding:20,color:'var(--muted,#86868b)',fontSize:13}}>🔄 Searching{type==='activity'?' activities':''}...</div>}{type==='activity'&&actResults&&<div style={{marginTop:14}}><div style={{fontSize:11,fontWeight:700,color:'var(--muted,#86868b)',marginBottom:8,textTransform:'uppercase',letterSpacing:0.5}}>{actResults.length} activities found{actLoc?` in ${actLoc}`:''}</div>{actResults.length===0?<div style={{textAlign:'center',padding:20,color:'var(--muted,#86868b)',fontSize:13}}>No activities found — try a different city or category</div>:actResults.map((a,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:`1px solid ${i===0?'var(--green,#10b981)':'var(--border,#e5e5ea)'}`,borderRadius:10,marginBottom:4,background:i===0?'rgba(16,185,129,0.05)':'transparent',cursor:'pointer',transition:'all .15s'}} onMouseEnter={e=>{if(i!==0)e.currentTarget.style.background='rgba(0,0,0,0.02)'}} onMouseLeave={e=>{if(i!==0)e.currentTarget.style.background='transparent'}}><span style={{fontSize:20}}>{a.t.split(' ')[0]}</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:'var(--text,#1d1d1f)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.t.substring(a.t.indexOf(' ')+1)}</div><div style={{fontSize:11,color:'var(--muted,#86868b)',marginTop:2}}>{a.s} · {a.d} · ⭐ {a.r}</div></div><div style={{textAlign:'right',flexShrink:0}}><div style={{fontFamily:'var(--font-display,Georgia)',fontWeight:800,fontSize:16,color:i===0?'var(--green,#10b981)':'var(--text,#1d1d1f)'}}>{getCurrencySymbol(detectUserCountry())}{convertPrice(a.p,detectUserCountry())}</div>{i===0&&<span style={{fontSize:8,fontWeight:800,background:'var(--green,#10b981)',color:'#fff',padding:'2px 8px',borderRadius:20}}>BEST</span>}</div><button style={{padding:'6px 14px',background:i===0?'var(--green,#10b981)':'var(--accent,#0066cc)',color:'#fff',border:0,borderRadius:8,fontWeight:600,fontSize:11,cursor:'pointer',fontFamily:'inherit',flexShrink:0}} onClick={()=>window.open(a.aff||'#','_blank')}>Book</button></div>))}</div>}{type!=='activity'&&results&&<div style={{marginTop:14}}><div style={{fontSize:11,fontWeight:600,color:'var(--muted,#86868b)',marginBottom:6,textTransform:'uppercase'}}>Results:</div>{results.map((r,i)=>(<div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',border:`1px solid ${i===0?'#34c759':'var(--border,#e5e5ea)'}`,borderRadius:6,marginBottom:3,background:i===0?'#e8f8ee':'transparent',cursor:'pointer'}}><span style={{fontWeight:600,fontSize:12,color:'var(--text-secondary,#424245)',minWidth:120}}>{r.s}</span><span style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontFamily:'var(--font-display,Georgia)',fontWeight:700,fontSize:16,color:i===0?'#34c759':'var(--text,#1d1d1f)'}}>{getCurrencySymbol(detectUserCountry())}{convertPrice(r.p,detectUserCountry())}{unit}</span>{i===0&&<span style={{fontSize:9,fontWeight:700,background:'#34c759',color:'#fff',padding:'2px 8px',borderRadius:20}}>CHEAPEST</span>}<button style={{padding:'5px 14px',background:i===0?'#34c759':'#0066cc',color:'#fff',border:0,borderRadius:5,fontWeight:600,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Book</button></span></div>))}</div>}</div>)}

// ============================================
// COMPARE PANEL — CamelCamelCamel-style side-by-side
// ============================================

function ComparePanel({deals,onClose}){
  const [selected,setSelected]=useState([]);
  const [search,setSearch]=useState('');
  const filtered=deals.filter(d=>d.title.toLowerCase().includes(search.toLowerCase())||d.store.toLowerCase().includes(search.toLowerCase())).slice(0,20);
  const toggle=(d)=>{if(selected.find(s=>s.id===d.id)){setSelected(selected.filter(s=>s.id!==d.id))}else if(selected.length<4){setSelected([...selected,d])}};
  const isSel=(d)=>selected.some(s=>s.id===d.id);

  // Collect all stores across selected deals
  const allStores=[...new Set(selected.flatMap(d=>(d.prices||[]).map(p=>p.s)))];

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',zIndex:300,display:'grid',placeItems:'center',padding:20,animation:'fadeUp 0.3s ease'}} onClick={onClose}>
      <div style={{background:'var(--card)',borderRadius:20,width:'100%',maxWidth:1100,maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.2)',animation:'slideDown 0.3s ease'}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'var(--card)',zIndex:1,borderRadius:'20px 20px 0 0'}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,fontFamily:'var(--font-display)',color:'var(--text)',margin:0}}>Compare Prices</h2>
            <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Select up to 4 products to compare side-by-side</p>
          </div>
          <button onClick={onClose} style={{width:36,height:36,borderRadius:10,background:'var(--bg)',border:'none',cursor:'pointer',fontSize:18,display:'grid',placeItems:'center',color:'var(--muted)',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--red)';e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--bg)';e.currentTarget.style.color='var(--muted)'}}>✕</button>
        </div>

        {/* Search to add products */}
        <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)',background:'var(--bg)'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products to compare..." style={{width:'100%',padding:'10px 16px',border:'2px solid var(--border)',borderRadius:12,fontSize:14,fontFamily:'inherit',outline:'none',background:'var(--card)',transition:'all .2s'}}/>
          {search&&<div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10,maxHeight:150,overflowY:'auto'}}>
            {filtered.map(d=>(
              <button key={d.id} onClick={()=>toggle(d)} style={{padding:'6px 14px',borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${isSel(d)?'var(--accent)':'var(--border)'}`,background:isSel(d)?'var(--accent-light)':'var(--card)',color:isSel(d)?'var(--accent)':'var(--text-secondary)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s',display:'flex',alignItems:'center',gap:4}}>
                {isSel(d)?'✓':''} {d.em} {d.title.substring(0,40)}{d.title.length>40?'...':''}
              </button>
            ))}
          </div>}
          {!search&&selected.length===0&&<div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
            <span style={{fontSize:11,color:'var(--muted)',fontWeight:500}}>Quick picks:</span>
            {deals.filter(d=>d.tags.includes('hot')).slice(0,8).map(d=>(
              <button key={d.id} onClick={()=>toggle(d)} style={{padding:'5px 12px',borderRadius:20,fontSize:10,fontWeight:600,border:'1px solid var(--border)',background:'var(--card)',color:'var(--text-secondary)',cursor:'pointer',fontFamily:'inherit'}}>
                {d.em} {d.title.substring(0,30)}...
              </button>
            ))}
          </div>}
        </div>

        {/* Side-by-side comparison */}
        {selected.length>0?(
          <div style={{padding:24,overflowX:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:`180px repeat(${selected.length},1fr)`,gap:0,minWidth:selected.length>2?800:0}}>

              {/* Row: Product Images */}
              <div style={{padding:'12px 0',fontWeight:700,fontSize:12,color:'var(--muted)',display:'flex',alignItems:'end',textTransform:'uppercase',letterSpacing:0.5}}>Product</div>
              {selected.map(d=>(
                <div key={d.id} style={{padding:12,textAlign:'center',borderLeft:'1px solid var(--border)'}}>
                  <div style={{width:80,height:80,borderRadius:14,overflow:'hidden',margin:'0 auto 10px',boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
                    <img src={d.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    <div style={{position:'relative',top:-80,height:80,display:'grid',placeItems:'center',fontSize:32,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{d.em}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--text)',lineHeight:1.3}}>{d.title.substring(0,50)}{d.title.length>50?'...':''}</div>
                  <button onClick={()=>toggle(d)} style={{marginTop:6,fontSize:10,color:'var(--red)',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>✕ Remove</button>
                </div>
              ))}

              {/* Row: Best Price */}
              <div style={{padding:'14px 0',fontWeight:700,fontSize:12,color:'var(--muted)',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',textTransform:'uppercase',letterSpacing:0.5}}>Best Price</div>
              {selected.map(d=>{
                const best=d.prices?.length?Math.min(...d.prices.map(p=>p.p)):d.price;
                return(
                  <div key={d.id} style={{padding:14,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)',background:'rgba(16,185,129,0.04)'}}>
                    <span style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900,color:'var(--green)'}}>${best}</span>
                    {d.orig>0&&<div><span style={{fontSize:13,color:'var(--muted)',textDecoration:'line-through'}}>${d.orig}</span> <span style={{fontSize:11,fontWeight:800,color:'var(--red)',background:'rgba(239,68,68,0.08)',padding:'2px 8px',borderRadius:20}}>-{d.off}%</span></div>}
                  </div>
                );
              })}

              {/* Row: Store */}
              <div style={{padding:'14px 0',fontWeight:700,fontSize:12,color:'var(--muted)',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',textTransform:'uppercase',letterSpacing:0.5}}>Store</div>
              {selected.map(d=>(
                <div key={d.id} style={{padding:14,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:d.sc,display:'inline-block'}}></span>
                    <span style={{fontSize:13,fontWeight:700}}>{d.store}</span>
                  </div>
                </div>
              ))}

              {/* Row: Savings */}
              <div style={{padding:'14px 0',fontWeight:700,fontSize:12,color:'var(--muted)',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',textTransform:'uppercase',letterSpacing:0.5}}>You Save</div>
              {selected.map(d=>(
                <div key={d.id} style={{padding:14,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)'}}>
                  <span style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:900,color:'var(--green)'}}>${d.orig-d.price}</span>
                </div>
              ))}

              {/* Row: Votes / Popularity */}
              <div style={{padding:'14px 0',fontWeight:700,fontSize:12,color:'var(--muted)',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',textTransform:'uppercase',letterSpacing:0.5}}>Popularity</div>
              {selected.map(d=>(
                <div key={d.id} style={{padding:14,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)'}}>
                  <span style={{fontSize:15,fontWeight:800,color:'var(--accent)'}}>{d.votes.toLocaleString()}</span>
                  <span style={{fontSize:11,color:'var(--muted)',marginLeft:4}}>votes</span>
                </div>
              ))}

              {/* Row: Shipping */}
              <div style={{padding:'14px 0',fontWeight:700,fontSize:12,color:'var(--muted)',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',textTransform:'uppercase',letterSpacing:0.5}}>Shipping</div>
              {selected.map(d=>(
                <div key={d.id} style={{padding:14,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)'}}>
                  <span style={{fontSize:12,color:d.ship?.toLowerCase().includes('free')?'var(--green)':'var(--text-secondary)',fontWeight:600}}>{d.ship||'Standard'}</span>
                </div>
              ))}

              {/* Rows: Price at each store */}
              {allStores.length>0&&<>
                <div style={{padding:'14px 0',fontWeight:700,fontSize:12,color:'var(--accent)',borderTop:'2px solid var(--accent)',display:'flex',alignItems:'center',textTransform:'uppercase',letterSpacing:0.5}}>Store Prices</div>
                {selected.map(d=>(
                  <div key={d.id} style={{padding:14,borderLeft:'1px solid var(--border)',borderTop:'2px solid var(--accent)',fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',textAlign:'center'}}>Compare</div>
                ))}
                {allStores.map(store=>(
                  <React.Fragment key={store}>
                    <div style={{padding:'10px 0',fontSize:12,fontWeight:600,color:'var(--text-secondary)',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center'}}>{store}</div>
                    {selected.map(d=>{
                      const sp=d.prices?.find(p=>p.s===store);
                      const isBest=sp&&d.prices&&sp.p===Math.min(...d.prices.map(p=>p.p));
                      return(
                        <div key={d.id} style={{padding:10,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)',background:isBest?'rgba(16,185,129,0.06)':'transparent'}}>
                          {sp?(
                            <span style={{fontFamily:'var(--font-mono)',fontSize:14,fontWeight:700,color:isBest?'var(--green)':'var(--text)'}}>
                              ${sp.p}{isBest&&<span style={{fontSize:8,fontWeight:800,background:'var(--green)',color:'#fff',padding:'2px 6px',borderRadius:20,marginLeft:4}}>BEST</span>}
                            </span>
                          ):(
                            <span style={{fontSize:12,color:'var(--muted)'}}>—</span>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </>}

              {/* Row: Action buttons */}
              <div style={{padding:'16px 0',borderTop:'1px solid var(--border)'}}></div>
              {selected.map(d=>(
                <div key={d.id} style={{padding:16,textAlign:'center',borderLeft:'1px solid var(--border)',borderTop:'1px solid var(--border)'}}>
                  <button onClick={()=>window.open(d.aff||'#','_blank')} style={{padding:'10px 24px',background:'var(--accent)',color:'#fff',border:0,borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 2px 8px rgba(26,115,232,0.25)',transition:'all .2s'}}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>Get Deal</button>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div style={{padding:'60px 24px',textAlign:'center',color:'var(--muted)'}}>
            <div style={{fontSize:48,marginBottom:12}}>⚖️</div>
            <div style={{fontSize:15,fontWeight:600}}>Search above to add products</div>
            <div style={{fontSize:12,marginTop:4}}>Compare prices across stores side-by-side</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP — Redesigned Premium Layout
// ============================================

export default function App(){
  const[tab,setTab]=useState('all');const[sort,setSort]=useState('Popular');const[query,setQuery]=useState('');const[alerts,setAlerts]=useState([]);const[alertKw,setAlertKw]=useState('');const[alertPr,setAlertPr]=useState('');const[alertEm,setAlertEm]=useState('');const[toast,setToast]=useState('');const[liveDeals,setLiveDeals]=useState(null);const[loading,setLoading]=useState(false);const[lastRefresh,setLastRefresh]=useState(null);const[userCountry,setUserCountry]=useState(detectUserCountry());const[showCompare,setShowCompare]=useState(false);const[detectedCity]=useState(detectUserCity());

  useEffect(()=>{if(!API_URL)return;const fetchDeals=async()=>{setLoading(true);try{const r=await fetch(`${API_URL}/api/deals?country=${userCountry}`);const j=await r.json();if(j.deals?.length)setLiveDeals(j.deals.map((d,i)=>({id:d.id||i,cat:d.cat||d.category||'retail',store:d.store||'Store',sc:d.sc||d.store_color||'#666',img:d.img||d.image_url||P(d.title?.substring(0,20)||'deal'),em:d.em||d.emoji||'📦',title:d.title||'Deal',price:d.price||0,orig:d.orig||d.original_price||0,off:d.off||d.discount_percent||0,votes:d.votes||0,time:d.time||d.time_ago||'now',comments:d.comments||0,tags:d.tags||[],ship:d.ship||d.shipping_info||'',aff:d.url||d.affiliate_url||'#',prices:d.prices||[],loc:d.location||d.loc,dt:d.dates,stars:d.star_rating,amen:d.amenities,route:d.route,airline:d.airline,stops:d.stops})));setLastRefresh(new Date())}catch(e){console.error('Fetch failed:',e)}finally{setLoading(false)}};fetchDeals();const iv=setInterval(fetchDeals,120000);return()=>clearInterval(iv)},[tab,sort,userCountry]);

  const allDeals=liveDeals||D;
  const showToast=useCallback(m=>{setToast(m);setTimeout(()=>setToast(''),3500)},[]);
  const counts=useMemo(()=>{const c={};TABS.forEach(t=>{c[t.key]=t.key==='all'?allDeals.length:t.key==='hot'?allDeals.filter(d=>(d.tags||[]).includes('hot')).length:allDeals.filter(d=>d.cat===t.key).length});return c},[allDeals]);
  const filtered=useMemo(()=>{let f=tab==='all'?[...allDeals]:tab==='hot'?allDeals.filter(d=>(d.tags||[]).includes('hot')):allDeals.filter(d=>d.cat===tab);if(query)f=f.filter(d=>d.title.toLowerCase().includes(query.toLowerCase())||d.store.toLowerCase().includes(query.toLowerCase())||(d.loc||'').toLowerCase().includes(query.toLowerCase()));switch(sort){case'Popular':f.sort((a,b)=>b.votes-a.votes);break;case'Biggest Savings':f.sort((a,b)=>b.off-a.off);break;case'Price Low':f.sort((a,b)=>a.price-b.price);break;case'Price High':f.sort((a,b)=>b.price-a.price);break;default:break}return f},[tab,sort,query,allDeals]);
  const trending=useMemo(()=>[...allDeals].sort((a,b)=>b.votes-a.votes).slice(0,10),[allDeals]);
  const addAlert=useCallback(()=>{if(!alertKw){showToast('Enter a keyword');return}if(!alertEm){showToast('Enter email');return}setAlerts(p=>[...p,{id:Date.now(),kw:alertKw,pr:alertPr||'Any',em:alertEm}]);showToast(`Alert set for "${alertKw}"`);setAlertKw('');setAlertPr('')},[alertKw,alertPr,alertEm,showToast]);
  const quickAlert=useCallback(d=>{const kw=d.title.substring(0,35);const i=alerts.findIndex(a=>a.kw===kw);if(i>=0){setAlerts(p=>p.filter((_,j)=>j!==i));showToast('Removed');return}setAlerts(p=>[...p,{id:Date.now(),kw,pr:Math.floor(d.price*.9),em:alertEm||'you@email.com'}]);showToast(`Watching below $${Math.floor(d.price*.9)}`)},[alerts,alertEm,showToast]);
  const isWatching=useCallback(d=>alerts.some(a=>a.kw===d.title.substring(0,35)),[alerts]);

  return(
<div style={{fontFamily:'var(--font-body)',background:'var(--bg)',minHeight:'100vh',color:'var(--text)'}}>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
:root {
  --font-body: 'Outfit', system-ui, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
  --bg: #f8f9fb;
  --card: #ffffff;
  --border: #e8ecf1;
  --text: #0f172a;
  --text-secondary: #475569;
  --muted: #94a3b8;
  --accent: #1a73e8;
  --accent-light: #e8f0fe;
  --green: #10b981;
  --red: #ef4444;
  --orange: #f59e0b;
}
* { box-sizing: border-box; margin: 0; }
body { background: var(--bg); }
.ph-grid{display:grid;grid-template-columns:1fr 340px;gap:24px;max-width:1240px;margin:0 auto;padding:20px 24px}
@media(max-width:960px){.ph-grid{grid-template-columns:1fr}}
@media(max-width:600px){.ph-grid{padding:12px}}
.deal-card { animation: fadeUp 0.4s ease both; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }
@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
input:focus, select:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(26,115,232,0.1) !important; }
.trend-row:hover { background: var(--accent-light); }
`}</style>

{/* ========== HEADER ========== */}
<div style={{background:'var(--card)',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:200,backdropFilter:'blur(12px)',backgroundColor:'rgba(255,255,255,0.92)'}}>
  <div style={{maxWidth:1240,margin:'0 auto',padding:'12px 24px',display:'flex',alignItems:'center',gap:16}}>
    <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
      <div style={{width:38,height:38,background:'linear-gradient(135deg,#1a73e8,#4a9af5)',borderRadius:10,display:'grid',placeItems:'center',color:'#fff',fontSize:18,boxShadow:'0 2px 8px rgba(26,115,232,0.3)'}}>🏷️</div>
      <div>
        <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900,letterSpacing:'-0.02em'}}>Snag<span style={{color:'var(--accent)'}}>Deals</span></span>
        {API_URL&&<span style={{fontSize:8,padding:'2px 8px',borderRadius:20,marginLeft:8,background:loading?'var(--orange)':'var(--green)',color:'#fff',fontWeight:700,letterSpacing:0.5,textTransform:'uppercase',verticalAlign:'middle'}}>{loading?'syncing':'live'}</span>}
      </div>
    </div>
    <div style={{flex:'1 1 200px',minWidth:0,maxWidth:420,position:'relative'}}>
      <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',fontSize:14,pointerEvents:'none'}}>🔍</span>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search deals, stores..." style={{width:'100%',padding:'10px 16px 10px 40px',border:'2px solid var(--border)',borderRadius:12,fontSize:14,fontFamily:'inherit',color:'var(--text)',background:'var(--bg)',outline:'none',transition:'all .2s'}}/>
    </div>
    <button onClick={()=>setShowCompare(true)} style={{padding:'9px 16px',borderRadius:10,fontWeight:700,fontSize:13,color:'#f59e0b',background:'#fef3c7',border:'none',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0,transition:'all .15s',letterSpacing:0.3}}
      onMouseEnter={e=>{e.currentTarget.style.background='#f59e0b';e.currentTarget.style.color='#fff'}}
      onMouseLeave={e=>{e.currentTarget.style.background='#fef3c7';e.currentTarget.style.color='#f59e0b'}}>
      ⚖️ Compare
    </button>
    <button onClick={()=>document.getElementById('alerts')?.scrollIntoView({behavior:'smooth'})} style={{padding:'9px 16px',borderRadius:10,fontWeight:700,fontSize:13,color:'var(--accent)',background:'var(--accent-light)',border:'none',cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0,transition:'all .15s',letterSpacing:0.3}}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--accent)';e.currentTarget.style.color='#fff'}}
      onMouseLeave={e=>{e.currentTarget.style.background='var(--accent-light)';e.currentTarget.style.color='var(--accent)'}}>
      🔔 Alerts{alerts.length>0&&<span style={{background:'var(--accent)',color:'#fff',fontSize:10,padding:'1px 7px',borderRadius:20,marginLeft:6,fontWeight:800}}>{alerts.length}</span>}
    </button>
  </div>
</div>

{/* ========== CATEGORY TABS — Wrapped Rows ========== */}
<div style={{background:'var(--card)',borderBottom:'1px solid var(--border)'}}>
  <div style={{maxWidth:1240,margin:'0 auto',padding:'10px 24px 6px',display:'flex',flexWrap:'wrap',gap:4}}>
    {TABS.map(t=>(
      <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'7px 14px',fontWeight:tab===t.key?700:500,fontSize:12,color:tab===t.key?'#fff':'var(--text-secondary)',background:tab===t.key?'var(--accent)':'transparent',border:tab===t.key?'none':'1px solid transparent',borderRadius:20,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4,transition:'all .2s',letterSpacing:0.2}}
        onMouseEnter={e=>{if(tab!==t.key){e.currentTarget.style.background='var(--accent-light)';e.currentTarget.style.color='var(--accent)'}}}
        onMouseLeave={e=>{if(tab!==t.key){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-secondary)'}}}>
        {t.icon} {t.label}
        <span style={{fontSize:10,background:tab===t.key?'rgba(255,255,255,0.25)':'var(--bg)',padding:'1px 8px',borderRadius:20,fontWeight:700,color:tab===t.key?'#fff':'var(--muted)'}}>{counts[t.key]}</span>
      </button>
    ))}
  </div>
</div>

{/* ========== MAIN CONTENT ========== */}
<div className="ph-grid">
  {/* LEFT: Deals Feed */}
  <div>
    {['hotel','travel','cruise','airbnb','activity'].includes(tab)&&<SearchPanel type={tab} detectedCity={tab==='activity'?detectedCity:undefined}/>}

    {/* Sort Bar */}
    <div style={{display:'flex',gap:6,padding:'8px 0 12px',flexWrap:'wrap',alignItems:'center'}}>
      <span style={{fontSize:11,fontWeight:600,color:'var(--muted)',marginRight:4,textTransform:'uppercase',letterSpacing:0.5}}>Sort</span>
      {SORTS.map(s=>(
        <button key={s} onClick={()=>setSort(s)} style={{padding:'6px 14px',borderRadius:20,fontWeight:sort===s?700:500,fontSize:11,color:sort===s?'var(--accent)':'var(--muted)',background:sort===s?'var(--accent-light)':'var(--card)',border:`1px solid ${sort===s?'var(--accent)':'var(--border)'}`,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',letterSpacing:0.2}}>{s}</button>
      ))}
      <span style={{marginLeft:'auto',fontSize:12,color:'var(--muted)',fontWeight:500}}>{filtered.length} deals</span>
    </div>

    {/* Deals List */}
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {loading&&<div style={{textAlign:'center',padding:40}}><div style={{display:'inline-block',width:32,height:32,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{fontSize:12,color:'var(--muted)',marginTop:8}}>Refreshing deals...</div></div>}
      {!loading&&filtered.length===0&&query.trim().length>0?<ProductSearch query={query} showToast={showToast}/>:!loading&&filtered.length===0?<div style={{textAlign:'center',padding:80,color:'var(--muted)',fontSize:14}}>No deals in this category yet</div>:null}
      {filtered.map((d,i)=><DealCard key={d.id} d={d} idx={i} onAlert={quickAlert} watching={isWatching(d)}/>)}
    </div>
  </div>

  {/* RIGHT: Sidebar */}
  <div style={{display:'flex',flexDirection:'column',gap:16}}>

    {/* Price Alerts Card */}
    <div id="alerts" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20,animation:'slideDown 0.4s ease'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
        <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,var(--accent),#4a9af5)',display:'grid',placeItems:'center',fontSize:14}}>🔔</div>
        <div>
          <h3 style={{fontSize:15,fontWeight:800,color:'var(--text)',letterSpacing:'-0.01em'}}>Price Alerts</h3>
          <p style={{fontSize:11,color:'var(--muted)',marginTop:1}}>Get notified on drops</p>
        </div>
      </div>
      <input value={alertKw} onChange={e=>setAlertKw(e.target.value)} placeholder="Product, hotel, flight..." style={{width:'100%',padding:'10px 14px',border:'2px solid var(--border)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',marginBottom:8,background:'var(--bg)',transition:'all .2s'}}/>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input value={alertPr} onChange={e=>setAlertPr(e.target.value)} type="number" placeholder="Max price ($)" style={{flex:1,padding:'10px 14px',border:'2px solid var(--border)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',background:'var(--bg)',transition:'all .2s'}}/>
      </div>
      <input value={alertEm} onChange={e=>setAlertEm(e.target.value)} type="email" placeholder="your@email.com" style={{width:'100%',padding:'10px 14px',border:'2px solid var(--border)',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',marginBottom:10,background:'var(--bg)',transition:'all .2s'}}/>
      <button onClick={addAlert} style={{width:'100%',padding:12,background:'linear-gradient(135deg,var(--accent),#0d47a1)',color:'#fff',border:0,borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit',letterSpacing:0.3,transition:'all .2s',boxShadow:'0 2px 8px rgba(26,115,232,0.25)'}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(26,115,232,0.4)'}
        onMouseLeave={e=>e.currentTarget.style.boxShadow='0 2px 8px rgba(26,115,232,0.25)'}>Create Alert</button>
      {alerts.length>0&&<div style={{marginTop:12,display:'flex',flexDirection:'column',gap:4}}>
        {alerts.map((a,i)=>(
          <div key={a.id} style={{display:'flex',alignItems:'center',padding:'8px 12px',background:'var(--bg)',borderRadius:10,fontSize:12,gap:6,animation:'slideDown 0.3s ease'}}>
            <span style={{fontWeight:700,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text)'}}>🔔 {a.kw}</span>
            <span style={{color:'var(--green)',fontWeight:700,whiteSpace:'nowrap',fontFamily:'var(--font-mono)',fontSize:11}}>{a.pr!=='Any'?`<$${a.pr}`:'Any'}</span>
            <button onClick={()=>{setAlerts(p=>p.filter((_,j)=>j!==i));showToast('Removed')}} style={{background:'transparent',border:0,color:'var(--muted)',cursor:'pointer',fontSize:14,padding:2,lineHeight:1}}>✕</button>
          </div>
        ))}
      </div>}
    </div>

    {/* Trending Card */}
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20,animation:'slideDown 0.5s ease'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
        <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#f59e0b,#f97316)',display:'grid',placeItems:'center',fontSize:14}}>📈</div>
        <h3 style={{fontSize:15,fontWeight:800,color:'var(--text)',letterSpacing:'-0.01em'}}>Trending Now</h3>
      </div>
      {trending.map((d,i)=>(
        <div key={d.id} className="trend-row" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 8px',borderRadius:8,cursor:'pointer',transition:'background .15s'}}>
          <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:14,color:i<3?'var(--accent)':'var(--muted)',minWidth:22,textAlign:'center'}}>{i+1}</span>
          <span style={{fontSize:12,color:'var(--text-secondary)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500}}>{d.title}</span>
          <span style={{fontSize:12,fontWeight:800,color:'var(--green)',whiteSpace:'nowrap',fontFamily:'var(--font-mono)'}}>{d.price>0?`$${d.price}`:''}</span>
        </div>
      ))}
    </div>

    {/* Stats Card */}
    <div style={{background:'linear-gradient(135deg,var(--accent),#0d47a1)',borderRadius:16,padding:20,color:'#fff'}}>
      <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,opacity:0.7,marginBottom:10}}>Deal Stats</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900}}>{allDeals.length}</div><div style={{fontSize:11,opacity:0.7}}>Active Deals</div></div>
        <div><div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900}}>{allDeals.filter(d=>d.off>=40).length}</div><div style={{fontSize:11,opacity:0.7}}>40%+ Off</div></div>
        <div><div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900}}>{[...new Set(allDeals.map(d=>d.store))].length}</div><div style={{fontSize:11,opacity:0.7}}>Stores</div></div>
        <div><div style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:900}}>{allDeals.filter(d=>d.tags.includes('hot')).length}</div><div style={{fontSize:11,opacity:0.7}}>Hot Deals</div></div>
      </div>
    </div>

  </div>
</div>

{/* Compare Panel Modal */}
{showCompare&&<ComparePanel deals={allDeals} onClose={()=>setShowCompare(false)}/>}

{/* Toast */}
{toast&&<div style={{position:'fixed',bottom:24,right:24,background:'var(--text)',color:'#fff',padding:'14px 24px',borderRadius:14,fontWeight:600,fontSize:13,boxShadow:'0 12px 40px rgba(0,0,0,.2)',zIndex:999,maxWidth:400,animation:'slideDown 0.3s ease',backdropFilter:'blur(8px)'}}>{toast}</div>}

{/* Footer */}
<div style={{maxWidth:1240,margin:'48px auto 0',padding:'28px 24px',borderTop:'1px solid var(--border)',textAlign:'center'}}>
  <div style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:800,marginBottom:6}}>Snag<span style={{color:'var(--accent)'}}>Deals</span> 🏷️</div>
  <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.8,maxWidth:600,margin:'0 auto'}}>Compare prices across Amazon, Walmart, Target, Costco, Booking.com, Airbnb & 50+ stores. Affiliate disclosure: We earn commissions at no extra cost to you. © 2026</p>
</div>
</div>
  );
}
