import { attachConfettiEffect } from './utils/confetti.js';
import { trackEvent } from './utils/analytics.js'


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

  const FOCUSABLE_SELECTORS =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';  

  MicroModal.init();

  const yearEl = document.querySelector(".js-year");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Confetti Button
  const confettiButtons =  document.querySelectorAll(".js-confetti");
  confettiButtons.forEach((el) => {
    attachConfettiEffect(el);
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

  //Custom even tracking for buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-gtag-event]');
    if (!btn) return;
    trackEvent(btn.dataset.gtagEvent, {
      category: 'button',
      label: btn.textContent.trim()
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

  //throttle scoll events
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

  //Mobile menu handle esc
  const mobileNav = document.querySelector('.c-mobile-nav');
  const toggleBtn = document.querySelector('.c-mobile-nav__toggle');
  const menuBg  = mobileNav.querySelector('.c-mobile-nav__menu');
  const links   = mobileNav.querySelectorAll('.c-mobile-nav__item a');
  const closeIcon = mobileNav.querySelector('.icon--close');

  let focusableEls = [];
  let firstFocusable, lastFocusable, prevActive;  

  mobileNav.addEventListener('toggle', () => {
    // If it just closed, wipe out any leftover animations
    if (!mobileNav.open) {
      // 1) nuke inline animation styles
      menuBg.style.animation = 'none';
      links.forEach(a => a.style.animation = 'none');

      // 2) force a reflow so the UA forgets them
      void menuBg.offsetWidth;
      links.forEach(a => void a.offsetWidth);

      // 3) remove our inline overrides so CSS animations apply next time
      menuBg.style.animation = '';
      links.forEach(a => a.style.animation = '');
    }

    handleToggle();
  });

  function handleToggle() {
    if (mobileNav.open) {
      // store where we came from
      prevActive = document.activeElement;

      // collect & identify first/last
      focusableEls = Array.from(menuBg.querySelectorAll(FOCUSABLE_SELECTORS))
        .filter(el => el.offsetParent !== null); // only visible
      firstFocusable = focusableEls[0];
      lastFocusable  = focusableEls[focusableEls.length - 1];

      // send focus into the menu
      firstFocusable?.focus();

      // trap Tab/Shift+Tab / and handle Esc
      document.addEventListener('keydown', trapTab);
    } else {
      document.removeEventListener('keydown', trapTab);
      // restore focus
      (prevActive || toggleBtn).focus();
    }
  }

  function trapTab(e) {
    if (!mobileNav.open) return;

    switch (e.key) {
      case 'Tab':
        if (focusableEls.length === 0) {
          e.preventDefault();
          break;
        }
        if (e.shiftKey) {
          // SHIFT + TAB on first -> go to last
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // TAB on last -> go to first
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
        break;
      case 'Escape':
        // close on Esc
        mobileNav.open = false;
        break;
    }
  }  

  function closeMobileMenu() {
    mobileNav.open = false;
    toggleBtn.focus();
  }

  menuBg.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => { 

      mobileNav.open = false;

      // figure out the anchor name
      const url      = new URL(link.getAttribute('href'), window.location.href);
      const samePage = url.pathname === window.location.pathname;

      if (samePage && url.hash) {
        e.preventDefault();
        
        setTimeout(() => {
          const target = document.getElementById(url.hash.slice(1));

          if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
          }
          history.replaceState(null, '', hash);
        }, 0);           
      }
   
      
    });
  });

  closeIcon.addEventListener('click', closeMobileMenu);

  closeIcon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeMobileMenu();
    }
  });


});