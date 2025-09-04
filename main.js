// main.js — Robust Unique View Counter (auto-healing)

(() => {
  if (window.ViewCounter && window.ViewCounter._initialized) return;

  // ========== CONFIG ==========
  const NAMESPACE = "realscripts-q-youtubestuff"; // site-wide namespace
  const TOTAL_KEY = "unique-visitors";

  // localStorage keys
  const flagKey = () => `viewcounter.unique.recorded@${NAMESPACE}`;
  const fallbackTotalKey = `viewcounter.fallback.total@${NAMESPACE}`;
  const fallbackFlagKey = () => `viewcounter.fallback.flag@${NAMESPACE}`;

  // ========== DOM helpers ==========
  const totalEl = document.getElementById("totalViews");
  const statusEl = document.getElementById("totalStatus");

  const setStatus = (txt, cls) => {
    if (!statusEl) return;
    statusEl.textContent = txt;
    statusEl.className = cls || "";
  };

  const showTotal = (val) => {
    if (!totalEl) return;
    if (val == null || isNaN(val) || val < 0) {
      totalEl.textContent = "—";
    } else {
      totalEl.textContent = Number(val).toLocaleString();
    }
  };

  // ========== CountAPI helpers ==========
  async function apiFetch(url) {
    const res = await fetch(url).catch(() => null);
    if (!res) return { ok: false, status: 0, json: null };
    let json = null;
    try {
      json = await res.json();
    } catch {}
    return { ok: res.ok, status: res.status, json };
  }

  async function createKey(key, val = 0) {
    const url = `https://api.countapi.xyz/create?namespace=${NAMESPACE}&key=${key}&value=${val}`;
    return (await apiFetch(url)).ok;
  }

  async function getCount(key) {
    const url = `https://api.countapi.xyz/get/${NAMESPACE}/${key}`;
    const r = await apiFetch(url);
    if (r.status === 404) return { notFound: true, value: null };
    if (!r.ok || !r.json || typeof r.json.value === "undefined") throw new Error("CountAPI get failed");
    return { notFound: false, value: Number(r.json.value) };
  }

  async function hitCount(key) {
    const url = `https://api.countapi.xyz/hit/${NAMESPACE}/${key}`;
    const r = await apiFetch(url);
    if (!r.ok || !r.json || typeof r.json.value === "undefined") throw new Error("CountAPI hit failed");
    return Number(r.json.value);
  }

  // ========== Fallback (localStorage only) ==========
  function fallbackInc() {
    const flag = fallbackFlagKey();
    let total = parseInt(localStorage.getItem(fallbackTotalKey) || "0", 10) || 0;
    if (!localStorage.getItem(flag)) {
      total++;
      localStorage.setItem(fallbackTotalKey, String(total));
      localStorage.setItem(flag, "1");
    }
    return total;
  }

  function fallbackGet() {
    return parseInt(localStorage.getItem(fallbackTotalKey) || "0", 10) || 0;
  }

  // ========== Auto-healing reset ==========
  function autoReset() {
    localStorage.removeItem(flagKey());
    localStorage.removeItem(fallbackFlagKey());
    console.warn("⚠️ Auto-reset local visitor flags due to invalid counter.");
  }

  // ========== Main flow ==========
  async function run() {
    if (!totalEl) return;

    try {
      setStatus("checking...", "");

      const res = await getCount(TOTAL_KEY);
      if (res.notFound) {
        await createKey(TOTAL_KEY, 0);
      }

      let total;
      if (!localStorage.getItem(flagKey())) {
        total = await hitCount(TOTAL_KEY);
        localStorage.setItem(flagKey(), "1");
      } else {
        const fresh = await getCount(TOTAL_KEY);
        total = fresh.value;
      }

      // auto-heal if broken
      if (!total || isNaN(total) || total < 0) {
        autoReset();
        total = await hitCount(TOTAL_KEY); // recount
        localStorage.setItem(flagKey(), "1");
      }

      showTotal(total);
      setStatus("online", "ok");
      return;
    } catch (err) {
      console.error("CountAPI failed, using fallback:", err);
    }

    // fallback path
    try {
      const total = fallbackInc();
      showTotal(total);
      setStatus("offline — fallback", "warn");
    } catch (e) {
      console.error("Fallback failed", e);
      showTotal(null);
      setStatus("error", "warn");
    }
  }

  run();

  // ========== Expose API ==========
  window.ViewCounter = {
    _initialized: true,
    resetLocal: autoReset,
    refresh: run,
  };
})();
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

