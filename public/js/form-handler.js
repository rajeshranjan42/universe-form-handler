const form   = document.getElementById('contactForm');
const alertB = document.getElementById('alertBox');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch('/submit-form', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(data)
    });
    const out = await res.json();
    show(out.success ? 'success' : 'danger', out.message);
    if (out.success) form.reset();
  } catch {
    show('danger', 'Network error. Try again.');
  }
});

function show(type, msg) {
  alertB.className = `alert alert-${type} mt-3`;
  alertB.innerHTML = `<strong>${type === 'success' ? '✅' : '⚠️'}</strong> ${msg}`;
  alertB.style.display = 'block';
  
  // Add animation
  alertB.style.opacity = '0';
  alertB.style.transform = 'translateY(-10px)';
  setTimeout(() => {
    alertB.style.transition = 'all 0.3s ease';
    alertB.style.opacity = '1';
    alertB.style.transform = 'translateY(0)';
  }, 10);
}