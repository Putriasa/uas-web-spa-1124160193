const promoCodes = {
  DISKON10: { type: 'percentage', value: 10 },
  POTONG500: { type: 'amount', value: 500000 }
};

const transactions = [];

function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

function updateSummary() {
  const totalTransactions = document.getElementById('totalTransactions');
  const totalRevenue = document.getElementById('totalRevenue');
  const avgTransaction = document.getElementById('avgTransaction');

  const total = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const count = transactions.length;
  const average = count ? Math.floor(total / count) : 0;

  totalTransactions.textContent = count;
  totalRevenue.textContent = formatRupiah(total);
  avgTransaction.textContent = formatRupiah(average);

  const clearBtn = document.getElementById('clearHistoryBtn');
  clearBtn.classList.toggle('hidden', count === 0);
}

function renderTransaction(trx) {
  const template = document.getElementById('transactionTemplate');
  const list = document.getElementById('transactionList');
  const emptyState = document.getElementById('emptyState');

  const clone = template.content.cloneNode(true);
  clone.querySelector('.transaction-customer').textContent = trx.name;
  clone.querySelector('.transaction-product').textContent = trx.product;
  clone.querySelector('.transaction-amount').textContent = formatRupiah(trx.total);
  clone.querySelector('.transaction-time').textContent = trx.timestamp;
  clone.querySelector('.transaction-method').textContent = trx.method;

  list.prepend(clone);
  emptyState.classList.add('hidden');
}

function showModal(detailHtml) {
  const modal = document.getElementById('paymentModal');
  const details = document.getElementById('paymentDetails');
  details.innerHTML = detailHtml;
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('paymentModal').classList.add('hidden');
}

function applyPromo(subtotal, code) {
  const promo = promoCodes[code];
  if (!promo) return 0;
  return promo.type === 'percentage'
    ? Math.floor(subtotal * (promo.value / 100))
    : Math.min(promo.value, subtotal);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('paymentForm');
  const promoInput = document.getElementById('promoCode');
  const promoMessage = document.getElementById('promoMessage');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const discountRow = document.getElementById('discountRow');
  const subtotalDisplay = document.getElementById('subtotal');
  const discountDisplay = document.getElementById('discount');
  const totalDisplay = document.getElementById('totalAmount');

  let currentDiscount = 0;

  function calculateTotal() {
    const productSelect = document.getElementById('productSelect');
    const price = parseInt(productSelect.selectedOptions[0].dataset.price || 0);
    const quantity = parseInt(document.getElementById('quantity').value || 1);
    const subtotal = price * quantity;
    const promoCode = promoInput.value.trim().toUpperCase();
    const discount = applyPromo(subtotal, promoCode);

    currentDiscount = discount;
    const total = subtotal - discount;

    subtotalDisplay.textContent = formatRupiah(subtotal);
    discountDisplay.textContent = formatRupiah(discount);
    totalDisplay.textContent = formatRupiah(total);
    discountRow.classList.toggle('hidden', discount === 0);

    if (promoCode && !promoCodes[promoCode]) {
      promoMessage.classList.remove('hidden');
      promoMessage.textContent = 'Kode promo tidak valid.';
    } else {
      promoMessage.classList.add('hidden');
    }

    return { subtotal, total, discount };
  }

  ['input', 'change'].forEach(evt =>
    form.addEventListener(evt, calculateTotal)
  );

  applyPromoBtn.addEventListener('click', calculateTotal);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const productSelect = document.getElementById('productSelect');
    const product = productSelect.selectedOptions[0].text;
    const method = form.paymentMethod.value;
    const { subtotal, total, discount } = calculateTotal();

    const now = new Date();
    const timestamp = now.toLocaleString('id-ID');

    const transaction = { name, email, product, method, subtotal, discount, total, timestamp };
    transactions.push(transaction);

    renderTransaction(transaction);
    updateSummary();

    const detailHTML = `
      <p><strong>Nama:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Kelas:</strong> ${product}</p>
      <p><strong>Subtotal:</strong> ${formatRupiah(subtotal)}</p>
      <p><strong>Diskon:</strong> ${formatRupiah(discount)}</p>
      <p><strong>Total:</strong> ${formatRupiah(total)}</p>
      <p><strong>Metode Pembayaran:</strong> ${method}</p>
      <p><strong>Waktu:</strong> ${timestamp}</p>
    `;
    showModal(detailHTML);
    form.reset();
    calculateTotal();
  });

  document.getElementById('closeModalBtn').addEventListener('click', closeModal);

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    transactions.length = 0;
    document.getElementById('transactionList').innerHTML = '';
    document.getElementById('emptyState').classList.remove('hidden');
    updateSummary();
  });

  calculateTotal(); // initial
});
