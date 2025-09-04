// main.js — Robust Unique View Counter (site-wide, multi-page)
// Paste/replace this into your existing main.js

(() => {
  if (window.ViewCounter && window.ViewCounter._initialized) {
    console.log('ViewCounter already initialized.');
    return;
  }

  // ========== CONFIG ==========
  const NAMESPACE = "realscripts-q-youtubestuff"; // keep this consistent across pages
  const TOTAL_KEY = "unique-visitors";

  // localStorage keys used for fallback & flags
  const flagKey = () => `viewcounter.unique.recorded@${NAMESPACE}`;
  const fallbackTotalKey = `viewcounter.fallback.total@${NAMESPACE}`;
  const fallbackFlagKey = () => `viewcounter.fallback.flag@${NAMESPACE}`;

  // ========== DOM helpers ==========
  const getTotalEl = () => document.getElementById('totalViews');
  const getStatusEl = () => document.getElementById('totalStatus'); // optional element

  function setStatus(text, className) {
    const s = getStatusEl();
    if (!s) return;
    s.textContent = text;
    s.className = className || '';
  }

  function showTotal(value) {
    const el = getTotalEl();
    if (!el) return;
    el.textContent = value == null ? '—' : Number(value).toLocaleString();
  }

  // ========== CountAPI helpers ==========
  async function apiFetch(url, opts = {}) {
    const res = await fetch(url, opts);
    // try to parse JSON safely
    let json = null;
    try { json = await res.json(); } catch (e) { /* ignore */ }
    return { ok: res.ok, status: res.status, json, res };
  }

  async function createCountAPIKey(key, initial = 0) {
    // create endpoint: GET /create?namespace=..&key=..&value=..
    const url = `https://api.countapi.xyz/create?namespace=${encodeURIComponent(NAMESPACE)}&key=${encodeURIComponent(key)}&value=${encodeURIComponent(initial)}`;
    const r = await apiFetch(url);
    return r.ok;
  }

  async function getCountAPI(key) {
    const url = `https://api.countapi.xyz/get/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(key)}`;
    const r = await apiFetch(url);
    if (r.status === 404) return { notFound: true, value: null };
    if (!r.ok || !r.json || typeof r.json.value === 'undefined') {
      throw new Error('CountAPI get failed');
    }
    return { notFound: false, value: Number(r.json.value) };
  }

  async function hitCountAPI(key) {
    const url = `https://api.countapi.xyz/hit/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(key)}`;
    const r = await apiFetch(url);
    if (!r.ok || !r.json || typeof r.json.value === 'undefined') {
      throw new Error('CountAPI hit failed');
    }
    return Number(r.json.value);
  }

  // ========== Fallback (localStorage) ==========
  // Note: this fallback is local to each browser. It's used only when CountAPI isn't available.
  function useFallbackIncrementIfNeeded() {
    const flag = fallbackFlagKey();
    let total = parseInt(localStorage.getItem(fallbackTotalKey) || '0', 10) || 0;
    if (!localStorage.getItem(flag)) {
      total += 1;
      localStorage.setItem(fallbackTotalKey, String(total));
      localStorage.setItem(flag, '1');
    }
    return total;
  }

  function fallbackGetTotal() {
    return parseInt(localStorage.getItem(fallbackTotalKey) || '0', 10) || 0;
  }

  // ========== Main flow ==========
  async function run() {
    const totalEl = getTotalEl();
    if (!totalEl) {
      // nothing to update on this page
      return;
    }

    // try CountAPI path
    try {
      setStatus('checking...', '');

      // ensure counter exists (get -> create if 404)
      const getRes = await getCountAPI(TOTAL_KEY);
      if (getRes.notFound) {
        // attempt to create; if creation fails we will fall back later
        const created = await createCountAPIKey(TOTAL_KEY, 0).catch(() => false);
        if (!created) throw new Error('create failed');
      }

      const beenCounted = !!localStorage.getItem(flagKey());

      let total;
      if (!beenCounted) {
        // try to increment (hit)
        total = await hitCountAPI(TOTAL_KEY);
        // mark local flag so we don't double count from this browser
        localStorage.setItem(flagKey(), '1');
      } else {
        // already counted from this browser — fetch the current value
        const fresh = await getCountAPI(TOTAL_KEY);
        if (fresh.notFound) {
          // weird — create and then fetch/hit
          const created = await createCountAPIKey(TOTAL_KEY, 0);
          if (!created) throw new Error('create after notFound failed');
          // still treat as 0
          total = 0;
        } else {
          total = fresh.value;
        }
      }

      // success — show CountAPI number
      showTotal(total);
      setStatus('online', 'ok');
      return;
    } catch (apiErr) {
      // CountAPI failed — fall through to fallback
      // console.warn('CountAPI failed — using fallback', apiErr);
    }

    // Fallback path (localStorage based)
    try {
      setStatus('offline — fallback', 'warn');
      const beenFallbackCounted = !!localStorage.getItem(fallbackFlagKey());
      let fallbackTotal;
      if (!beenFallbackCounted) {
        fallbackTotal = useFallbackIncrementIfNeeded();
      } else {
        fallbackTotal = fallbackGetTotal();
      }
      showTotal(fallbackTotal);
    } catch (fallbackErr) {
      // worst case — show dash
      console.error('ViewCounter fallback failure', fallbackErr);
      showTotal(null);
      setStatus('error', 'warn');
    }
  }

  // Initialize
  run();

  // ========== Public API for testing & debugging ==========
  window.ViewCounter = {
    _initialized: true,
    namespace: NAMESPACE,
    get: async () => {
      // returns the displayed value (tries CountAPI, falls back to fallback)
      try {
        const r = await getCountAPI(TOTAL_KEY);
        if (r.notFound) return null;
        return r.value;
      } catch (e) {
        return fallbackGetTotal();
      }
    },
    resetLocal: () => {
      // Clears local flags & fallback totals on this device (useful for testing)
      localStorage.removeItem(flagKey());
      localStorage.removeItem(fallbackFlagKey());
      localStorage.removeItem(fallbackTotalKey);
      console.log('ViewCounter local state reset.');
    },
    // helper to force a re-run (useful during dev)
    refresh: () => run()
  };
})();

