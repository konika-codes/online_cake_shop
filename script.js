// ================== THEME TOGGLE (DARK / LIGHT MODE) ==================
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Apply saved theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  themeToggle.textContent = "☀️";
} else {
  themeToggle.textContent = "🌙";
}

// Toggle theme on button click
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ================== BKASH SETTINGS ==================
// Ekhane tomar nijer bKash number dao (customer ei number e Send Money korbe)
const BKASH_NUMBER = "01872-098140";

// ================== PRODUCT DATA ==================
// Nijer picture use korte: images folder e cake1.jpg, cake2.jpg, cake3.jpg ... serial e rakho
// Jotogulo image folder e thakbe, totogulo cake automatic dekhabe
// Niche defaultProducts e je cake er naam/price deya ache seta oi number er image er sathe lagbe
// 10 number ba tar por er cake er jonno alada naam/price dite chaile defaultProducts e notun line add koro
const defaultProducts = [
  { id: 1, name: "Almond Strawberry Cake", price: 850,  image: "images/cake1.jpg" },
  { id: 2, name: "Birthday Cake",          price: 950,  image: "images/cake2.jpg" },
  { id: 3, name: "Vanilla Cake",           price: 800,  image: "images/cake3.jpg" },
  { id: 4, name: "Funfetti Cake",          price: 750,  image: "images/cake4.jpg" },
  { id: 5, name: "Classic Chiffon Cake",   price: 900,  image: "images/cake5.jpg" },
  { id: 6, name: "Birthday Cake for Her",  price: 1100, image: "images/cake6.jpg" },
  { id: 7, name: "Chocolate Cake",         price: 800,  image: "images/cake7.jpg" },
  { id: 8, name: "Pink Cake",              price: 800,  image: "images/cake8.jpg" },
  { id: 9, name: "Velvet Cake",            price: 800,  image: "images/cake9.jpg" }
];

// Je cake er naam/price deya nai tar default price
const DEFAULT_PRICE = 800;

// Je extension gulo check korbe
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

// Maximum koyta image porjonto check korbe
const MAX_IMAGES = 200;

// Auto detect howar por ei array te product gulo thakbe
let products = [];

// ================== AUTO DETECT IMAGES ==================
function checkImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function findImageForIndex(index) {
  for (const ext of IMAGE_EXTENSIONS) {
    const src = `images/cake${index}.${ext}`;
    if (await checkImage(src)) return src;
  }
  return null;
}

async function loadProducts() {
  const found = [];

  for (let i = 1; i <= MAX_IMAGES; i++) {
    const src = await findImageForIndex(i);
    if (!src) break; // serial e jei image nai, ekhane thamo

    const known = defaultProducts.find(p => p.id === i);
    found.push({
      id: i,
      name: known ? known.name : `Special Cake ${i}`,
      price: known ? known.price : DEFAULT_PRICE,
      image: src
    });
  }

  // kono image na pele ager default cake gulo dekhabe
  products = found.length > 0 ? found : defaultProducts;
}

// ================== STATE ==================
let cart = JSON.parse(localStorage.getItem("cakeCart")) || [];

// ================== RENDER PRODUCTS ==================
const productGrid = document.getElementById("productGrid");

function renderProducts() {
  productGrid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='images/placeholder.jpg';" />
      <h3>${p.name}</h3>
      <p class="price">৳${p.price}</p>
      <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart 🛒</button>
    </div>
  `).join("");

  updateProductButtons();
}

// ================== ALREADY ADDED STATE ON PRODUCT CARDS ==================
function updateProductButtons() {
  document.querySelectorAll(".product-card").forEach(card => {
    const id = Number(card.dataset.id);
    const item = cart.find(i => i.id === id);
    const btn = card.querySelector(".add-btn");
    if (!btn) return;

    if (item) {
      card.classList.add("in-cart");
      btn.textContent = `✓ Already Added (${item.qty}) • Add More`;
    } else {
      card.classList.remove("in-cart");
      btn.textContent = "Add to Cart 🛒";
    }
  });
}

// ================== ADD TO CART ==================
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  renderCart();
  updateCartCount();
}

// ================== SAVE CART ==================
function saveCart() {
  localStorage.setItem("cakeCart", JSON.stringify(cart));
}

// ================== UPDATE BADGE ==================
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
}

// ================== RENDER CART ==================
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");

function renderCart() {
  // cart change hole product card er "Added" state o update hobe
  updateProductButtons();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty!</p>';
    cartTotalEl.textContent = "0";
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='images/placeholder.jpg';" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>৳${item.price * item.qty}</p>
        <div class="qty-controls">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})">🗑️</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotalEl.textContent = total;
}

// ================== CHANGE QUANTITY ==================
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  renderCart();
  updateCartCount();
}

// ================== REMOVE ITEM ==================
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  updateCartCount();
}

// ================== CART SIDEBAR TOGGLE ==================
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");

document.getElementById("cartBtn").addEventListener("click", () => {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
});

function closeCartSidebar() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
}

document.getElementById("closeCart").addEventListener("click", closeCartSidebar);
cartOverlay.addEventListener("click", closeCartSidebar);

// ================== BKASH BOX (SHOW / HIDE) ==================
const paymentSelect = document.getElementById("payment");
const bkashBox = document.getElementById("bkashBox");
const trxInput = document.getElementById("trxId");
document.getElementById("bkashNumber").textContent = BKASH_NUMBER;

function togglePaymentBox() {
  const isBkash = paymentSelect.value === "bkash";
  bkashBox.classList.toggle("active", isBkash);
  trxInput.required = isBkash;

  if (isBkash) {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById("bkashAmount").textContent = total;
  }
}

paymentSelect.addEventListener("change", togglePaymentBox);

// bKash number copy button
document.getElementById("copyBkash").addEventListener("click", () => {
  const btn = document.getElementById("copyBkash");
  const done = () => {
    btn.textContent = "Copied ✓";
    setTimeout(() => (btn.textContent = "Copy"), 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(BKASH_NUMBER).then(done).catch(done);
  } else {
    done();
  }
});

// ================== CHECKOUT ==================
const checkoutModal = document.getElementById("checkoutModal");
const successModal = document.getElementById("successModal");

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty! Please add some cakes first.");
    return;
  }
  closeCartSidebar();
  togglePaymentBox();
  checkoutModal.classList.add("active");
});

document.getElementById("closeModal").addEventListener("click", () => {
  checkoutModal.classList.remove("active");
});

// ================== CHECKOUT FORM SUBMIT ==================
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const date = document.getElementById("deliveryDate").value;
  const payment = document.getElementById("payment").value;
  const trxId = document.getElementById("trxId").value.trim().toUpperCase();

  if (!name || !phone || !email || !address || !date) {
    alert("Please fill all required fields!");
    return;
  }

  // bKash select korle Transaction ID must
  if (payment === "bkash") {
    if (!trxId) {
      alert("Please bKash Transaction ID dao!");
      return;
    }
    if (!/^[A-Z0-9]{8,12}$/.test(trxId)) {
      alert("Transaction ID thik nai! Shudhu letter ar number thakbe (8-12 character).");
      return;
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderId = "KONA" + Date.now().toString().slice(-6);

  const order = {
    orderId, name, phone, email, address, date, payment,
    items: cart,
    total,
    status: "Pending",
    placedAt: new Date().toISOString()
  };

  if (payment === "bkash") {
    order.bkashNumber = BKASH_NUMBER;
    order.transactionId = trxId;
    order.status = "Payment Verification Pending";
  }

  console.log("Order placed:", order);
  localStorage.setItem("lastOrder", JSON.stringify(order));

  // 🔴 NEW: Dashboard er jonno order save kora (sob order list e)
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  allOrders.unshift(order); // notun order top e
  localStorage.setItem("orders", JSON.stringify(allOrders));

  checkoutModal.classList.remove("active");
  document.getElementById("successMsg").innerHTML = `
    Thanks <strong>${name}</strong>! 🎂<br>
    Order ID: <strong>${orderId}</strong><br>
    Total: <strong>৳${total}</strong><br>
    ${payment === "bkash" ? `bKash TrxID: <strong>${trxId}</strong><br>` : ""}
    Delivery on: <strong>${date}</strong><br>
    Kona's Bake will contact you at <strong>${phone}</strong> shortly.
  `;
  successModal.classList.add("active");

  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  document.getElementById("checkoutForm").reset();
  togglePaymentBox();
});

document.getElementById("successClose").addEventListener("click", () => {
  successModal.classList.remove("active");
});

// ================== IMAGE DEBUG (Temporary — Console e dekho) ==================
window.addEventListener("load", () => {
  console.log("=== IMAGE LOAD CHECK ===");
  products.forEach(p => {
    const img = new Image();
    img.src = p.image;
    img.onload = () => console.log(`✅ ${p.image} — OK (${img.width}x${img.height})`);
    img.onerror = () => console.error(`❌ ${p.image} — FILE NOT FOUND`);
  });
  console.log("=== END ===");
});

// ================== INIT ==================
async function init() {
  renderCart();
  updateCartCount();
  await loadProducts();
  renderProducts();
}

init();