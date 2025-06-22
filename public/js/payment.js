const loader = document.getElementById('loader');
const progress = document.getElementById('loyalty-progress');
const claimBtn = document.getElementById('claim-btn');

let orderId = localStorage.getItem('orderId');
let loyaltyPoints = 0; // dynamically fetched

function showLoader() {
  loader.style.display = 'block';
}
function hideLoader() {
  loader.style.display = 'none';
}

// Simulate fetching loyalty status
function fetchLoyalty() {
  fetch('/user/status')
    .then(res => res.json())
    .then(data => {
      loyaltyPoints = data.loyaltyPoints;
      progress.style.width = `${(loyaltyPoints % 10) * 10}%`;

      if ((loyaltyPoints % 10) === 0 && loyaltyPoints !== 0) {
        claimBtn.style.display = 'inline-block';
      }
    });
}

function payWithMpesa() {
  const phone = document.getElementById('phone').value;
  if (!phone || !orderId) return alert('Phone and order required.');
  showLoader();
  fetch('/payment/mpesa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, phone })
  })
    .then(res => res.json())
    .then(data => {
      hideLoader();
      alert(data.message || 'Payment initiated.');
    }).catch(err => {
      hideLoader();
      alert('Payment failed.');
    });
}

function payWithAirtel() {
  if (!orderId) return alert('Order required.');
  showLoader();
  fetch('/payment/airtel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  }).then(res => res.json())
    .then(data => {
      hideLoader();
      alert(data.message || 'Airtel payment done.');
    }).catch(err => {
      hideLoader();
      alert('Airtel payment failed.');
    });
}

function payWithPaypal() {
  if (!orderId) return alert('Order required.');
  showLoader();
  fetch('/payment/paypal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  }).then(res => res.json())
    .then(data => {
      hideLoader();
      alert(data.message || 'PayPal payment done.');
    }).catch(err => {
      hideLoader();
      alert('PayPal failed.');
    });
}

function claimFreeMeal() {
  alert('🎉 You’ve claimed a free meal!');
  claimBtn.style.display = 'none';
  // Implement reward claim POST logic here if needed
}

window.onload = fetchLoyalty;
    
