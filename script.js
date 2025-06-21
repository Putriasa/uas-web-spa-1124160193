// ====== KODE PROMO ======
const promoCodes = {
  "DISKON10": {
    type: "percentage",
    discount: 10,
    description: "Diskon 10% untuk semua konsentrasi"
  },
  "POTONG500K": {
    type: "amount",
    discount: 500000,
    description: "Potongan langsung Rp 500.000"
  }
};

// ====== DARK/LIGHT MODE TOGGLE ======
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.htmlElement = document.documentElement;
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    if (this.currentTheme === 'dark') {
      this.htmlElement.classList.add('dark');
    } else {
      this.htmlElement.classList.remove('dark');
    }
    this.updateIcons();
    this.bindEvents();
    this.initLoadingAnimation();
  }

  bindEvents() {
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  toggleTheme() {
    this.htmlElement.classList.toggle('dark');
    const isDark = this.htmlElement.classList.contains('dark');
    this.currentTheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.updateIcons();

    // Click animation (opsional)
    this.themeToggle.classList.add('button-click');
    setTimeout(() => {
      this.themeToggle.classList.remove('button-click');
    }, 150);
  }

  updateIcons() {
    const isDark = this.htmlElement.classList.contains('dark');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    sunIcon.classList.toggle('rotate-90', isDark);
    sunIcon.classList.toggle('scale-0', isDark);
    sunIcon.classList.toggle('rotate-0', !isDark);
    sunIcon.classList.toggle('scale-100', !isDark);

    moonIcon.classList.toggle('rotate-90', !isDark);
    moonIcon.classList.toggle('scale-0', !isDark);
    moonIcon.classList.toggle('rotate-0', isDark);
    moonIcon.classList.toggle('scale-100', isDark);
  }

  initLoadingAnimation() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.classList.add('loaded');
      }, 100);
    });
  }
}

// Inisialisasi ThemeManager saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});


// ====== VARIABEL & DOM ======
let transactions = [];
let currentDiscount = 0;
let appliedPromoCode = '';

const paymentMethodColors = {
  transfer: 'bg-blue-100 text-blue-800',
  ewallet: 'bg-purple-100 text-purple-800',
  credit: 'bg-orange-100 text-orange-800',
  cash: 'bg-green-100 text-green-800'
};

const paymentMethodNames = {
  transfer: 'Transfer Bank',
  ewallet: 'E-Wallet',
  credit: 'Kartu Kredit',
  cash: 'Bayar Tunai'
};

const paymentForm = document.getElementById('paymentForm');
const productSelect = document.getElementById('productSelect');
const quantity = document.getElementById('quantity');
const promoCode = document.getElementById('promoCode');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMessage = document.getElementById('promoMessage');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const discountRow = document.getElementById('discountRow');
const totalAmountEl = document.getElementById('totalAmount');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const totalTransactionsEl = document.getElementById('totalTransactions');
const totalRevenueEl = document.getElementById('totalRevenue');
const avgTransactionEl = document.getElementById('avgTransaction');
const paymentModal = document.getElementById('paymentModal');
const paymentDetails = document.getElementById('paymentDetails');
const closeModalBtn = document.getElementById('closeModalBtn');

// ====== UTILITAS ======
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

function getCurrentTime() {
  return new Date().toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateTransactionId() {
  return 'TRX' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// ====== KALKULASI ======
function calculateSubtotal() {
  const option = productSelect.options[productSelect.selectedIndex];
  if (!option || !option.dataset.price) return 0;
  const price = parseInt(option.dataset.price);
  const qty = parseInt(quantity.value) || 1;
  return price * qty;
}

function calculateDiscount(subtotal, promoData) {
  if (!promoData) return 0;
  return promoData.type === 'percentage' ?
    Math.round(subtotal * promoData.discount / 100) :
    Math.min(promoData.discount, subtotal);
}

function updateTotal() {
  const subtotal = calculateSubtotal();
  const promoData = appliedPromoCode ? promoCodes[appliedPromoCode] : null;
  const discount = calculateDiscount(subtotal, promoData);
  const total = subtotal - discount;

  subtotalEl.textContent = formatCurrency(subtotal);
  totalAmountEl.textContent = formatCurrency(total);
  currentDiscount = discount;

  if (discount > 0) {
    discountEl.textContent = '-' + formatCurrency(discount);
    discountRow.classList.remove('hidden');
  } else {
    discountRow.classList.add('hidden');
  }
}

// ====== PROMO ======
function applyPromoCode() {
  const code = promoCode.value.trim().toUpperCase();
  if (!code) return showPromoMessage('Masukkan kode promo terlebih dahulu', 'error');
  if (!promoCodes[code]) return showPromoMessage('Kode promo tidak valid', 'error');

  appliedPromoCode = code;
  updateTotal();
  showPromoMessage(`Kode promo "${code}" berhasil diterapkan! ${promoCodes[code].description}`, 'success');
  promoCode.disabled = true;
  applyPromoBtn.textContent = 'Diterapkan';
  applyPromoBtn.disabled = true;
  applyPromoBtn.classList.replace('bg-green-500', 'bg-gray-400');
}

function showPromoMessage(msg, type) {
  promoMessage.textContent = msg;
  promoMessage.classList.remove('hidden', 'text-red-500', 'text-green-500');
  promoMessage.classList.add(type === 'error' ? 'text-red-500' : 'text-green-500');
}

function resetPromoCode() {
  appliedPromoCode = '';
  currentDiscount = 0;
  promoCode.value = '';
  promoCode.disabled = false;
  applyPromoBtn.textContent = 'Terapkan';
  applyPromoBtn.disabled = false;
  applyPromoBtn.classList.replace('bg-gray-400', 'bg-green-500');
  promoMessage.classList.add('hidden');
  updateTotal();
}

// ====== PEMBAYARAN ======
function processPayment(formData) {
  const option = productSelect.options[productSelect.selectedIndex];
  const subtotal = calculateSubtotal();
  const total = subtotal - currentDiscount;

  const transaction = {
    id: generateTransactionId(),
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    product: option.textContent,
    quantity: parseInt(formData.get('quantity')),
    paymentMethod: formData.get('paymentMethod'),
    promoCode: appliedPromoCode,
    subtotal,
    discount: currentDiscount,
    total,
    time: getCurrentTime()
  };

  transactions.push(transaction);
  return transaction;
}

function showPaymentModal(transaction) {
  paymentDetails.innerHTML = `
    <div class="space-y-2">
      <div class="flex justify-between"><span>ID Transaksi:</span><span class="font-medium">${transaction.id}</span></div>
      <div class="flex justify-between"><span>Nama:</span><span class="font-medium">${transaction.customerName}</span></div>
      <div class="flex justify-between"><span>Produk:</span><span class="font-medium">${transaction.product}</span></div>
      <div class="flex justify-between"><span>Jumlah:</span><span class="font-medium">${transaction.quantity}</span></div>
      <div class="flex justify-between"><span>Metode:</span><span class="font-medium">${paymentMethodNames[transaction.paymentMethod]}</span></div>
      ${transaction.discount > 0 ? `<div class="flex justify-between text-green-600"><span>Diskon:</span><span>- ${formatCurrency(transaction.discount)}</span></div>` : ''}
      <hr class="my-2">
      <div class="flex justify-between text-lg font-semibold"><span>Total:</span><span class="text-green-600">${formatCurrency(transaction.total)}</span></div>
    </div>
  `;
  paymentModal.classList.remove('hidden');
  paymentModal.classList.add('flex');
}

function closeModal() {
  paymentModal.classList.add('hidden');
  paymentModal.classList.remove('flex');
}

// ====== RIWAYAT ======
function createTransactionElement(transaction) {
  const template = document.getElementById('transactionTemplate');
  const clone = template.content.cloneNode(true);

  clone.querySelector('.transaction-customer').textContent = transaction.customerName;
  clone.querySelector('.transaction-product').textContent = `${transaction.product} (${transaction.quantity}x)`;
  clone.querySelector('.transaction-amount').textContent = formatCurrency(transaction.total);
  clone.querySelector('.transaction-time').textContent = transaction.time;

  const methodEl = clone.querySelector('.transaction-method');
  methodEl.textContent = paymentMethodNames[transaction.paymentMethod];
  methodEl.className += ' ' + paymentMethodColors[transaction.paymentMethod];

  const container = clone.querySelector('div');
  container.setAttribute('data-transaction-id', transaction.id);
  return clone;
}

function renderTransactions() {
  transactionList.innerHTML = '';
  if (transactions.length === 0) {
    emptyState.style.display = 'block';
    clearHistoryBtn.classList.add('hidden');
  } else {
    emptyState.style.display = 'none';
    clearHistoryBtn.classList.remove('hidden');
    [...transactions].reverse().forEach(tx => {
      transactionList.appendChild(createTransactionElement(tx));
    });
  }
  updateStats();
}

function updateStats() {
  const total = transactions.length;
  const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const avg = total > 0 ? Math.round(revenue / total) : 0;

  totalTransactionsEl.textContent = total;
  totalRevenueEl.textContent = formatCurrency(revenue);
  avgTransactionEl.textContent = formatCurrency(avg);
}

// ====== INISIALISASI SAAT SIAP ======
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  updateTotal();

  productSelect.addEventListener('change', updateTotal);
  quantity.addEventListener('input', updateTotal);
  applyPromoBtn.addEventListener('click', applyPromoCode);
  closeModalBtn.addEventListener('click', closeModal);
  clearHistoryBtn.addEventListener('click', () => {
    transactions = [];
    renderTransactions();
  });

  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(paymentForm);
    const tx = processPayment(formData);
    renderTransactions();
    showPaymentModal(tx);
    resetPromoCode();
    paymentForm.reset();
    updateTotal();
  });
  
  
});
