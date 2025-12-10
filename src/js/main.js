import { attachConfettiEffect } from './utils/confetti.js';
import { trackEvent } from './utils/analytics.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165/build/three.module.js';



const isTesting = true;

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

    if (!backToTopBtn) {
      return;
    }
    
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




  //Hero bg animation 
  const hero   = document.getElementById('hero');
  const canvas = document.getElementById('hero-grid');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0xffffff, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  camera.position.z = 1;

  // ─── CONFIG ────────────────────────────────────────────────────────────────────
  let heroW = 0, heroH = 0;

  // grid variables
  const colSpacing     = 16;
  const rowSpacing     = 16;
  const dotSize        = 8;
  const dotRadius      = 2;

  // repulsion settings
  const repelRadius    = 140;
  const maxRepelDist   = 60;
  const easeFactor     = 0.20;

  // colours
  const greyColor   = new THREE.Color(0xe0e0e0);
  const purpleColor = new THREE.Color(0x843FC4);

  let sprites = [];
  const spriteGroup = new THREE.Group();
  scene.add(spriteGroup);

  // Mouse
  let mouse         = new THREE.Vector2(1e5,1e5);
  let mouseActive   = false;

  // ─── TEXTURE CREATION (move this up!) ─────────────────────────────────────────
  function makeDotTexture() {
    const c = document.createElement('canvas');
    c.width = dotSize; c.height = dotSize;
    const ctx = c.getContext('2d');
    const r = dotRadius;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(dotSize - r, 0);
    ctx.quadraticCurveTo(dotSize, 0, dotSize, r);
    ctx.lineTo(dotSize, dotSize - r);
    ctx.quadraticCurveTo(dotSize, dotSize, dotSize - r, dotSize);
    ctx.lineTo(r, dotSize);
    ctx.quadraticCurveTo(0, dotSize, 0, dotSize - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
  }
  const dotTexture = makeDotTexture();

  // ─── GRID BUILDING ─────────────────────────────────────────────────────────────
  function generateJitteredPositions(count, range, jitter) {
    const step = range / (count + 1);
    return Array.from({ length: count }, (_, i) => {
      const center = -range/2 + step*(i+1);
      return center + THREE.MathUtils.randFloatSpread(jitter);
    });
  }

  function buildGrid() {
    // clear
    sprites.forEach(s => {
      spriteGroup.remove(s);
      s.material.dispose();
    });
    sprites.length = 0;

    const cols = Math.floor(heroW / colSpacing);
    const rows = Math.floor(heroH / rowSpacing);
    const startX = -heroW/2 + (heroW - cols*colSpacing)/2 + colSpacing/2;
    const startY = -heroH/2 + (heroH - rows*rowSpacing)/2 + rowSpacing/2;

    for (let yi = 0; yi <= rows; yi++) {
      const y = startY + yi*rowSpacing;
      for (let xi = 0; xi <= cols; xi++) {
        const x = startX + xi*colSpacing;
        const mat = new THREE.SpriteMaterial({
          map: dotTexture,
          color: greyColor.clone(),
          transparent: true,
          opacity: 0.6
        });
        const spr = new THREE.Sprite(mat);
        spr.position.set(x, y, 0);
        spr.scale.set(dotSize, dotSize, 1);
        spr.userData = {
          orig: new THREE.Vector2(x, y),
          cur:  new THREE.Vector2(x, y)
        };
        spriteGroup.add(spr);
        sprites.push(spr);
      }
    }
  }

  // ─── RESIZE + INITIAL GRID ─────────────────────────────────────────────────────
  function resize() {
    heroW = hero.clientWidth;
    heroH = hero.clientHeight;
    renderer.setSize(heroW, heroH);
    camera.left   = -heroW/2;
    camera.right  =  heroW/2;
    camera.top    =  heroH/2;
    camera.bottom = -heroH/2;
    camera.updateProjectionMatrix();
    buildGrid();
  }

  window.addEventListener('resize', resize);
  resize();

  // ─── MOUSE EVENTS ─────────────────────────────────────────────────────────────
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left  - r.width/2;
    mouse.y = -(e.clientY - r.top - r.height/2);
    mouseActive = true;
  });
  hero.addEventListener('mouseleave', () => {
    mouseActive = false;
    mouse.set(1e5,1e5);
  });

  // ─── ANIMATE ──────────────────────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    sprites.forEach(s => {
      const u = s.userData;
      const dx = u.orig.x - mouse.x;
      const dy = u.orig.y - mouse.y;
      const d  = Math.hypot(dx, dy);
      const inf = Math.max(0, 1 - d/repelRadius);
      const dirx = d>0 ? dx/d : 0, diry = d>0 ? dy/d : 0;
      const tx = u.orig.x + dirx * maxRepelDist * inf;
      const ty = u.orig.y + diry * maxRepelDist * inf;
      u.cur.x += (tx - u.cur.x) * easeFactor;
      u.cur.y += (ty - u.cur.y) * easeFactor;
      s.position.set(u.cur.x, u.cur.y, 0);
      // colour
      const t = inf * (mouseActive ? 1 : 0);
      s.material.color.copy(greyColor).lerp(purpleColor, t);
    });
    renderer.render(scene, camera);
  }
  animate();



});