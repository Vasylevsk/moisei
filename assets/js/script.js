"use strict";

const preloader = document.querySelector("[data-preaload]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
};

const closeNavbar = function () {
  navbar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNavbar);

const navbarLinks = document.querySelectorAll(".navbar-link");
navbarLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    closeNavbar();
  });
});

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollPos = 0;

const hideHeader = function () {
  const isScrollBottom = lastScrollPos < window.scrollY;
  if (isScrollBottom) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScrollPos = window.scrollY;
};

window.addEventListener("scroll", function () {
  if (window.scrollY >= 50) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
    hideHeader();
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});

const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
const heroSliderNextBtn = document.querySelector("[data-next-btn]");

if (
  heroSlider &&
  heroSliderItems.length &&
  heroSliderPrevBtn &&
  heroSliderNextBtn
) {
  let currentSlidePos = 0;
  let lastActiveSliderItem = heroSliderItems[0];

  const updateSliderPos = function () {
    lastActiveSliderItem.classList.remove("active");
    heroSliderItems[currentSlidePos].classList.add("active");
    lastActiveSliderItem = heroSliderItems[currentSlidePos];
  };

  const slideNext = function () {
    if (currentSlidePos >= heroSliderItems.length - 1) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    updateSliderPos();
  };

  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = heroSliderItems.length - 1;
    } else {
      currentSlidePos--;
    }

    updateSliderPos();
  };

  heroSliderNextBtn.addEventListener("click", slideNext);
  heroSliderPrevBtn.addEventListener("click", slidePrev);

  let autoSlideInterval;

  const autoSlide = function () {
    autoSlideInterval = setInterval(function () {
      slideNext();
    }, 7000);
  };

  addEventOnElements(
    [heroSliderNextBtn, heroSliderPrevBtn],
    "mouseover",
    function () {
      clearInterval(autoSlideInterval);
    }
  );

  addEventOnElements(
    [heroSliderNextBtn, heroSliderPrevBtn],
    "mouseout",
    autoSlide
  );

  window.addEventListener("load", autoSlide);
}

const shishaContainer = document.querySelector("[data-shisha-slider]");
const shishaItems = document.querySelectorAll(".shisha-image-item");
const shishaDots = document.querySelectorAll("[data-shisha-dot]");

if (shishaContainer && shishaItems.length > 0) {
  let currentShishaSlide = 0;
  let shishaAutoSlideInterval = null;
  
  const isMobile = function() {
    return window.innerWidth <= 768;
  };

  const updateShishaSlide = function (startIndex) {
    if (!isMobile()) {
      shishaItems.forEach((item) => {
        item.classList.remove("mobile-slide", "active");
      });
      if (shishaDots.length > 0) {
        shishaDots.forEach((dot) => {
          dot.style.display = "none";
        });
      }
      return;
    }

    shishaDots.forEach((dot) => {
      dot.style.display = "inline-block";
    });

    shishaItems.forEach((item, index) => {
      item.classList.add("mobile-slide");
      item.classList.remove("active");
      if (index === startIndex) {
        item.classList.add("active");
      }
    });
    
    if (shishaDots.length > 0) {
      shishaDots.forEach((dot, i) => {
        dot.classList.toggle("active", i === startIndex);
      });
    }
  };

  const nextShishaSlide = function () {
    if (!isMobile()) return;
    currentShishaSlide = (currentShishaSlide + 1) % shishaItems.length;
    updateShishaSlide(currentShishaSlide);
  };

  const startAutoSlide = function () {
    if (!isMobile()) return;
    if (shishaAutoSlideInterval) {
      clearInterval(shishaAutoSlideInterval);
    }
    shishaAutoSlideInterval = setInterval(function () {
      nextShishaSlide();
    }, 3000);
  };

  const stopAutoSlide = function () {
    if (shishaAutoSlideInterval) {
      clearInterval(shishaAutoSlideInterval);
      shishaAutoSlideInterval = null;
    }
  };

  if (shishaDots.length > 0) {
    shishaDots.forEach((dot, index) => {
      dot.addEventListener("click", function () {
        if (!isMobile()) return;
        currentShishaSlide = index;
        updateShishaSlide(currentShishaSlide);
        stopAutoSlide();
        startAutoSlide();
      });
    });
  }

  if (shishaContainer) {
    shishaContainer.addEventListener("mouseenter", stopAutoSlide);
    shishaContainer.addEventListener("mouseleave", startAutoSlide);
  }

  window.addEventListener("resize", function() {
    stopAutoSlide();
    updateShishaSlide(currentShishaSlide);
    if (isMobile()) {
      startAutoSlide();
    }
  });

  window.addEventListener("load", function () {
    updateShishaSlide(0);
    if (isMobile()) {
      startAutoSlide();
    }
  });

  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      if (isMobile()) {
        startAutoSlide();
      }
    }
  });
}

const eventSliderWrapper = document.querySelector("[data-event-slider]");
const eventSliderList = eventSliderWrapper?.querySelector(".event-slider");
const eventSliderPrevBtn = document.querySelector("[data-event-prev-btn]");
const eventSliderNextBtn = document.querySelector("[data-event-next-btn]");

if (
  eventSliderWrapper &&
  eventSliderList &&
  eventSliderPrevBtn &&
  eventSliderNextBtn
) {
  let autoSlideInterval = null;
  let currentIndex = 0;
  let isAnimating = false;
  let slides = [];
  let slideWidth = 0;
  let gap = 0;

  function initSlider() {
    
    if (window.innerWidth >= 992) {
      eventSliderList.style.transform = "";
      eventSliderList.style.transition = "";
      clearInterval(autoSlideInterval);
      return;
    }

    slides = Array.from(eventSliderList.querySelectorAll(".event-slide"));

    if (slides.length === 0) return;

    currentIndex = 0;

    calculateDimensions();

    moveToSlide(0, true);

    startAutoSlide();
  }

  function calculateDimensions() {
    if (slides.length === 0) return;

    const firstSlide = slides[0];
    const rect = firstSlide.getBoundingClientRect();

    slideWidth = rect.width;

    const computedGap = window.getComputedStyle(eventSliderList).gap;
    gap = parseInt(computedGap) || (window.innerWidth >= 768 ? 30 : 20);
  }

  function moveToSlide(index, instant = false) {
    if (slides.length === 0 || isAnimating) return;

    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;

    const offset = -(currentIndex * (slideWidth + gap));

    if (instant) {
      eventSliderList.style.transition = "none";
      eventSliderList.style.transform = `translateX(${offset}px)`;
      
      void eventSliderList.offsetWidth;
    } else {
      isAnimating = true;
      eventSliderList.style.transition = "transform 0.6s ease-in-out";
      eventSliderList.style.transform = `translateX(${offset}px)`;

      setTimeout(() => {
        isAnimating = false;
      }, 600);
    }
  }

  function nextSlide() {
    if (window.innerWidth >= 992) return;
    moveToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (window.innerWidth >= 992) return;
    moveToSlide(currentIndex - 1);
  }

  function startAutoSlide() {
    if (window.innerWidth >= 992) return;

    clearInterval(autoSlideInterval);

    autoSlideInterval = setInterval(() => {
      if (!isAnimating && slides.length > 0) {
        nextSlide();
      }
    }, 6000); 
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }

  eventSliderNextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    stopAutoSlide();
    nextSlide();
    setTimeout(startAutoSlide, 7000); 
  });

  eventSliderPrevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    stopAutoSlide();
    prevSlide();
    setTimeout(startAutoSlide, 7000); 
  });

  eventSliderWrapper.addEventListener("mouseenter", stopAutoSlide);
  eventSliderWrapper.addEventListener("mouseleave", startAutoSlide);

  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      stopAutoSlide();
      calculateDimensions();
      initSlider();
    }, 250);
  }

  if (document.readyState === "loading") {
    window.addEventListener("load", initSlider);
  } else {
    
    setTimeout(initSlider, 100);
  }

  window.addEventListener("resize", handleResize);
}

const eventModal = document.querySelector("[data-event-modal-overlay]");
const eventModalClose = document.querySelector("[data-event-modal-close]");
const eventCards = document.querySelectorAll("[data-event-modal]");

if (eventModal && eventModalClose) {
  
  const modalImage = eventModal.querySelector("[data-event-modal-image]");
  const modalTitle = eventModal.querySelector("[data-event-modal-title]");
  const modalDescription = eventModal.querySelector("[data-event-modal-description]");
  const modalTimeStart = eventModal.querySelector("[data-event-modal-time-start]");
  const modalTimeEnd = eventModal.querySelector("[data-event-modal-time-end]");
  const modalFeatures = eventModal.querySelector("[data-event-modal-features]");
  const modalPriceRegular = eventModal.querySelector("[data-event-modal-price-regular]");
  const modalPriceSpecial = eventModal.querySelector("[data-event-modal-price-special]");
  const modalLocation = eventModal.querySelector("[data-event-modal-location-text]");
  const modalBookingsTitle = eventModal.querySelector("[data-event-modal-bookings-title]");

  function getCurrentLanguage() {
    
    if (typeof i18n !== "undefined" && i18n.currentLang) {
      return i18n.currentLang;
    }
    
    const storedLang = localStorage.getItem("language");
    if (storedLang) {
      return storedLang;
    }
    
    return "en";
  }

  function getTranslation(key) {
    const lang = getCurrentLanguage();
    if (typeof translations !== "undefined" && translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    
    if (lang !== "en" && typeof translations !== "undefined" && translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  }

  function updateModalContent() {
    if (eventModal && eventModal.classList.contains("active")) {
      const card = document.querySelector("[data-event-modal]");
      if (card) {
        openEventModal(card);
      }
    }
  }

  document.addEventListener("languageChanged", updateModalContent);

  function openEventModal(card) {
    const img = card.querySelector(".img-cover");

    if (img && modalImage) {
      modalImage.src = img.src;
      modalImage.alt = img.alt || "";
    }

    if (modalTitle) {
      modalTitle.textContent = getTranslation("event.modal.title");
    }

    if (modalDescription) {
      modalDescription.textContent = getTranslation("event.modal.description");
    }

    if (modalTimeStart) {
      modalTimeStart.textContent = getTranslation("event.modal.time.start");
    }

    if (modalTimeEnd) {
      modalTimeEnd.textContent = getTranslation("event.modal.time.end");
    }

    if (modalFeatures) {
      modalFeatures.innerHTML = getTranslation("event.modal.features").replace(/\n/g, "<br>");
    }

    if (modalPriceRegular) {
      modalPriceRegular.textContent = getTranslation("event.modal.price.regular");
    }

    if (modalPriceSpecial) {
      modalPriceSpecial.innerHTML = getTranslation("event.modal.price.special") + "<br><br>" + getTranslation("event.modal.price.footer");
    }

    if (modalLocation) {
      modalLocation.textContent = getTranslation("event.modal.location");
    }

    if (modalBookingsTitle) {
      modalBookingsTitle.textContent = getTranslation("event.modal.bookings.title");
    }

    eventModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeEventModal() {
    eventModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  eventCards.forEach((card) => {
    card.addEventListener("click", function () {
      openEventModal(this);
    });
  });

  eventModalClose.addEventListener("click", closeEventModal);

  eventModal.addEventListener("click", function (e) {
    if (e.target === eventModal) {
      closeEventModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && eventModal.classList.contains("active")) {
      closeEventModal();
    }
  });
}

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

let x, y;

window.addEventListener("mousemove", function (event) {
  x = (event.clientX / window.innerWidth) * 10 - 5;
  y = (event.clientY / window.innerHeight) * 10 - 5;

  x = x - x * 2;
  y = y - y * 2;

  for (let i = 0, len = parallaxItems.length; i < len; i++) {
    x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
    y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
    parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  }
});

const toggleSwitches = document.querySelectorAll("[data-lang-toggle]");
const langLabels = document.querySelectorAll("[data-lang-label]");

let currentLang = localStorage.getItem("language") || "en";

const updateToggleState = function (lang) {
  
  if (langLabels && langLabels.length > 0) {
    langLabels.forEach((label) => label.classList.remove("active"));
  }

  const activeLabels = document.querySelectorAll(`[data-lang-label="${lang}"]`);
  activeLabels.forEach((label) => label.classList.add("active"));

  if (toggleSwitches && toggleSwitches.length > 0) {
    toggleSwitches.forEach((toggleSwitch) => {
      if (lang === "en") {
        toggleSwitch.classList.add("active");
      } else {
        toggleSwitch.classList.remove("active");
      }
    });
  }

  localStorage.setItem("language", lang);
  currentLang = lang;

  console.log("Language switched to:", lang);
};

if (toggleSwitches.length > 0 || langLabels.length > 0) {
  updateToggleState(currentLang);
}

if (toggleSwitches && toggleSwitches.length > 0) {
  toggleSwitches.forEach((toggleSwitch) => {
    toggleSwitch.addEventListener("click", function () {
      const newLang = currentLang === "uk" ? "en" : "uk";
      updateToggleState(newLang);
    });
  });
}

langLabels.forEach((label) => {
  label.addEventListener("click", function () {
    const lang = this.dataset.langLabel;
    updateToggleState(lang);
  });
});
