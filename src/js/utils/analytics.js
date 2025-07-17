export function trackEvent(action, { category = 'engagement', label = undefined, value = undefined } = {}) {
  if (typeof gtag !== 'function') return;
  const payload = { event_category: category };
  if (label) payload.event_label = label;
  if (value !== undefined) payload.value = value;
  gtag('event', action, payload);
}