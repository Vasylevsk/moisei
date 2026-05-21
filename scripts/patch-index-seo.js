#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../index.html");
let html = fs.readFileSync(file, "utf8");

const newTitle =
  "Moisei | Ukrainian Restaurant in Brentford, London – Food, Hookah & Events";
const newDesc =
  "Moisei — authentic Ukrainian restaurant in Brentford, West London. Borscht, varenyky, pelmeni, cocktails, hookah lounge and live events. Book a table online.";

html = html.replace(/<title>[^<]*<\/title>/, `<title>${newTitle}</title>`);
html = html.replace(
  /<meta name="title" content="[^"]*" \/>/,
  `<meta name="title" content="${newTitle}" />`
);
html = html.replace(
  /<meta name="description" content="[^"]*" \/>/,
  `<meta name="description" content="${newDesc}" />`
);
html = html.replace(
  /<meta name="title" lang="uk" content="[^"]*" \/>/,
  `<meta name="title" lang="uk" content="Moisei | Український ресторан у Брентфорді, Лондон – їжа, кальян, події" />`
);
html = html.replace(
  /<meta name="description" lang="uk" content="[^"]*" \/>/,
  `<meta name="description" lang="uk" content="Moisei — справжній український ресторан у Брентфорді, Західний Лондон. Борщ, вареники, пельмені, коктейлі, кальян та живі події. Забронюйте столик онлайн." />`
);

html = html.replace(
  /<meta name="keywords" content="[^"]*" \/>/,
  `<meta name="keywords" content="Ukrainian restaurant London, Ukrainian restaurant Brentford, Ukrainian food London, borscht London, varenyky London, pelmeni London, Ukrainian restaurant West London, restaurant Brentford TW8, hookah Brentford, Ukrainian events London, book table Brentford, Moisei restaurant" />`
);
html = html.replace(
  /<meta name="keywords" lang="uk" content="[^"]*" \/>/,
  `<meta name="keywords" lang="uk" content="український ресторан Лондон, український ресторан Брентфорд, українська їжа Лондон, борщ Лондон, вареники Лондон, ресторан TW8, кальян Брентфорд, українські події Лондон, забронювати столик, ресторан Moisei" />`
);

html = html.replace(
  /<meta property="og:title" content="[^"]*" \/>/,
  `<meta property="og:title" content="${newTitle}" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]*" \/>/,
  `<meta property="og:description" content="${newDesc}" />`
);
html = html.replace(
  /<meta name="twitter:title" content="[^"]*" \/>/,
  `<meta name="twitter:title" content="${newTitle}" />`
);
html = html.replace(
  /<meta name="twitter:description" content="[^"]*" \/>/,
  `<meta name="twitter:description" content="${newDesc}" />`
);

if (!html.includes('rel="sitemap"')) {
  html = html.replace(
    /<link rel="canonical"/,
    `<link rel="sitemap" type="application/xml" title="Sitemap" href="https://moisei.uk/sitemap.xml" />\n    <link rel="canonical"`
  );
}

html = html.replace(
  /\s*<!-- JSON-LD Structured Data for SEO -->[\s\S]*?<\/script>\s*(?=<\/head>)/,
  "\n"
);

html = html.replace(
  /<h1 class="display-1 hero-title slider-reveal  hero-title-small" data-i18n="hero\.slide2\.title"/g,
  '<h2 class="display-1 hero-title slider-reveal  hero-title-small" data-i18n="hero.slide2.title"'
);
html = html.replace(
  /<h1 class="display-1 hero-title slider-reveal hero-title-small" data-i18n="hero\.slide3\.title"/,
  '<h2 class="display-1 hero-title slider-reveal hero-title-small" data-i18n="hero.slide3.title"'
);

if (!html.includes("sr-only")) {
  html = html.replace(
    /<style>\s*@keyframes pulse-glow-green/,
    `<style>
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @keyframes pulse-glow-green`
  );
}

html = html.replace(
  /<section class="special-dish-swiper-wrapper" aria-label="event" id="events">/,
  `<section class="special-dish-swiper-wrapper" aria-label="event" id="events" aria-labelledby="events-section-title">
        <h2 id="events-section-title" class="sr-only">Ukrainian concerts and live events by Moisei in London</h2>`
);

const graphSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Restaurant", "LocalBusiness"],
      "@id": "https://moisei.uk/#restaurant",
      name: "Moisei",
      alternateName: [
        "Moisei Ukrainian Restaurant",
        "Ukrainian Restaurant Brentford",
      ],
      description: newDesc,
      url: "https://moisei.uk/",
      telephone: ["+447932393730", "+447706090321"],
      email: "info@moisei.uk",
      image: "https://moisei.uk/assets/images/og-moisei-brand.jpg",
      logo: "https://moisei.uk/assets/images/moisei-brand-mark-512.png",
      priceRange: "££",
      servesCuisine: ["Ukrainian", "Eastern European"],
      acceptsReservations: true,
      hasMap:
        "https://www.google.com/maps/place/Moisei+at+Makai/@51.4847492,-0.3018951,17z",
      address: {
        "@type": "PostalAddress",
        streetAddress: "55 High St",
        addressLocality: "Brentford",
        addressRegion: "London",
        postalCode: "TW8 0AH",
        addressCountry: "GB",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 51.4847492,
        longitude: -0.3018951,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Wednesday", "Thursday"],
          opens: "15:00",
          closes: "21:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Friday",
          opens: "15:00",
          closes: "23:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "12:00",
          closes: "00:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Sunday",
          opens: "12:00",
          closes: "23:00",
        },
      ],
      sameAs: [
        "https://www.instagram.com/moiseirestaurant/",
        "https://www.facebook.com/share/17n8iGsdW4/",
        "https://www.tiktok.com/@moiseirestaurant",
      ],
      hasMenu: [
        {
          "@type": "Menu",
          name: "Food Menu",
          url: "https://moisei.uk/food-menu.html",
        },
        {
          "@type": "Menu",
          name: "Drink Menu",
          url: "https://moisei.uk/drink-menu.html",
        },
        {
          "@type": "Menu",
          name: "Hookah Menu",
          url: "https://moisei.uk/hookah-menu.html",
        },
      ],
      potentialAction: {
        "@type": "ReserveAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://moisei.uk/reservation.html",
        },
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://moisei.uk/#website",
      url: "https://moisei.uk/",
      name: "Moisei",
      publisher: { "@id": "https://moisei.uk/#restaurant" },
      inLanguage: ["en-GB", "uk"],
    },
    {
      "@type": "FAQPage",
      "@id": "https://moisei.uk/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Where is Moisei Ukrainian restaurant in London?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Moisei is at 55 High Street, Brentford, London TW8 0AH — West London, near Gunnersbury and Chiswick.",
          },
        },
        {
          "@type": "Question",
          name: "What are Moisei opening hours?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Wed–Thu 15:00–21:00, Fri 15:00–23:00, Sat 12:00–00:00, Sun 12:00–23:00. Closed Mon–Tue.",
          },
        },
        {
          "@type": "Question",
          name: "How do I book a table at Moisei?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Book online at moisei.uk/reservation.html or call +44 7932 393730 / +44 7706 090321.",
          },
        },
        {
          "@type": "Question",
          name: "Does Moisei serve authentic Ukrainian food?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — traditional Ukrainian dishes including borscht, varenyky, pelmeni, deruny, banosh, grilled mains, sushi and desserts.",
          },
        },
        {
          "@type": "Question",
          name: "Does Moisei have hookah and live Ukrainian events?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Moisei offers a premium hookah lounge and hosts Ukrainian concerts and parties — see the Events section on the homepage.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://moisei.uk/",
        },
      ],
    },
  ],
};

const schemaBlock = `    <script type="application/ld+json">\n${JSON.stringify(graphSchema, null, 2)}\n    </script>\n`;

html = html.replace(
  /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*(?=<\/body>)/g,
  "\n"
);
html = html.replace("</body>", `${schemaBlock}</body>`);

fs.writeFileSync(file, html);
console.log("✅ index.html SEO patched");
