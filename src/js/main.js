//import { attachConfettiEffect } from './confetti.js';

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

  const confettiButtons =  document.querySelectorAll(".js-confetti");
  const confettiContainer = document.getElementById('confettiContainer');

  //Don't make this too much or it might slow down some devices
  const confettiDensity = 30;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  confettiButtons.forEach((button) => {
    button.addEventListener('click', (e) =>{
      if (prefersReducedMotion) return;

      // const rect = button.getBoundingClientRect();
      // const originX = rect.left + rect.width / 2;
      // const originY = rect.top + window.scrollY + rect.height / 2;

      //origin is at center of user pointer event, instead of center of button
      const originX = e.clientX;
      const originY = e.clientY;    

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


  //Contact form
  const contactForm = document.getElementById("contactForm");
  const contactFormResult = contactForm.querySelector("[data-form-result]");
  const overlay = contactForm.querySelector("[data-form-overlay]");
  const overlayText = overlay.querySelector(".c-contact-form__overlay-text .dot-animation");
  let dotInterval = null;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();


    const isTesting = false;
    // Convert form to JSON
    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    // Show overlay and start animation
    showOverlay();
    animateDots();

    if (isTesting) {
      setTimeout(() => {
        console.log("Simulating response...");
        const wasSuccessful = true;

        if (wasSuccessful) {
          showSuccessOverlay();
        } else {
          showFormError("Simulated error occurred. Please try again.");
        }

        contactForm.reset();
        stopDotAnimation();

        setTimeout(() => {
          hideOverlay();
        }, 5000);
      }, 1500); // Simulate 1.5s delay
    } else {
      console.log("Submitting contact form...");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      })
      .then(async (response) => {
          const json = await response.json();
          if (response.status === 200) {
            showSuccessOverlay();
          } else {
            showFormError(json.message);
          }
      })
      .catch((error) => {
          console.error(error);
          showFormError("Something went wrong!");
      })
      .then(() => {
          contactForm.reset();
          stopDotAnimation();
          setTimeout(() => {
            hideOverlay();
          }, 5000);
      });
    }

  });

  function showOverlay() {
    overlay.classList.add("c-contact-form__overlay--visible");
    animateDots();
  }

  function hideOverlay() {
    overlay.classList.remove("c-contact-form__overlay--visible");
    stopDotAnimation();

    setTimeout(() => {
      overlay.innerHTML = `
        <p class="c-contact-form__overlay-text">
          Please wait<span class="dot-animation">.</span>
        </p>
      `;
    }, 300); // Give time for fade-out before resetting
  }

  function animateDots() {
    const target = overlay.querySelector(".dot-animation");
    let dots = 1;
    dotInterval = setInterval(() => {
      dots = (dots % 3) + 1;
      target.textContent = ".".repeat(dots);
    }, 500);
  }

  function stopDotAnimation() {
    clearInterval(dotInterval);
    dotInterval = null;
  }

  function showSuccessOverlay() {
    overlay.innerHTML = `
      <div class="c-contact-form__success">
        <svg class="icon"><use href="#circle-check"></use></svg>
        <h3>Message sent!</h3>
        <p class="body-copy">Your message has been sent. You'll hear back from me within 24 hours.</p>
      </div>
    `;
  }

  function showFormError(message) {
    hideOverlay();
    stopDotAnimation();
    contactFormResult.innerHTML = `
      <svg class="icon"><use href="#circle-exclamation"></use></svg>
      <h5>Something went wrong</h5>
      <p class="body-copy">${message}</p>
    `;

    contactFormResult.style.display = "block";
  }

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