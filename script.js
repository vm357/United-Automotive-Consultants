function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("active");
}

/* NAVBAR SCROLL EFFECT */
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

/* LANGUAGE/TRANSLATION SECTION */
if (typeof i18next !== "undefined") {
  i18next
    .use(i18nextBrowserLanguageDetector)
    .init({
      fallbackLng: "en",
      debug: false
    }, () => {
    const savedLang = localStorage.getItem("lang") || "en"; 
    changeLanguage(savedLang);
  });
}

function loadTranslations(lang) {
  fetch(`locales/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      i18next.addResourceBundle(lang, "translation", data, true, true);
      updateContent();
    });
}

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = i18next.t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = i18next.t(key);
  }); // This allows us to translate placeholders in input fields!
}

function changeLanguage(lang) {
  i18next.changeLanguage(lang, () => {
    localStorage.setItem("lang", lang); // saves language preference (even after refresh); remove if we want it to reset to English on refresh!
    loadTranslations(lang);
  });
}
/* END OF LANGUAGE/TRANSLATION SECTION */

/* ANIMATION ON SCROLL */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".fade-up").forEach(el => {
  observer.observe(el);
});

/* FOR GET PRE-APPROVED PAGE */
// ADDRESS LOGIC
const yearsPrimary = document.getElementById("yearsPrimary");
if (yearsPrimary) {
  yearsPrimary.addEventListener("input", function () {
    const show = this.value < 3;
    document.getElementById("prevAddressPrimary").style.display = show ? "block" : "none";
    document.getElementById("prevAddressTimePrimary").style.display = show ? "flex" : "none";
  });
}

const yearsCo = document.getElementById("yearsCo");
if (yearsCo) {
  yearsCo.addEventListener("input", function () {
    const show = this.value < 3;
    document.getElementById("prevAddressCo").style.display = show ? "block" : "none";
    document.getElementById("prevAddressTimeCo").style.display = show ? "flex" : "none";
  });
}

// EMPLOYMENT LOGIC
const empYearsPrimary = document.getElementById("empYearsPrimary");
if (empYearsPrimary) {
  empYearsPrimary.addEventListener("input", function () {
    const show = this.value < 3;
    document.getElementById("prevEmployerPrimary").style.display = show ? "block" : "none";
    document.getElementById("prevEmployerTimePrimary").style.display = show ? "flex" : "none";
  });
}

const empYearsCo = document.getElementById("empYearsCo");
if (empYearsCo) {
  empYearsCo.addEventListener("input", function () {
    const show = this.value < 3;
    document.getElementById("prevEmployerCo").style.display = show ? "block" : "none";
    document.getElementById("prevEmployerTimeCo").style.display = show ? "flex" : "none";
  });
}

// E-SIGNATURE LOGIC
function setupSignature(canvasId, key) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;

  function start(e) {
    drawing = true;
    draw(e);
  }

  function end() {
    drawing = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  // Mouse
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mouseup", end);
  canvas.addEventListener("mousemove", draw);

  // Touch (mobile)
  canvas.addEventListener("touchstart", start);
  canvas.addEventListener("touchend", end);
  canvas.addEventListener("touchmove", draw);

  return ctx;
}

// Initialize both
const primarySig = setupSignature("signaturePadPrimary", "primary");
const coSig = setupSignature("signaturePadCo", "co");

// Clear function
function clearSignature(type) {
  const canvas = document.getElementById(
    type === "primary" ? "signaturePadPrimary" : "signaturePadCo"
  );
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// For demonstration purposes, this just redirects to a test Stripe checkout page. In a real application, you would want to handle the form submission, validate the data, and then create a checkout session on your server before redirecting.
//submit & go to payment page
function goToPayment() {
  window.location.href = "https://buy.stripe.com/test_xxxxx";
}