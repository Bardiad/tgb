export function attachConfettiEffect(element, options = {}) {
  debug;
  const {
    colors = [{ h: 270, s: [50, 80], l: [50, 70] }],
    particleCount = 15,
    maxRadius = 100,
    minRadius = 60,
    duration = [800, 1200],
  } = options;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const container = document.getElementById('confettiContainer') || createConfettiContainer();

  element.addEventListener('click', () => {
    if (prefersReducedMotion) return;

    const rect = element.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + window.scrollY + rect.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');

      // Random hue within defined color ranges
      const color = colors[Math.floor(Math.random() * colors.length)];
      const s = randBetween(...color.s);
      const l = randBetween(...color.l);
      confetti.style.backgroundColor = `hsl(${color.h}, ${s}%, ${l}%)`;

      // Animation duration and direction
      confetti.style.setProperty('--duration', `${randBetween(...duration)}ms`);
      const angle = Math.random() * 2 * Math.PI;
      const radius = randBetween(minRadius, maxRadius);
      confetti.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
      confetti.style.setProperty('--y', `${Math.sin(angle) * radius}px`);

      confetti.style.left = `${originX}px`;
      confetti.style.top = `${originY}px`;

      container.appendChild(confetti);
      setTimeout(() => confetti.remove(), duration[1] + 200);
    }
  });
}

function createConfettiContainer() {
  const container = document.createElement('div');
  container.id = 'confettiContainer';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);
  return container;
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}