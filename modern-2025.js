// Modern 2025 JavaScript Enhancements

// Scroll Reveal Animation
const revealElements = () => {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  reveals.forEach(reveal => observer.observe(reveal));
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  revealElements();
  
  // Add reveal class to benefit cards
  document.querySelectorAll('.benefit-card, .benefits > div > div').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  
  // Add glass-card class to existing cards
  document.querySelectorAll('#app, .tab-content, .price-info').forEach(el => {
    el.classList.add('glass-card');
  });
  
  // Add modern button class
  document.querySelectorAll('.zamow-btn, #send, #cancel').forEach(el => {
    el.classList.add('btn-modern', 'interactive');
  });
  
  // Add benefit-card class
  document.querySelectorAll('.benefits > div > div > div').forEach(el => {
    el.classList.add('benefit-card');
  });
});
