// ====== Products & Reviews ======
const PRODUCTS = [
  {id:'zobo', name:'Zobo Drink', price:500, img:'images/f98a704643dd26a0d185db19601878bc.jpg', desc:'Ginger-kissed, pineapple-bright — irresistibly refreshing.'},
  {id:'tigernut', name:'Tiger Nut', price:1500, img:'images/9189622fa4e81d07f281ae3a16e0c95a.jpg', desc:'Creamy blend of tiger nuts, dates, and coconut.'},
  {id:'yogurt', name:'Yogurt', price:1500, img:'images/d7aadf82326c361e5c2c2f028c8e6538.jpg', desc:'Thick & creamy probiotic goodness.'},
  {id:'parfait', name:'Parfait', price:2000, img:'images/aec6160705777f5bd69928a281767a2a.jpg', desc:'Granola crunch, creamy yogurt, juicy fruits.'},
  {id:'smoothie', name:'Smoothie', price:1500, img:'images/ecd0d19bf34ae071e2f7865d2ae005e1.jpg', desc:'Mango, banana, berries — pick your mood.'},
  {id:'juice', name:'Fruit Juice', price:1000, img:'images/b33c24ddd7c4fe45f4bb6f71d37e32e1.jpg', desc:'Pressed & pure. Nothing else.'}
];

const REVIEWS = [
  {name:'Amaka O.', text:'Zobo is elite! Balanced spice and sweetness. Love it chilled.'},
  {name:'Bola T.', text:'Tiger nut drink is so creamy — zero guilt, pure joy.'},
  {name:'Tomi A.', text:'Parfaits are a hit at my office. Fresh, crunchy, perfect.'},
  {name:'Chinedu K.', text:'Fast WhatsApp order and delivery. Smoothie slapped!'},
  {name:'Mary J.', text:'Yogurt tastes homemade — rich and clean.'},
  {name:'Ibrahim S.', text:'Fruit juice is 100% real. No funny aftertaste.'}
];

const money = n => `₦${n.toLocaleString()}`;

// Inject Products
const catalogEl = document.getElementById('catalog');
if (catalogEl) {
  catalogEl.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <img alt="${p.name}" src="${p.img}"/>
      <div class="card__body">
        <div class="badge">${p.name}</div>
        <h3 style="margin:8px 0 6px">${p.desc}</h3>
        <div class="price">${money(p.price)}</div>
        <div class="card__row">
          <div class="qty">
            <button class="chip" onclick="updateQty('${p.id}',-1)">−</button>
            <span id="qty-${p.id}">0</span>
            <button class="chip" onclick="updateQty('${p.id}',1)">+</button>
          </div>
          <button class="add" onclick="addToCart('${p.id}')">Add</button>
        </div>
      </div>
    </article>
  `).join('');
}

// Inject Reviews
const reviewsEl = document.getElementById('reviews');
if (reviewsEl) {
  reviewsEl.innerHTML = REVIEWS.map(r => `
    <div class="review">
      <h4 style="margin:0 0 6px">${r.name}</h4>
      <p style="margin:0">“${r.text}”</p>
    </div>
  `).join('');
}

// Cart state
    const cart = new Map();

    function updateQty(id, delta){
      const span = document.getElementById('qty-'+id);
      const next = Math.max(0, (parseInt(span.textContent)||0) + delta);
      span.textContent = next;
    }

    function addToCart(id){
      const prod = PRODUCTS.find(p=>p.id===id);
      const qtySpan = document.getElementById('qty-'+id);
      const qty = Math.max(1, parseInt(qtySpan.textContent)||1);
      const item = cart.get(id) || {product:prod, qty:0};
      item.qty += qty;
      cart.set(id, item);
      qtySpan.textContent = 0;
      renderCart();
      pulseCart();
    }

      // Drawer controls
  const drawer = document.getElementById('cartDrawer');
  const openBtn = document.getElementById('openCart');
  const cartCount = document.getElementById('cartCount');
  const backBtn = document.getElementById('backToShop');

  openBtn.addEventListener('click', () => drawer.classList.toggle('open'));
  backBtn.addEventListener('click', () => drawer.classList.remove('open'));

  function pulseCart() {
    openBtn.style.transform = 'scale(1.05)';
    setTimeout(() => (openBtn.style.transform = 'scale(1)'), 150);
  }

  function renderCart() {
    const main = document.getElementById('cartItems');
    if (cart.size === 0) {
      main.innerHTML = '<div style="padding:16px" class="small">Your cart is empty.</div>';
    } else {
      main.innerHTML = Array.from(cart.values())
        .map(
          ({ product, qty }) => `
          <div class="cart-item"> 
            <img src="${product.img}" alt="${product.name}"/>
            <div>
              <strong>${product.name}</strong>
              <div class="small">${money(product.price)} each</div>
            </div>
            <div class="qty">
              <button class="chip" onclick="cartDec('${product.id}')">−</button>
              <span>${qty}</span>
              <button class="chip" onclick="cartInc('${product.id}')">+</button>
            </div>
          </div>
        `
        )
        .join('');
    }
    const totals = calcTotals();
    document.getElementById('subTotal').textContent = money(totals.subtotal);
    document.getElementById('discount').textContent = totals.discount
      ? `- ${money(totals.discount)}`
      : '− ₦0';
    document.getElementById('grandTotal').textContent = money(totals.total);
    cartCount.textContent = totals.items;
  }

  function cartInc(id) {
    const it = cart.get(id);
    it.qty++;
    renderCart();
  }
  function cartDec(id) {
    const it = cart.get(id);
    it.qty--;
    if (it.qty <= 0) cart.delete(id);
    renderCart();
  }

 // Promo: every 5 items => +10% off (stacks)
    function calcTotals(){
      let items=0, subtotal=0;
      cart.forEach(({product, qty})=>{ items+=qty; subtotal += product.price*qty; });
      const blocks = Math.floor(items/5);
      const discount = blocks>0 ? Math.min(subtotal * 0.10 * blocks, subtotal) : 0;
      const total = Math.max(0, Math.round(subtotal - discount));
      return {items, subtotal: Math.round(subtotal), discount: Math.round(discount), total};
    }

    // Checkout via WhatsApp summary
    document.getElementById('checkoutBtn').addEventListener('click', ()=>{
      if(cart.size===0){alert('Your cart is empty.'); return;}
      const lines = [];
      cart.forEach(({product, qty})=> lines.push(`${product.name} × ${qty} = ${money(product.price*qty)}`));
      const t = calcTotals();
      lines.push(`Subtotal: ${money(t.subtotal)}`);
      if(t.discount>0) lines.push(`Promo Discount: -${money(t.discount)}`);
      lines.push(`Total: ${money(t.total)}`);
      const msg = `Hello Joy's Mix! I would like to order:\n\n${lines.join('\n')}\n\nDelivery details:`;
      const url = 'https://wa.me/2347039812009?text=' + encodeURIComponent(msg);
      window.open(url,'_blank');
    });

// ====== Hero Carousel ======
const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dotsWrap = document.getElementById('heroDots');
let slideIndex = 0;
let timer;

function renderDots(){
  if(!dotsWrap || slides.length<=1) return;
  dotsWrap.innerHTML = slides.map((_, i)=> `<button data-dot="${i}" aria-label="Go to slide ${i+1}"></button>`).join('');
  dotsWrap.addEventListener('click', e=>{
    const b = e.target.closest('button[data-dot]');
    if(!b) return;
    goTo(parseInt(b.dataset.dot));
  });
}
function goTo(i){
  slides[slideIndex].classList.remove('current');
  slideIndex = (i+slides.length)%slides.length;
  slides[slideIndex].classList.add('current');
  updateDots();
  restartAutoplay();
}
function next(){ goTo(slideIndex+1); }
function prev(){ goTo(slideIndex-1); }
function autoplay(){ timer = setInterval(next, 4500); }
function restartAutoplay(){ clearInterval(timer); autoplay(); }
function updateDots(){
  if(!dotsWrap) return;
  [...dotsWrap.children].forEach((d, i)=> d.classList.toggle('active', i===slideIndex));
}
renderDots();
if(slides.length){ slides[0].classList.add('current'); updateDots(); autoplay(); }
document.getElementById('nextSlide')?.addEventListener('click', next);
document.getElementById('prevSlide')?.addEventListener('click', prev);

// ====== Mobile menu ======
const menuBtn = document.getElementById('menuBtn');
menuBtn?.addEventListener('click', ()=>{
  document.body.classList.toggle('nav-open');
});

// ====== Contact Form ======
const contactForm = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

const FORM_ENDPOINT = 'https://formspree.io/f/xjkelypa'; 

contactForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const data = new FormData(contactForm);

  if (!FORM_ENDPOINT) {
    statusEl.textContent = '';
    return;
  }

  try{
    const res = await fetch(FORM_ENDPOINT, { method:'POST', body:data, headers: { 'Accept':'application/json' } });
    if(res.ok){
      contactForm.reset();
      statusEl.textContent = 'Thanks! Your message was sent successfully.';
    } else {
      statusEl.textContent = 'Hmm, something went wrong. Please try again or WhatsApp us.';
    }
  }catch{
    statusEl.textContent = 'Network error. Please try again later.';
  }
});

// ====== Quick Order (WhatsApp) ======
document.getElementById('waForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const v = document.getElementById('orderText').value.trim();
  const msg = v || 'Hello Joys Mix! I would like to order.';
  const url = 'https://wa.me/2347039812009?text=' + encodeURIComponent(msg);
  window.open(url,'_blank');
});

// ====== Footer year ======
document.getElementById('year').textContent = new Date().getFullYear();
