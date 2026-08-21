/* HAMBURGER MENU TOGGLE */
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  const burger = document.querySelector(".hamburger");
  if (!nav || !burger) return;

  const open = nav.classList.toggle("active");
  burger.classList.toggle("active", open);
  burger.setAttribute("aria-expanded", open ? "true" : "false");
}

/* KEYBOARD SUPPORT FOR THE HAMBURGER */
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && document.activeElement &&
      document.activeElement.classList.contains("hamburger")) {
    e.preventDefault();
    toggleMenu();
  }
});

/* NAVBAR SCROLL EFFECT */
const navbarEl = document.getElementById("navbar");
let navScrolled = false;
window.addEventListener("scroll", () => {
  if (!navbarEl) return;
  const past = window.scrollY > 50;
  if (past === navScrolled) return;   /* only touch the DOM when the state flips */
  navScrolled = past;
  navbarEl.classList.toggle("scrolled", past);
}, { passive: true });

/* LANGUAGE/TRANSLATION SECTION */
if (typeof i18next !== "undefined") {
  const chain = typeof i18nextBrowserLanguageDetector !== "undefined"
    ? i18next.use(i18nextBrowserLanguageDetector)
    : i18next;

  chain
    .init({
      fallbackLng: "en",
      debug: false
    }, () => {
    const savedLang = localStorage.getItem("lang") || "en"; 
    changeLanguage(savedLang);
  });
}

/* Where an applicant lands after a successful submit.
   Replace with the live Stripe payment link once it exists. */
const POST_SUBMIT_URL = "thankyou.html";

const loadedLocales = {};

function loadTranslations(lang) {
  /* English is the markup itself — no need to fetch en.json */
  if (lang === "en" || loadedLocales[lang]) {
    updateContent();
    return;
  }

  fetch(`locales/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      loadedLocales[lang] = true;
      i18next.addResourceBundle(lang, "translation", data, true, true);
      updateContent();
    })
    .catch(() => {
      /* keep the hard-coded English markup if the locale file fails to load */
    });
}

/* English lives in the markup, so we keep each element's original HTML and
   restore it verbatim for "en" — otherwise the locale strings (plain text)
   would wipe required-field asterisks and inline <strong> emphasis. */
const originalMarkup = new WeakMap();
const originalPlaceholders = new WeakMap();

function updateContent() {
  const lang = (i18next.language || i18next.resolvedLanguage || "en").slice(0, 2);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const cached = originalMarkup.get(el);

    /* re-cache when the key changed at runtime (e.g. the co-applicant toggle) */
    if (!cached || cached.key !== key) originalMarkup.set(el, { key, html: el.innerHTML });
    const source = originalMarkup.get(el).html;

    if (lang === "en") {
      el.innerHTML = source;
      return;
    }

    let translated = i18next.t(key);
    if (!translated || translated === key) {
      el.innerHTML = source;
      return;
    }

    const req = document.createElement("div");
    req.innerHTML = source;
    const marker = req.querySelector(".req");
    if (marker && !translated.includes('class="req"')) translated += " " + marker.outerHTML;

    el.innerHTML = translated;
  });

  /* same rule as the markup above: English placeholders live in the HTML, so
     cache them and restore rather than asking i18next for a bundle we never load */
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!originalPlaceholders.has(el)) originalPlaceholders.set(el, el.placeholder);
    const source = originalPlaceholders.get(el);

    if (lang === "en") {
      el.placeholder = source;
      return;
    }

    const translated = i18next.t(key);
    el.placeholder = (!translated || translated === key) ? source : translated;
  });
}

function changeLanguage(lang) {
  i18next.changeLanguage(lang, () => {
    localStorage.setItem("lang", lang); // saves language preference (even after refresh); remove if we want it to reset to English on refresh!
    loadTranslations(lang);
  });
}
/* END OF LANGUAGE/TRANSLATION SECTION */

/* ANIMATION ON SCROLL */
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0 });   /* fire as soon as any part is visible — a section
                           sitting flush with the fold never reaches 10% */

document.querySelectorAll(".fade-up").forEach(el => {
  observer.observe(el);
});

/* WHY US CARDS FLIP IN, ONE AFTER ANOTHER */
const flipCards = document.querySelectorAll(".why-card");
if (flipCards.length) {
  const flipObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = [...entry.target.parentElement.children];
      entry.target.style.transitionDelay = (cards.indexOf(entry.target) * 0.12) + "s";
      entry.target.classList.add("flipped-in");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  flipCards.forEach(card => {
    card.classList.add("flip-in");
    flipObserver.observe(card);
  });
}

/* PAUSE LOOPING ANIMATIONS WHILE OFFSCREEN */
const loopingSelectors = ".services-header, .page-header, .services-cta, [id^='formslist'][id*='widget']";
const loopers = document.querySelectorAll(loopingSelectors);
if (loopers.length) {
  const loopObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("anim-idle", !entry.isIntersecting);
    });
  }, { rootMargin: "120px" });
  loopers.forEach(el => {
    el.classList.add("anim-idle");
    loopObserver.observe(el);
  });
}

/* HERO VIDEO: STOP DECODING ONCE IT IS SCROLLED PAST
   A looping video keeps the decoder and GPU busy for the whole visit even when
   it is nowhere near the viewport. Pausing it offscreen costs nothing visually
   and is the single biggest battery/CPU saving on the long pages. */
/* HERO VIDEO: the poster paints first, then the loop loads behind it.
   At roughly 1MB a clip these are cheap enough to play on phones too; the
   poster stands in only for reduced-motion users and metered connections. */
document.querySelectorAll("video.hero-video[data-src]").forEach(video => {
  const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const metered = navigator.connection && navigator.connection.saveData;
  if (wantsMotion && !metered) video.src = video.dataset.src;
});

const heroVideos = document.querySelectorAll(".hero-video");
if (heroVideos.length && "IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (video.src && video.paused && !video.dataset.userPaused) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, { rootMargin: "200px" });

  heroVideos.forEach(v => videoObserver.observe(v));

  /* a background tab should not be decoding video either */
  document.addEventListener("visibilitychange", () => {
    heroVideos.forEach(v => {
      if (document.hidden) {
        v.pause();
      } else if (v.getBoundingClientRect().bottom > 0 && v.getBoundingClientRect().top < window.innerHeight) {
        v.play().catch(() => {});
      }
    });
  });
}

/* FOR GET PRE-APPROVED PAGE */
/* CONDITIONAL "PREVIOUS ..." GROUPS
   Under 3 years at an address or job means the previous one is mandatory, so
   visibility and the required flag move together — a hidden field must never
   be able to block submission. */
function toggleConditional(trigger, boxId, timeId, timeDisplay) {
  const el = document.getElementById(trigger);
  if (!el) return;

  const apply = () => {
    const show = el.value !== "" && Number(el.value) < 3;
    [boxId, timeId].forEach((id, i) => {
      const box = document.getElementById(id);
      if (!box) return;
      box.style.display = show ? (i === 0 ? "block" : timeDisplay) : "none";
      box.querySelectorAll("input").forEach(input => { input.required = show; });
    });
  };

  el.addEventListener("input", apply);
  apply();
}

toggleConditional("yearsPrimary", "prevAddressPrimary", "prevAddressTimePrimary", "flex");
toggleConditional("yearsCo", "prevAddressCo", "prevAddressTimeCo", "flex");
toggleConditional("empYearsPrimary", "prevEmployerPrimary", "prevEmployerTimePrimary", "flex");
toggleConditional("empYearsCo", "prevEmployerCo", "prevEmployerTimeCo", "flex");

// E-SIGNATURE LOGIC
function signatureIsBlank(canvas) {
  if (!canvas || !canvas.width || !canvas.height) return true;
  const ctx = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) return false;
  }
  return true;
}

function setupSignature(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;

  /* Reassigning width/height clears the pad, so only resize when the box
     actually changed size, and restore what was drawn. Mobile address bars
     fire resize on scroll — that used to silently erase the signature. */
  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = window.devicePixelRatio || 1;
    const w = Math.round(rect.width * ratio);
    const h = Math.round(rect.height * ratio);
    if (canvas.width === w && canvas.height === h) return;

    const previous = signatureIsBlank(canvas) ? null : canvas.toDataURL();
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    if (previous) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = previous;
    }
  }

  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  /* the co-applicant pad starts hidden (zero-width), so re-measure when it appears */
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(sizeCanvas).observe(canvas);
  }

  function start(e) {
    drawing = true;
    const wrap = canvas.closest(".signature-pad-wrap");
    if (wrap) wrap.classList.add("signed");
    const sigError = document.getElementById("signatureError");
    if (sigError) sigError.classList.remove("show");
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
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); start(e); }, { passive: false });
  canvas.addEventListener("touchend", end);
  canvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); }, { passive: false });
}

setupSignature("signaturePadPrimary");
setupSignature("signaturePadCo");

// Clear function
function clearSignature(type) {
  const canvas = document.getElementById(
    type === "primary" ? "signaturePadPrimary" : "signaturePadCo"
  );
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const wrap = canvas.closest(".signature-pad-wrap");
  if (wrap) wrap.classList.remove("signed");
}

const creditForm = document.getElementById("creditForm");

function primarySignatureMissing() {
  const canvas = document.getElementById("signaturePadPrimary");
  if (!canvas) return false;
  return signatureIsBlank(canvas);
}

/* the co-applicant signs on the same terms as the primary — but only when
   that section is actually open */
function coSignatureMissing() {
  const canvas = document.getElementById("signaturePadCo");
  if (!canvas || canvas.closest(".co-applicant-hidden")) return false;
  return signatureIsBlank(canvas);
}

if (creditForm) {
  creditForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;

    /* Any required field that is not on screen (collapsed co-applicant, a
       conditional group that closed again) is exempted for this submit only,
       otherwise validation fails on something the user cannot reach. */
    const hiddenByAncestor = el => {
      for (let p = el.parentElement; p && p !== form; p = p.parentElement) {
        if (getComputedStyle(p).display === "none") return true;
      }
      return false;
    };

    const exempted = [];
    form.querySelectorAll("[required]").forEach(el => {
      if (hiddenByAncestor(el)) {
        el.required = false;
        exempted.push(el);
      }
    });
    const restoreExempted = () => exempted.forEach(el => { el.required = true; });

    /* HTML5 validation first — nothing leaves the page half-empty */
    if (!form.checkValidity()) {
      restoreExempted();
      form.reportValidity();
      return;
    }

    const signatureError = document.getElementById("signatureError");

    if (primarySignatureMissing() || coSignatureMissing()) {
      restoreExempted();
      if (signatureError) {
        signatureError.classList.add("show");
        const rect = signatureError.getBoundingClientRect();
        window.scrollTo({ top: rect.top + window.scrollY - 180, behavior: "smooth" });
      }
      return;
    }

    if (signatureError) signatureError.classList.remove("show");

    const submitBtn = form.querySelector(".submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.label = submitBtn.textContent;
      submitBtn.textContent = typeof i18next !== "undefined" && i18next.isInitialized
        ? i18next.t("pre.submitting")
        : "Submitting…";
    }

    const data = new FormData(form);

    // Append signatures as Base64 strings
    const primaryCanvas = document.getElementById("signaturePadPrimary");
    const coCanvas = document.getElementById("signaturePadCo");

    if (primaryCanvas) {
      data.append("primary_signature", primaryCanvas.toDataURL());
    }

    /* only send a co-applicant signature when that section is open and signed */
    const coOpen = coCanvas && !coCanvas.closest(".co-applicant-hidden");
    if (coOpen && !signatureIsBlank(coCanvas)) {
      data.append("co_signature", coCanvas.toDataURL());
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Submission failed: " + res.status);

      // Redirect only after the form host confirms it took the application
      window.location.href = POST_SUBMIT_URL;

    } catch (error) {
      restoreExempted();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label || "Submit";
      }
      alert("Something went wrong. Please try again.");
    }
  });
}
/* CO-APPLICANT TOGGLE */
const coApplicantToggle = document.getElementById("coApplicantToggle");

if (coApplicantToggle) {
  const coLabel = coApplicantToggle.querySelector("[data-i18n]");

  coApplicantToggle.addEventListener("click", () => {
    const open = coApplicantToggle.getAttribute("aria-expanded") !== "true";

    document.querySelectorAll(".co-applicant").forEach(el => {
      el.classList.toggle("co-applicant-hidden", !open);
    });

    coApplicantToggle.setAttribute("aria-expanded", open ? "true" : "false");

    if (coLabel) {
      const key = open ? "pre.removeCo" : "pre.addCo";
      const fallback = open ? "Remove Co-Applicant" : "Add a Co-Applicant";
      /* English has no locale bundle (it lives in the markup), so t() would
         hand back the key name — use the literal unless a real translation exists */
      let text = fallback;
      if (typeof i18next !== "undefined" && i18next.isInitialized && (i18next.language || "").slice(0, 2) !== "en") {
        const translated = i18next.t(key);
        if (translated && translated !== key) text = translated;
      }
      coLabel.setAttribute("data-i18n", key);
      coLabel.textContent = text;
      originalMarkup.set(coLabel, { key, html: fallback });
    }

    if (open) {
      const box = document.getElementById("coApplicantBox");
      if (box) {
        window.scrollTo({
          top: box.getBoundingClientRect().top + window.scrollY - 110,
          behavior: "smooth"
        });
      }
    }
  });
}

/* INPUT FORMATTING */
function formatPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return "(" + d.slice(0, 3) + ") " + d.slice(3);
  return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
}

function formatSSN(v) {
  const d = v.replace(/\D/g, "").slice(0, 9);
  if (d.length < 4) return d;
  if (d.length < 6) return d.slice(0, 3) + "-" + d.slice(3);
  return d.slice(0, 3) + "-" + d.slice(3, 5) + "-" + d.slice(5);
}

function formatMoney(v) {
  const d = v.replace(/\D/g, "");
  if (!d) return "";
  return "$" + Number(d).toLocaleString("en-US");
}

document.querySelectorAll("[data-mask]").forEach(input => {
  const kind = input.getAttribute("data-mask");
  input.addEventListener("input", () => {
    const formatter = kind === "phone" ? formatPhone : kind === "ssn" ? formatSSN : formatMoney;
    const atEnd = input.selectionStart === input.value.length;
    input.value = formatter(input.value);
    if (atEnd) input.setSelectionRange(input.value.length, input.value.length);
  });
});

/* SURFACE THE FIRST INVALID FIELD INSTEAD OF FAILING SILENTLY */
if (creditForm) {
  creditForm.addEventListener("invalid", (e) => {
    const box = e.target.closest(".co-applicant");
    if (box && box.classList.contains("co-applicant-hidden")) return;

    const rect = e.target.getBoundingClientRect();
    if (rect.top < 120 || rect.bottom > window.innerHeight) {
      window.scrollTo({ top: rect.top + window.scrollY - 160, behavior: "smooth" });
    }
  }, true);
}
