// ================== THEME TOGGLE ==================
const dashThemeToggle = document.getElementById("dashThemeToggle");
const body = document.body;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
}

dashThemeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ================== STATE ==================
let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
let currentFilter = "all";

// ================== SAVE ORDERS ==================
function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(allOrders));
}

// ================== UPDATE STATS ==================
function updateStats() {
  const total = allOrders.length;
  const revenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pending = allOrders.filter(o => o.status === "Pending").length;
  const delivered = allOrders.filter(o => o.status === "Delivered").length;

  document.getElementById("statTotalOrders").textContent = total;
  document.getElementById("statTotalRevenue").textContent = "৳" + revenue.toLocaleString();
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statDelivered").textContent = delivered;
}

// ================== RENDER ORDERS ==================
const ordersGrid = document.getElementById("ordersGrid");

function renderOrders() {
  const filtered = currentFilter === "all"
    ? allOrders
    : allOrders.filter(o => o.status === currentFilter);

  if (filtered.length === 0) {
    ordersGrid.innerHTML = `<p class="no-orders">${
      currentFilter === "all"
        ? "No orders yet. Orders will appear here once customers place them."
        : `No ${currentFilter} orders.`
    }</p>`;
    return;
  }

  ordersGrid.innerHTML = filtered.map(order => {
    const itemsPreview = order.items.slice(0, 2).map(i => `${i.name} ×${i.qty}`).join(", ");
    const moreCount = order.items.length > 2 ? ` +${order.items.length - 2} more` : "";
    const dateObj = new Date(order.placedAt);
    const dateStr = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="order-card">
        <div class="order-header">
          <span class="order-id">#${order.orderId}</span>
          <span class="order-status status-${order.status}">${order.status}</span>
        </div>
        <div class="order-body">
          <div class="order-row"><strong>👤 Customer:</strong> <span>${order.name}</span></div>
          <div class="order-row"><strong>📞 Phone:</strong> <span>${order.phone}</span></div>
          <div class="order-row"><strong>📅 Delivery:</strong> <span>${order.date}</span></div>
          <div class="order-row"><strong>🕒 Placed:</strong> <span>${dateStr}</span></div>
          <div class="order-items-preview">🛒 ${itemsPreview}${moreCount}</div>
        </div>
        <div class="order-footer">
          <select class="status-select" onchange="updateOrderStatus('${order.orderId}', this.value)">
            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
            <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
            <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
          <button class="view-btn" onclick="viewOrder('${order.orderId}')">View</button>
          <span class="order-total">৳${order.total}</span>
        </div>
      </div>
    `;
  }).join("");
}

// ================== UPDATE STATUS ==================
function updateOrderStatus(orderId, newStatus) {
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;
  order.status = newStatus;
  saveOrders();
  renderOrders();
  updateStats();
}

// ================== VIEW ORDER DETAILS ==================
const orderModal = document.getElementById("orderModal");
const orderDetailContent = document.getElementById("orderDetailContent");

function viewOrder(orderId) {
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;

  const itemsHtml = order.items.map(i => `
    <div class="detail-item">
      <img src="${i.image}" alt="${i.name}" onerror="this.src='images/placeholder.jpg'" />
      <div class="detail-item-info">
        <h4>${i.name}</h4>
        <p>Qty: ${i.qty} × ৳${i.price}</p>
      </div>
      <span class="detail-item-price">৳${i.price * i.qty}</span>
    </div>
  `).join("");

  const paymentLabel = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    card: "Card Payment"
  }[order.payment] || order.payment;

  orderDetailContent.innerHTML = `
    <div class="detail-section">
      <h3>Order Info</h3>
      <div class="detail-row"><strong>Order ID</strong> <span>#${order.orderId}</span></div>
      <div class="detail-row"><strong>Status</strong> <span>${order.status}</span></div>
      <div class="detail-row"><strong>Placed</strong> <span>${new Date(order.placedAt).toLocaleString()}</span></div>
      <div class="detail-row"><strong>Payment</strong> <span>${paymentLabel}</span></div>
    </div>

    <div class="detail-section">
      <h3>Customer Info</h3>
      <div class="detail-row"><strong>Name</strong> <span>${order.name}</span></div>
      <div class="detail-row"><strong>Phone</strong> <span>${order.phone}</span></div>
      <div class="detail-row"><strong>Email</strong> <span>${order.email}</span></div>
      <div class="detail-row"><strong>Address</strong> <span>${order.address}</span></div>
      <div class="detail-row"><strong>Delivery Date</strong> <span>${order.date}</span></div>
    </div>

    <div class="detail-section">
      <h3>Items (${order.items.length})</h3>
      <div class="detail-items-list">${itemsHtml}</div>
    </div>

    <div class="detail-section">
      <div class="detail-row" style="font-size:1.2rem;">
        <strong>Total</strong>
        <span style="font-weight:800;color:var(--primary);font-size:1.4rem;">৳${order.total}</span>
      </div>
    </div>
  `;

  orderModal.classList.add("active");
}

document.getElementById("closeOrderModal").addEventListener("click", () => {
  orderModal.classList.remove("active");
});

orderModal.addEventListener("click", (e) => {
  if (e.target === orderModal) orderModal.classList.remove("active");
});

// ================== FILTERS ==================
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderOrders();
  });
});

// ================== CLEAR ALL ORDERS ==================
document.getElementById("clearAllOrders").addEventListener("click", () => {
  if (!confirm("Sob order delete korte chan? Ei kaj undo hobe na.")) return;
  allOrders = [];
  saveOrders();
  renderOrders();
  updateStats();
});

// ================== INIT ==================
function init() {
  updateStats();
  renderOrders();
}

init();