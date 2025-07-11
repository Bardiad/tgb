import { greet } from './utils/example.js';

// DOM Ready utility
function onDOMReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Main init logic
onDOMReady(() => {
  const html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js');

  const yearEl = document.querySelector(".js-year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  //To do: make these composable  

  // Confetti Button
  const conffettiButton = document.getElementById('getResume');
  const confettiContainer = document.getElementById('confettiContainer');

  //Don't make this too much or it might slow down some devices
  const confettiDensity = 30;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  conffettiButton.addEventListener('click', (e) => {
    if (prefersReducedMotion) return;

    // const rect = button.getBoundingClientRect();
    // const originX = rect.left + rect.width / 2;
    // const originY = rect.top + window.scrollY + rect.height / 2;

    //origin is at center of user pointer event, instead of center of button
    const originX = e.clientX;
    const originY = e.clientY + window.scrollY;    

    for (let i = 0; i < confettiDensity; i++) {

      //create new confetti particles, give them a class (for styling)
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');

      // Set color within purple range
      confetti.style.setProperty('--saturation', `${50 + Math.random() * 30}%`);
      confetti.style.setProperty('--lightness', `${50 + Math.random() * 20}%`);
      confetti.style.setProperty('--duration', `${800 + Math.random() * 400}ms`);

      // Calculate circular explosion direction
      const angle = Math.random() * 2 * Math.PI;
      const radius = 80 + Math.random() * 40; // travel distance
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      //store final location of confetti in css property
      confetti.style.setProperty('--x', `${x}px`);
      confetti.style.setProperty('--y', `${y}px`);

      // Start position at button center
      confetti.style.left = `${originX}px`;
      confetti.style.top = `${originY}px`;

      confettiContainer.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 1400);
    }
  });

  //Accordion Functionality
  const accordions = document.querySelectorAll('[data-accordion-group]');

  accordions.forEach(group => {
    const triggers = group.querySelectorAll('.c-accordion-item__trigger');
    const toggleAll = group.querySelector('[data-accordion-toggle]');
    const panels = group.querySelectorAll('.c-accordion-item__panel');

    toggleAll.addEventListener('click', () => {
      const shouldExpand = toggleAll.getAttribute('aria-expanded') === 'false';

      triggers.forEach(trigger => {
        trigger.setAttribute('aria-expanded', shouldExpand);
        trigger.querySelector('.icon')?.classList.toggle('is-rotated', shouldExpand);
        trigger.classList.toggle('is-active', shouldExpand);

        const pid = trigger.getAttribute('aria-controls');
        const panel = document.getElementById(pid);
        if (panel) {
          panel.hidden = !shouldExpand;
        }
      });

      toggleAll.setAttribute('aria-expanded', shouldExpand);
      toggleAll.textContent = shouldExpand ? 'Collapse all' : 'Expand all';
    });

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {

        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', !expanded);
        trigger.querySelector('.icon')?.classList.toggle('is-rotated', !expanded);
        trigger.classList.toggle('is-active', !expanded);        

        const pid = trigger.getAttribute('aria-controls');
        const panel = document.getElementById(pid);

        if (panel) { panel.hidden = expanded; }

        const allExpanded = [...triggers].every(t => t.getAttribute('aria-expanded') ===  'true');
        toggleAll.setAttribute('aria-expanded', allExpanded);
        toggleAll.textContent = allExpanded ? 'Collapse all' : 'Expand all';        
      });
    });
  });

  //Back to top
  const backToTopBtn = document.querySelector('.c-back-to-top');
  let lastScrollY = window.scrollY;
  let ticking = false;
  const triggerOffset = 300;

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const isScrollingUp = currentScrollY < lastScrollY;
    const hasPassedThreshold = currentScrollY > triggerOffset;

    if (isScrollingUp && hasPassedThreshold) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  });

  // Smooth scroll on click
  backToTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});