// public/js/menu.js
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
});

const cart = [];
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cartItems');
  const total = document.getElementById('cartTotal');
  const orderItems = document.getElementById('orderItems');
  cartList.innerHTML = '';
  let sum = 0;
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} x${item.quantity}`;
    cartList.appendChild(li);
    sum += item.price * item.quantity;
  });
  total.textContent = sum;
  orderItems.value = JSON.stringify(cart);
}
