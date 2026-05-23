// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
}

// Waitlist form
const form = document.getElementById('waitlist-form');
const msg  = document.getElementById('waitlist-msg');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type=email]').value;
    const emails = JSON.parse(localStorage.getItem('wl') || '[]');
    if (!emails.includes(email)) { emails.push(email); localStorage.setItem('wl', JSON.stringify(emails)); }
    msg.textContent = 'Got it. We will be in touch.';
    form.reset();
  });
}
