"use strict";

// Cookie Banner functionality
(function() {
  const COOKIE_CONSENT_KEY = 'cookie_consent';
  const COOKIE_CONSENT_EXPIRY_DAYS = 365;

  // Make functions available globally for cookie settings
  window.CookieBanner = {
    show: function() {
      showCookieBanner();
    },
    reset: function() {
      resetCookieConsent();
      showCookieBanner();
    },
    getConsent: function() {
      return getCookieConsentValue();
    },
    hasConsent: function() {
      const consent = getCookieConsentValue();
      return consent === 'accepted';
    },
    canUseStorage: function() {
      const consent = getCookieConsentValue();
      // If no consent or declined, can't use storage
      return consent === 'accepted';
    }
  };

  function getCookieConsent() {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  }

  function getCookieConsentValue() {
    const consent = getCookieConsent();
    if (!consent) return null;
    
    try {
      const consentData = JSON.parse(consent);
      return consentData.value || null;
    } catch (e) {
      return null;
    }
  }

  function setCookieConsent(value) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    const consentData = {
      value: value,
      expiry: expiryDate.toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
  }

  function resetCookieConsent() {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  }

  function hasConsentExpired() {
    const consent = getCookieConsent();
    if (!consent) return true;
    
    try {
      const consentData = JSON.parse(consent);
      if (consentData.expiry) {
        const expiryDate = new Date(consentData.expiry);
        return new Date() > expiryDate;
      }
    } catch (e) {
      return true;
    }
    return false;
  }

  function getTranslation(key) {
    if (typeof translations === 'undefined') return key;
    
    const lang = localStorage.getItem('language') || 'en';
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    
    if (lang !== 'en' && translations.en && translations.en[key]) {
      return translations.en[key];
    }
    
    return key;
  }

  function updateCookieBannerText() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    // Use data-i18n if available (for pages with LanguageSwitcher)
    const title = banner.querySelector('.cookie-banner-title');
    const message = banner.querySelector('.cookie-banner-message');
    const acceptBtn = banner.querySelector('.cookie-banner-btn-accept');
    const declineBtn = banner.querySelector('.cookie-banner-btn-decline');

    // Check if LanguageSwitcher is available
    if (typeof window !== 'undefined' && window.languageSwitcher) {
      // Let LanguageSwitcher handle translations via data-i18n
      return;
    }

    // Fallback: manual translation
    if (title && !title.hasAttribute('data-i18n')) {
      title.textContent = getTranslation('cookie.title');
    }
    if (message && !message.hasAttribute('data-i18n')) {
      const policyLink = `<a href="cookie-policy.html">${getTranslation('cookie.policy')}</a>`;
      message.innerHTML = getTranslation('cookie.message') + ' ' + policyLink + '.';
    }
    if (acceptBtn && !acceptBtn.hasAttribute('data-i18n')) {
      acceptBtn.textContent = getTranslation('cookie.accept');
    }
    if (declineBtn && !declineBtn.hasAttribute('data-i18n')) {
      declineBtn.textContent = getTranslation('cookie.decline');
    }
  }

  function showCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (banner) {
      // Force show with inline style as fallback
      banner.style.transform = 'translateY(0)';
      banner.classList.add('active');
    }
  }

  function hideCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      banner.classList.remove('active');
    }
  }

  function handleAccept() {
    setCookieConsent('accepted');
    hideCookieBanner();
  }

  function showDeclineWarning() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    const message = banner.querySelector('.cookie-banner-message');
    const acceptBtn = banner.querySelector('.cookie-banner-btn-accept');
    const declineBtn = banner.querySelector('.cookie-banner-btn-decline');
    
    if (message) {
      const warningText = getTranslation('cookie.decline.warning');
      const featuresText = getTranslation('cookie.decline.features');
      const continueText = getTranslation('cookie.decline.continue');
      const policyText = getTranslation('cookie.policy');
      
      message.innerHTML = `
        <strong style="color: var(--gold-crayola); display: block; margin-bottom: 10px;">${warningText}</strong>
        <div style="margin: 10px 0;">${featuresText}</div>
        <div style="margin-top: 10px;">${continueText}</div>
        <div style="margin-top: 15px; font-size: 1.3rem;">
          <a href="cookie-policy.html" style="color: var(--gold-crayola); text-decoration: underline;">${policyText}</a>
        </div>
      `;
    }
    
    // Update buttons
    if (acceptBtn) {
      acceptBtn.textContent = getTranslation('cookie.accept');
      acceptBtn.style.display = 'inline-block';
    }
    if (declineBtn) {
      declineBtn.style.display = 'none';
    }
  }

  function handleDecline() {
    setCookieConsent('declined');
    // Show warning message instead of hiding immediately
    showDeclineWarning();
    
    // Hide after 8 seconds if user doesn't interact
    setTimeout(function() {
      const consent = getCookieConsentValue();
      if (consent === 'declined') {
        hideCookieBanner();
      }
    }, 8000);
  }

  function setupEventListeners() {
    const acceptBtn = document.querySelector('.cookie-banner-btn-accept');
    const declineBtn = document.querySelector('.cookie-banner-btn-decline');

    // Remove old listeners by cloning
    if (acceptBtn) {
      const newAcceptBtn = acceptBtn.cloneNode(true);
      acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
      newAcceptBtn.addEventListener('click', handleAccept);
    }

    if (declineBtn) {
      const newDeclineBtn = declineBtn.cloneNode(true);
      declineBtn.parentNode.replaceChild(newDeclineBtn, declineBtn);
      newDeclineBtn.addEventListener('click', handleDecline);
    }
  }

  function initCookieBanner() {
    // Check if consent was already given
    const consent = getCookieConsentValue();
    if (!hasConsentExpired() && consent) {
      return; // Don't show banner if consent exists and hasn't expired
    }

    // Wait for DOM to be ready
    function showBanner() {
      setTimeout(function() {
        showCookieBanner();
        updateCookieBannerText();
        setupEventListeners();
      }, 1000);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }

    // Update text when language changes
    document.addEventListener('languageChanged', updateCookieBannerText);
  }

  // Initialize when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }

  // Handle cookie settings button clicks
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.classList.contains('cookie-settings-btn') || e.target.closest('.cookie-settings-btn'))) {
      e.preventDefault();
      resetCookieConsent();
      showCookieBanner();
      updateCookieBannerText();
      setupEventListeners();
    }
  });
})();

