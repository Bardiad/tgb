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

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setClearColor(0xffffff, 0); // transparent background

// Scene & camera
const scene  = new THREE.Scene();
const camera = new THREE.OrthographicCamera();
camera.position.z = 1;

// Responsive sizing
let heroWidth = 0, heroHeight = 0;
function resizeRenderer() {
  heroWidth  = hero.clientWidth;
  heroHeight = hero.clientHeight;
  renderer.setSize(heroWidth, heroHeight);
  camera.left   = -heroWidth  / 2;
  camera.right  =  heroWidth  / 2;
  camera.top    =  heroHeight / 2;
  camera.bottom = -heroHeight / 2;
  camera.updateProjectionMatrix();
}
resizeRenderer();
window.addEventListener('resize', resizeRenderer);

// Media-query driven line count
const mq = window.matchMedia('(max-width: 768px)');

function getNumVertical() {
  return mq.matches ? 0 : 20;
}

// Config & shared state
const attractionStrength = 5.05;
const lines              = [];
const baseMaterial       = new THREE.LineBasicMaterial({ color: 0xf2f2f2 });
const baseBrightness     = 0.55;
const hoverBoost         = 0.05;

// Utility: evenly spaced with jitter
function generateJitteredPositions(count, range, jitter) {
  const step = range / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const center = -range / 2 + step * (i + 1);
    return center + THREE.MathUtils.randFloatSpread(jitter);
  });
}

// Create one vertical line, disable culling
function createLine(x1, y1, x2, y2) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x1, y1, 0),
    new THREE.Vector3(x2, y2, 0),
  ]);
  const material = baseMaterial.clone();
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false; 
  return line;
}

// Generate lines based on current breakpoint
function generateVerticalLines() {
  const count = getNumVertical();
  const positions = generateJitteredPositions(count, heroWidth, 100);
  positions.forEach(baseX => {
    const line = createLine(baseX, -heroHeight/2, baseX, heroHeight/2);
    line.userData = {
      base:      baseX,
      offset:    Math.random() * 100,
      amplitude: 15 + Math.random() * 15,
      position:  baseX,
      velocity:  0
    };
    scene.add(line);
    lines.push(line);
  });
}

// Clear old lines and build new ones
function updateLines() {
  lines.forEach(line => scene.remove(line));
  lines.length = 0;
  generateVerticalLines();
}
// Rebuild whenever the media query state changes
mq.addEventListener('change', updateLines);

// Initial line build
updateLines();

// Mouse tracking
let mouse          = new THREE.Vector2(9999, 9999);
let mouseActive    = false;
let mouseInfluence = 0;

hero.addEventListener('mousemove', e => {
  const r = hero.getBoundingClientRect();
  mouse.x = e.clientX - r.left  - r.width/2;
  mouse.y = -(e.clientY - r.top - r.height/2);
  mouseActive = true;
});
hero.addEventListener('mouseleave', () => {
  mouseActive = false;
});

// Click ⇒ velocity-based repel
hero.addEventListener('click', e => {
  const r      = hero.getBoundingClientRect();
  const clickX = e.clientX - r.left - r.width/2;
  lines.forEach(line => {
    const d    = line.userData;
    const dx   = d.position - clickX;
    const dist = Math.abs(dx);
    const dir  = dx >= 0 ? 1 : -1;
    const strength = Math.max(0.2, 1 - dist / 600);
    d.velocity = dir * 80 * strength;
  });
});

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);

  // ease mouse influence in/out
  const targetInf = mouseActive ? 1 : 0;
  mouseInfluence += (targetInf - mouseInfluence) * 0.09;

  lines.forEach(line => {
    const posAttr = line.geometry.attributes.position;
    const d       = line.userData;

    // 1) base + drift
    const drift = Math.sin(time * 0.0003 + d.offset) * d.amplitude;
    let x       = d.base + drift;

    // 2) apply velocity (repel) & damping
    d.velocity *= 0.92;
    x += d.velocity;
    d.position = x;

    // 3) mouse attraction
    const distM     = Math.abs(mouse.x - d.position);
    const attraction = (mouse.x - d.position)
                      * attractionStrength
                      / (distM * 0.05 + 1);
    d.position += attraction * mouseInfluence;

    // 4) brightness
    const brightness = baseBrightness
                     + Math.max(0, 1 - distM / 500)
                       * hoverBoost
                       * mouseInfluence;
    line.material.color.setScalar(brightness);

    // 5) write back to geometry
    posAttr.setXYZ(0, d.position, -heroHeight/2, 0);
    posAttr.setXYZ(1, d.position,  heroHeight/2, 0);
    posAttr.needsUpdate = true;
  });

  renderer.render(scene, camera);
}
animate();




  // const hero = document.getElementById('hero');
  // const canvas = document.getElementById('hero-grid');

  // const renderer = new THREE.WebGLRenderer({
  //   canvas,
  //   antialias: true,
  //   alpha: true
  // });
  // renderer.setClearColor(0xffffff, 0); // Transparent background

  // const scene = new THREE.Scene();
  // const camera = new THREE.OrthographicCamera();
  // camera.position.z = 1;

  // let heroWidth = 0;
  // let heroHeight = 0;

  // // Resize renderer & camera to hero
  // function resizeRenderer() {
  //   heroWidth = hero.clientWidth;
  //   heroHeight = hero.clientHeight;

  //   renderer.setSize(heroWidth, heroHeight);

  //   camera.left = heroWidth / -2;
  //   camera.right = heroWidth / 2;
  //   camera.top = heroHeight / 2;
  //   camera.bottom = heroHeight / -2;
  //   camera.updateProjectionMatrix();
  // }
  // resizeRenderer();
  // window.addEventListener('resize', resizeRenderer);

  // // Config
  // const numVertical = 25;
  // const numHorizontal = 8;
  // const attractionStrength = 3.05;

  // const lines = [];

  // const baseMaterial = new THREE.LineBasicMaterial({ color: 0xf2f2f2 });

  // // Utility: jittered spacing
  // function generateJitteredPositions(count, range, jitter) {
  //   const step = range / (count + 1);
  //   return Array.from({ length: count }, (_, i) => {
  //     const base = -range / 2 + step * (i + 1);
  //     return base + THREE.MathUtils.randFloatSpread(jitter);
  //   });
  // }

  // function createLine(x1, y1, x2, y2) {
  //   const geometry = new THREE.BufferGeometry().setFromPoints([
  //     new THREE.Vector3(x1, y1, 0),
  //     new THREE.Vector3(x2, y2, 0),
  //   ]);

  //   const material = baseMaterial.clone(); 
  //   return new THREE.Line(geometry, material);
  // }

  // function generateGridLines() {
  //   const verticalPositions = generateJitteredPositions(numVertical, heroWidth, 100); // jitter 100px
  //   const horizontalPositions = generateJitteredPositions(numHorizontal, heroHeight, 100);

  //   // vertical lines
  //   verticalPositions.forEach(x => {
  //     const line = createLine(x, -heroHeight / 2, x, heroHeight / 2);
  //     line.userData = { 
  //       axis: 'v', 
  //       base: x, 
  //       offset: Math.random() * 100, 
  //       amplitude: 15 + Math.random() * 15 // 15–30px
  //     };
  //     scene.add(line);
  //     lines.push(line);
  //   });

  //   // horizontal lines
  //   horizontalPositions.forEach(y => {
  //     const line = createLine(-heroWidth / 2, y, heroWidth / 2, y);
  //     line.userData = { axis: 'h', base: y, offset: Math.random() * 100 };
  //     scene.add(line);
  //     lines.push(line);
  //   });
  // }

  // generateGridLines();

  // // Mouse Interaction
  // let mouse = new THREE.Vector2(9999, 9999);
  // let mouseActive = false;
  // let mouseInfluence = 0; // 0 = no influence, 1 = full

  // hero.addEventListener('mousemove', e => {
  //   const rect = hero.getBoundingClientRect();
  //   mouse.x = e.clientX - rect.left - rect.width / 2;
  //   mouse.y = -(e.clientY - rect.top - rect.height / 2);
  //   mouseActive = true;
  // });

  // hero.addEventListener('mouseleave', () => {
  //   mouseActive = false;
  // });

  // // Animate
  // function animate(time) {
  //   requestAnimationFrame(animate);

  //   // Smoothly interpolate mouse influence
  //   const targetInfluence = mouseActive ? 1 : 0;
  //   mouseInfluence += (targetInfluence - mouseInfluence) * 0.09;

  //   lines.forEach(line => {
  //     const pos = line.geometry.attributes.position;
  //     const { axis, base, offset } = line.userData;
  //     const drift = Math.sin(time * 0.0005 + offset) * line.userData.amplitude;

  //     const baseBrightness = 0.55;   // Subtle grey
  //     const hoverBoost = 0.05;       // ~5% lighter near mouse

  //     if (axis === 'v') {
  //       const x = base + drift;
  //       let finalX = x;

  //       const dist = Math.abs(mouse.x - x);
  //       const attraction = (mouse.x - x) * attractionStrength / (dist * 0.05 + 1);
  //       finalX += attraction * mouseInfluence;

  //       const brightness = baseBrightness + Math.max(0, 1 - dist / 500) * hoverBoost * mouseInfluence;
  //       line.material.color.setScalar(brightness);

  //       pos.setXYZ(0, finalX, -heroHeight / 2, 0);
  //       pos.setXYZ(1, finalX, heroHeight / 2, 0);
  //     }

  //     if (axis === 'h') {
  //       const y = base + drift;
  //       let finalY = y;

  //       const dist = Math.abs(mouse.y - y);
  //       const attraction = (mouse.y - y) * attractionStrength / (dist * 0.05 + 1);
  //       finalY += attraction * mouseInfluence;

  //       const brightness = baseBrightness + Math.max(0, 1 - dist / 500) * hoverBoost * mouseInfluence;
  //       line.material.color.setScalar(brightness);

  //       pos.setXYZ(0, -heroWidth / 2, finalY, 0);
  //       pos.setXYZ(1, heroWidth / 2, finalY, 0);
  //     }

  //     pos.needsUpdate = true;
  //   });

  //   renderer.render(scene, camera);
  // }

  // animate();

});