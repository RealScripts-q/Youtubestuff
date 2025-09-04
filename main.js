// =========================
// Unique View Counter (shared across all pages)
// =========================

const NAMESPACE = "realscripts-q-youtubestuff";
const TOTAL_KEY = "unique-visitors";

// Local flag so each device only counts once
function uniqueFlagKey() {
  return `viewcounter.unique.recorded@${NAMESPACE}`;
}

// CountAPI helpers
async function hitCount(key) {
  const url = `https://api.countapi.xyz/hit/${NAMESPACE}/${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("CountAPI error");
  const data = await res.json();
  return data.value;
}

async function getCount(key) {
  const url = `https://api.countapi.xyz/get/${NAMESPACE}/${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("CountAPI error");
  const data = await res.json();
  return data.value;
}

// Main setup function
(async function setupViewCounter() {
  const totalEl = document.getElementById("totalViews");
  if (!totalEl) return; // if page has no counter, skip

  try {
    const flag = uniqueFlagKey();
    let total;
    if (!localStorage.getItem(flag)) {
      // First visit → increment
      total = await hitCount(TOTAL_KEY);
      localStorage.setItem(flag, "1");
    } else {
      // Already counted → just fetch
      total = await getCount(TOTAL_KEY);
    }
    totalEl.textContent = Number(total).toLocaleString();
  } catch (err) {
    console.error("View counter error:", err);
    totalEl.textContent = "—";
  }
})();
