#!/usr/bin/env python3
import re
import sys

ga4_code = '''    <!-- Google Analytics 4 (gtag.js) -->
    <!-- IMPORTANT: Replace YOUR_MEASUREMENT_ID with your GA4 Measurement ID (format: G-XXXXXXXXXX) -->
    <!-- Get your Measurement ID from: Google Analytics → Admin → Data Streams -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_MEASUREMENT_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      
      // Get consent state
      var getConsentState = function() {
        try {
          var consent = localStorage.getItem('cookie_consent');
          if (consent) {
            var consentData = JSON.parse(consent);
            if (consentData.value === 'accepted') {
              if (consentData.expiry) {
                var expiryDate = new Date(consentData.expiry);
                if (new Date() <= expiryDate) {
                  return 'granted';
                }
              } else {
                return 'granted';
              }
            }
          }
        } catch(e) {}
        return 'denied';
      };
      
      // Set default consent state BEFORE GA4 loads
      var consentState = getConsentState();
      gtag('consent', 'default', {
        'analytics_storage': consentState,
        'ad_storage': consentState
      });
      
      // Initialize GA4
      gtag('config', 'YOUR_MEASUREMENT_ID', {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure'
      });
      
      // Update consent when it changes
      window.updateGAConsent = function(value) {
        var state = (value === 'accepted') ? 'granted' : 'denied';
        gtag('consent', 'update', {
          'analytics_storage': state,
          'ad_storage': state
        });
      };
    </script>
    <!-- End Google Analytics 4 -->'''

gtm_pattern = r'<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->'
gtm_noscript_pattern = r'<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->'

files = [
    'finka-event.html', 'alena-omargalieva-event.html', 'food-menu.html', 
    'reservation.html', 'hookah-menu.html', 'drink-menu.html', 
    'cookie-policy.html', 'terms-conditions.html', 'privacy-policy.html', 
    'oksana-bilozir-event.html', 'kateryna-buzhynska-event.html', 
    'olya-newyear-event.html'
]

for filename in files:
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace GTM with GA4
        content = re.sub(gtm_pattern, ga4_code, content, flags=re.DOTALL)
        
        # Remove noscript GTM
        content = re.sub(gtm_noscript_pattern, '', content, flags=re.DOTALL)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated {filename}")
    except Exception as e:
        print(f"✗ Error updating {filename}: {e}")

print("Done!")
