function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("active");
}

/* NAVBAR SCROLL EFFECT */
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

/* LANGUAGE TOGGLE */
const toggle = document.getElementById("langToggle");
const label = document.getElementById("langLabel");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    label.innerText = "Español";

    document.getElementById("heroTitle").innerHTML =
      "El mejor corredor de autos <br> y seguros en NJ";

    document.getElementById("heroLine1").innerText =
      "Buscamos entre docenas de concesionarios y aseguradoras por ti.";

    document.getElementById("heroLine2").innerText =
      "Sin complicaciones. Sin cargos ocultos. Solo ofertas reales.";

    document.getElementById("formTitle").innerText =
      "Encuentra tu auto perfecto";

  } else {
    label.innerText = "English";

    document.getElementById("heroTitle").innerHTML =
      "NJ's Best All-in-One <br> Car and Insurance Broker";

    document.getElementById("heroLine1").innerText =
      "We shop dozens of dealers & insurers so you don't have to.";

    document.getElementById("heroLine2").innerText =
      "No hassle. No hidden fees. Just real deals.";

    document.getElementById("formTitle").innerText =
      "Find Your Perfect Ride";
  }
});

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
document.getElementById("yearsPrimary").addEventListener("input", function () {
  document.getElementById("prevAddressPrimary").style.display =
    this.value < 3 ? "block" : "none";
});

document.getElementById("yearsCo").addEventListener("input", function () {
  document.getElementById("prevAddressCo").style.display =
    this.value < 3 ? "block" : "none";
});

// EMPLOYMENT LOGIC
document.getElementById("empYearsPrimary").addEventListener("input", function () {
  document.getElementById("prevEmployerPrimary").style.display =
    this.value < 3 ? "block" : "none";
});

document.getElementById("empYearsCo").addEventListener("input", function () {
  document.getElementById("prevEmployerCo").style.display =
    this.value < 3 ? "block" : "none";
});

//submit & go to payment page
function goToPayment() {
  window.location.href = "https://buy.stripe.com/test_xxxxx";
}