document.addEventListener("DOMContentLoaded", () => {
  let cart = [];
  let currentCurrency = localStorage.getItem("selectedCurrency") || "USD";
  let currencySymbol = "$";

  const currencyRates = {
    USD: 1,
    EUR: 0.917,
    GBP: 0.8712,
    JPY: 147.46,
    AUD: 1.5145,
    CAD: 1.3961,
    CHF: 0.7956
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF"
  };

  const countryCurrencyMap = {
    US: "USD",
    GB: "GBP",
    DE: "EUR",
    FR: "EUR",
    JP: "JPY",
    AU: "AUD",
    CA: "CAD",
    CH: "CHF"
  };

  const cartSidebar = document.getElementById("cart");
  const cartItemsList = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartToggleBtn = document.getElementById("cart-toggle");
  const closeCartBtn = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const shopContainer = document.getElementById("shop-container");
  const shopGrid = document.querySelector(".shop");
  const shopItems = document.querySelectorAll(".shop .item");
  const currencySelect = document.getElementById("currency-select");

  const popup = document.createElement("div");
  popup.id = "checkout-popup";
  document.body.appendChild(popup);

  const purchaseSound = new Audio("Sounds/Purchased.mp4");

  // Load saved cart
  const savedCart = JSON.parse(localStorage.getItem("cartItems"));
  if (savedCart && Array.isArray(savedCart)) cart = savedCart;

  // Detect user's country currency (auto on first load)
  async function detectCurrency() {
    if (!localStorage.getItem("selectedCurrency")) {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const countryCode = data.country_code;
        if (countryCurrencyMap[countryCode]) {
          currentCurrency = countryCurrencyMap[countryCode];
          localStorage.setItem("selectedCurrency", currentCurrency);
        }
      } catch (err) {
        console.log("Currency auto-detect failed, defaulting to USD", err);
      }
    }

    currencySymbol = currencySymbols[currentCurrency];
    if (currencySelect) currencySelect.value = currentCurrency;
    highlightSelectedCurrency();
    updateShopPrices();
    updateCart();
  }

  detectCurrency();

  // Highlight selected currency (blue outline)
  function highlightSelectedCurrency() {
    const options = document.querySelectorAll("#currency-select option");
    options.forEach(opt => {
      if (opt.value === currentCurrency) {
        opt.style.outline = "2px solid #007BFF";
        opt.style.backgroundColor = "#e0f0ff";
        opt.style.color = "#000";
      } else {
        opt.style.outline = "none";
        opt.style.backgroundColor = "#fff";
        opt.style.color = "#000";
      }
    });
  }

  // Sidebar toggle
  cartToggleBtn.addEventListener("click", () => {
    cartSidebar.classList.add("open");
    shopGrid.classList.add("slide-left");
  });

  closeCartBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
    shopGrid.classList.remove("slide-left");
  });

  // Add to cart
  window.addToCart = function(name, priceUSD) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      alert(`${name} is already in your cart!`);
      return;
    }
    cart.push({ name, priceUSD });
    saveCart();
    updateCart();
  };

  // Remove from cart
  function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCart();
  }

  function saveCart() {
    localStorage.setItem("cartItems", JSON.stringify(cart));
  }

  // Round up to nearest integer
  function roundUpInt(price) {
    return Math.ceil(price);
  }

  // Update prices in shop
  function updateShopPrices() {
    shopItems.forEach(item => {
      const priceElement = item.querySelector("p");
      if (!priceElement.dataset.usd) {
        const rawPrice = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ""));
        priceElement.dataset.usd = rawPrice;
      }
      const priceUSD = parseFloat(priceElement.dataset.usd);
      const converted = priceUSD * currencyRates[currentCurrency];
      priceElement.textContent = `${currencySymbol}${roundUpInt(converted)}`;
    });
  }

  // Update cart
  function updateCart() {
    cartItemsList.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
      const li = document.createElement("li");
      const convertedPrice = item.priceUSD * currencyRates[currentCurrency];
      const displayPrice = roundUpInt(convertedPrice);

      const itemText = document.createElement("span");
      itemText.textContent = `${item.name} - ${currencySymbol}${displayPrice}`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => removeFromCart(item.name));

      li.appendChild(itemText);
      li.appendChild(removeBtn);
      cartItemsList.appendChild(li);

      total += displayPrice;
    });

    cartTotal.textContent = `${currencySymbol}${roundUpInt(total)}`;
  }

  // Checkout
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const totalPaid = roundUpInt(
      cart.reduce((sum, item) => sum + item.priceUSD * currencyRates[currentCurrency], 0)
    );

    purchaseSound.currentTime = 0;
    purchaseSound.play().catch(err => console.log("Autoplay blocked:", err));

    shopContainer.style.display = "none";
    popup.innerHTML = `😊 Thank you for buying!<br>Total Paid: ${currencySymbol}${totalPaid}`;
    popup.classList.add("show");

    setTimeout(() => {
      popup.classList.remove("show");
      popup.classList.add("fade");
      setTimeout(() => {
        popup.classList.remove("fade");
        popup.textContent = "";
        cart = [];
        saveCart();
        updateCart();
        shopContainer.style.display = "block";
      }, 500);
    }, 2000);
  });

  // Manual currency change
  if (currencySelect) {
    currencySelect.addEventListener("change", (e) => {
      currentCurrency = e.target.value;
      currencySymbol = currencySymbols[currentCurrency];
      localStorage.setItem("selectedCurrency", currentCurrency);
      highlightSelectedCurrency();
      updateShopPrices();
      updateCart();
    });
  }

  updateShopPrices();
  updateCart();
});
