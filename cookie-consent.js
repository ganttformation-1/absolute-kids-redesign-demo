/* Absolute Kids consent controls. No analytics or marketing service is installed.
 * Update VERSION and the privacy notice, then request a new choice whenever
 * optional services or their purposes change. Optional scripts must be inert:
 * <script type="text/plain" data-ak-consent="analytics" data-src="/approved.js">
 * Never load the same optional script through an ordinary script tag as well.
 */
(() => {
  'use strict';
  const KEY = 'absolute-kids-consent';
  const VERSION = '2026-11-25-site-2';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const CATEGORIES = ['analytics', 'marketing'];
  if (window.AbsoluteKidsConsent?.version === VERSION) return;

  let preferences = null;
  let banner;
  let dialog;
  let lastFocus = null;
  let initialized = false;
  let pendingOpen = false;
  const activated = new Map();

  function read() {
    try {
      const record = JSON.parse(window.localStorage.getItem(KEY) || 'null');
      const now = Date.now();
      if (!record || typeof record !== 'object' || Array.isArray(record) ||
          record.version !== VERSION || !Number.isFinite(record.savedAt) ||
          record.savedAt < 0 || record.savedAt > now || now - record.savedAt >= MAX_AGE ||
          typeof record.analytics !== 'boolean' || typeof record.marketing !== 'boolean') return null;
      return {version: VERSION, savedAt: record.savedAt, analytics: record.analytics, marketing: record.marketing};
    } catch (_) {
      // A blocked or unavailable store must not enable optional services.
      return null;
    }
  }

  function has(category) {
    return category === 'necessary' || (CATEGORIES.includes(category) && preferences?.[category] === true);
  }

  function activateScripts() {
    document.querySelectorAll('script[type="text/plain"][data-ak-consent]').forEach(node => {
      const category = node.getAttribute('data-ak-consent');
      if (!CATEGORIES.includes(category) || !has(category) || node.dataset.akActivated === 'true') return;
      const script = document.createElement('script');
      for (const attribute of node.attributes) {
        if (['type', 'src', 'id', 'data-src', 'data-ak-consent', 'data-ak-activated'].includes(attribute.name)) continue;
        script.setAttribute(attribute.name, attribute.value);
      }
      script.async = node.hasAttribute('async');
      const source = node.getAttribute('data-src') || node.getAttribute('src');
      if (source) script.src = source;
      else script.textContent = node.textContent;
      node.dataset.akActivated = 'true';
      activated.set(node, {category, script});
      node.insertAdjacentElement('afterend', script);
    });
  }

  function notify() {
    window.dispatchEvent(new CustomEvent('ak:consent-changed', {
      detail: {necessary: true, analytics: has('analytics'), marketing: has('marketing')}
    }));
    activateScripts();
  }

  function focusWithoutScroll(element) {
    if (!element?.isConnected || element.hidden || element.closest('[hidden]')) return false;
    try { element.focus({preventScroll: true}); } catch (_) { element.focus(); }
    return true;
  }

  function restoreFocus() {
    if (!focusWithoutScroll(lastFocus)) focusWithoutScroll(document.querySelector('[data-ak-cookie-settings], #ak-open-cookie-settings'));
  }

  function closePreferences() {
    if (!dialog?.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); restoreFocus(); }
  }

  function save(analytics, marketing) {
    const old = preferences;
    preferences = {version: VERSION, savedAt: Date.now(), analytics: Boolean(analytics), marketing: Boolean(marketing)};
    let persisted = false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(preferences));
      persisted = true;
    } catch (_) {
      // The choice still applies in memory for this page when storage is blocked.
    }
    const revoked = CATEGORIES.filter(category => old?.[category] === true && !preferences[category]);
    let stoppedActiveScript = false;
    for (const [node, entry] of activated) {
      if (!revoked.includes(entry.category)) continue;
      stoppedActiveScript = true;
      entry.script.remove();
      delete node.dataset.akActivated;
      activated.delete(node);
    }
    banner.hidden = true;
    const wasOpen = Boolean(dialog?.open);
    closePreferences();
    notify();
    if (!wasOpen && banner.contains(document.activeElement)) restoreFocus();
    // A fresh document stops previously executed optional scripts. Do not reload
    // into a stale opt-in when the browser prevented saving the new preference.
    if (stoppedActiveScript && persisted) window.location.reload();
  }

  function openPreferences() {
    if (!initialized) { pendingOpen = true; return; }
    lastFocus = document.activeElement;
    dialog.querySelector('#ak-analytics').checked = has('analytics');
    dialog.querySelector('#ak-marketing').checked = has('marketing');
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    focusWithoutScroll(dialog.querySelector('.ak-cookie-close'));
  }

  function wireLegalLinks() {
    let footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.setAttribute('aria-label', 'Legal information');
      document.body.appendChild(footer);
    }
    let nav = footer.querySelector('.ak-legal-links');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'ak-legal-links';
      nav.setAttribute('aria-label', 'Privacy and legal links');
      nav.innerHTML = '<a href="/privacy-policy.html">Privacy Policy</a><a href="/terms-of-service.html">Terms of Service</a><button type="button" id="ak-open-cookie-settings" data-ak-cookie-settings>Cookie Settings</button>';
      footer.appendChild(nav);
    }
    if (!nav.querySelector('[data-ak-cookie-settings], #ak-open-cookie-settings')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-ak-cookie-settings', '');
      button.textContent = 'Cookie Settings';
      nav.appendChild(button);
    }
    document.querySelectorAll('[data-ak-cookie-settings], #ak-open-cookie-settings').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'ak-cookie-preferences');
      if (button.dataset.akCookieBound === 'true') return;
      button.dataset.akCookieBound = 'true';
      button.addEventListener('click', openPreferences);
    });
  }

  function init() {
    if (initialized) return;
    if (!document.getElementById('ak-cookie-styles')) {
      const stylesheet = document.createElement('link');
      stylesheet.id = 'ak-cookie-styles';
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/cookie-consent.css';
      document.head.appendChild(stylesheet);
    }
    preferences = read();
    banner = document.createElement('section');
    banner.className = 'ak-cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.hidden = Boolean(preferences);
    banner.innerHTML = `
      <div class="ak-cookie-copy"><h2>Your privacy choices</h2><p>We use essential browser storage to remember your preferences. Analytics and marketing trackers are not installed on this website. Your choices apply to this version; new services will ask again. <a href="/privacy-policy.html#cookies">Read our Privacy Policy</a>.</p></div>
      <div class="ak-cookie-buttons"><button type="button" class="ak-cookie-button" data-ak-choice="reject">Reject optional</button><button type="button" class="ak-cookie-button" data-ak-choice="customize">Customize</button><button type="button" class="ak-cookie-button" data-ak-choice="accept">Accept all</button></div>`;
    document.body.appendChild(banner);
    dialog = document.createElement('dialog');
    dialog.id = 'ak-cookie-preferences';
    dialog.className = 'ak-cookie-dialog';
    dialog.setAttribute('aria-labelledby', 'ak-cookie-dialog-title');
    dialog.setAttribute('aria-describedby', 'ak-cookie-dialog-description');
    dialog.setAttribute('aria-modal', 'true');
    dialog.innerHTML = `
      <div class="ak-cookie-dialog-head"><h2 id="ak-cookie-dialog-title">Cookie preferences</h2><button type="button" class="ak-cookie-close" aria-label="Close cookie settings">×</button></div>
      <p id="ak-cookie-dialog-description">No analytics or marketing trackers are installed in this version. These choices do not authorize services added later. If services change, we will describe them and ask for a new choice.</p>
      <div class="ak-cookie-category"><div><strong>Strictly necessary</strong><small>Used to remember your privacy choice and provide core website functions.</small></div><input type="checkbox" checked disabled aria-label="Strictly necessary storage is always active"></div>
      <label class="ak-cookie-category" for="ak-analytics"><span><strong>Analytics</strong><small>Not currently used. No analytics service runs when you select this option.</small></span><input id="ak-analytics" type="checkbox"></label>
      <label class="ak-cookie-category" for="ak-marketing"><span><strong>Marketing</strong><small>Not currently used. No advertising or remarketing service runs when you select this option.</small></span><input id="ak-marketing" type="checkbox"></label>
      <div class="ak-cookie-dialog-actions"><button type="button" class="ak-cookie-button" data-ak-choice="reject">Reject optional</button><button type="button" class="ak-cookie-button" id="ak-cookie-save">Save my choices</button></div>`;
    document.body.appendChild(dialog);
    banner.querySelector('[data-ak-choice="reject"]').addEventListener('click', () => save(false, false));
    dialog.querySelector('[data-ak-choice="reject"]').addEventListener('click', () => save(false, false));
    banner.querySelector('[data-ak-choice="accept"]').addEventListener('click', () => save(true, true));
    banner.querySelector('[data-ak-choice="customize"]').addEventListener('click', openPreferences);
    dialog.querySelector('.ak-cookie-close').addEventListener('click', closePreferences);
    dialog.querySelector('#ak-cookie-save').addEventListener('click', () => save(dialog.querySelector('#ak-analytics').checked, dialog.querySelector('#ak-marketing').checked));
    dialog.addEventListener('close', restoreFocus);
    dialog.addEventListener('cancel', event => { event.preventDefault(); closePreferences(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); closePreferences(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter(element => !element.hidden);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    initialized = true;
    wireLegalLinks();
    notify();
    if (pendingOpen) { pendingOpen = false; openPreferences(); }
  }

  window.AbsoluteKidsConsent = Object.freeze({
    version: VERSION,
    hasConsent: has,
    getPreferences: () => ({version: VERSION, necessary: true, analytics: has('analytics'), marketing: has('marketing'), savedAt: preferences?.savedAt ?? null}),
    openPreferences,
    onChange: callback => {
      if (typeof callback !== 'function') return () => {};
      const listener = event => callback(event.detail);
      window.addEventListener('ak:consent-changed', listener);
      return () => window.removeEventListener('ak:consent-changed', listener);
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
