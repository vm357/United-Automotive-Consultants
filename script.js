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
    document.getElementById("prevAddressPrimary").style.display =
      this.value < 3 ? "block" : "none";
  });
}

const yearsCo = document.getElementById("yearsCo");
if (yearsCo) {
  yearsCo.addEventListener("input", function () {
    document.getElementById("prevAddressCo").style.display =
      this.value < 3 ? "block" : "none";
  });
}

// EMPLOYMENT LOGIC
const empYearsPrimary = document.getElementById("empYearsPrimary");
if (empYearsPrimary) {
  empYearsPrimary.addEventListener("input", function () {
    document.getElementById("prevEmployerPrimary").style.display =
      this.value < 3 ? "block" : "none";
  });
}

const empYearsCo = document.getElementById("empYearsCo");
if (empYearsCo) {
  empYearsCo.addEventListener("input", function () {
    document.getElementById("prevEmployerCo").style.display =
      this.value < 3 ? "block" : "none";
  });
}

//submit & go to payment page
function goToPayment() {
  window.location.href = "https://buy.stripe.com/test_xxxxx";
}