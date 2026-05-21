#!/usr/bin/env node
/**
 * Inject BreadcrumbList + Event JSON-LD and refresh meta on event pages.
 * Usage: node scripts/apply-event-seo.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ORGANIZER = {
  "@type": "Organization",
  name: "Moisei",
  url: "https://moisei.uk/",
};

const MOISEI_PLACE = {
  "@type": "Place",
  name: "Moisei Ukrainian Restaurant",
  address: {
    "@type": "PostalAddress",
    streetAddress: "55 High St",
    addressLocality: "Brentford",
    addressRegion: "London",
    postalCode: "TW8 0AH",
    addressCountry: "GB",
  },
};

const events = [
  {
    file: "alena-omargalieva-event.html",
    path: "/alena-omargalieva-event.html",
    titleEn: "Alena Omargalieva Concert London | Moisei Events",
    titleUk: "Концерт Алени Омаргалієвої Лондон | Події Moisei",
    descEn:
      "Alena Omargalieva solo concert in London — live Ukrainian music at Studio 338. Event by Moisei restaurant, Brentford.",
    descUk:
      "Сольний концерт Алени Омаргалієвої в Лондоні — жива музика в Studio 338. Подія від ресторану Moisei, Брентфорд.",
    image: "https://moisei.uk/assets/images/events/AlenaMorgileva/5788279742552280903.webp",
    startDate: "2026-04-24T21:00:00+01:00",
    endDate: "2026-04-24T23:30:00+01:00",
    eventName: "Alena Omargalieva Solo Concert",
    location: {
      "@type": "Place",
      name: "Studio 338",
      address: {
        "@type": "PostalAddress",
        streetAddress: "338 Boord St",
        addressLocality: "London",
        postalCode: "SE10 0PF",
        addressCountry: "GB",
      },
    },
  },
  {
    file: "finka-event.html",
    path: "/finka-event.html",
    titleEn: "FIЇNKA Concert London | First Time in London | Moisei",
    titleUk: "Концерт FIЇNKA Лондон | Вперше в Лондоні | Moisei",
    descEn:
      "FIЇNKA's first London concert — Carpathian pop at Studio 338. Past event organised by Moisei Ukrainian restaurant.",
    descUk:
      "Перший концерт FIЇNKA в Лондоні — карпатський поп у Studio 338. Минула подія від українського ресторану Moisei.",
    image: "https://moisei.uk/assets/images/events/Finka/01.webp",
    startDate: "2026-04-30T21:00:00+01:00",
    endDate: "2026-04-30T23:30:00+01:00",
    eventName: "FIЇNKA — First Time in London",
    location: {
      "@type": "Place",
      name: "Studio 338",
      address: {
        "@type": "PostalAddress",
        streetAddress: "338 Boord St",
        addressLocality: "London",
        postalCode: "SE10 0PF",
        addressCountry: "GB",
      },
    },
  },
  {
    file: "olya-newyear-event.html",
    path: "/olya-newyear-event.html",
    titleEn: "New Year's Eve with Olya Tsybulska | Moisei Brentford",
    titleUk: "Новий рік з Олею Цибульською | Moisei Брентфорд",
    descEn:
      "New Year's Eve with Ukrainian singer Olya Tsybulska at Moisei — authentic celebration in Brentford, West London.",
    descUk:
      "Новий рік зі співачкою Олею Цибульською в Moisei — святкування в Брентфорді, Західний Лондон.",
    image: "https://moisei.uk/assets/images/events/olya_newyear/IMG_2785.webp",
    startDate: "2025-12-31T20:00:00+00:00",
    endDate: "2026-01-01T02:00:00+00:00",
    eventName: "New Year's Eve with Olya Tsybulska",
    location: MOISEI_PLACE,
  },
  {
    file: "kateryna-buzhynska-event.html",
    path: "/kateryna-buzhynska-event.html",
    titleEn: "Kateryna Buzhynska & Mykhailo Grytskan | Moisei Events",
    titleUk: "Катерина Бужинська та Михайло Грицкан | Moisei",
    descEn:
      "Live concert with Kateryna Buzhynska and Mykhailo Grytskan at Moisei Ukrainian restaurant, Brentford, London.",
    descUk:
      "Живий концерт Катерини Бужинської та Михайла Грицкана в українському ресторані Moisei, Брентфорд.",
    image: "https://moisei.uk/assets/images/events/KaterynaBuzhynska/IMG_3320.webp",
    startDate: "2025-11-15T19:00:00+00:00",
    endDate: "2025-11-15T23:00:00+00:00",
    eventName: "Kateryna Buzhynska and Mykhailo Grytskan",
    location: MOISEI_PLACE,
  },
  {
    file: "oksana-bilozir-event.html",
    path: "/oksana-bilozir-event.html",
    titleEn: "Oksana Bilozir Charity Concert | Moisei London",
    titleUk: "Благодійний концерт Оксани Білозір | Moisei Лондон",
    descEn:
      "Oksana Bilozir charity concert at Moisei — Ukrainian music evening in Brentford supporting Ukraine.",
    descUk:
      "Благодійний концерт Оксани Білозір у Moisei — український музичний вечір у Брентфорді.",
    image: "https://moisei.uk/assets/images/events/OksanaBilozir/IMG_5605.webp",
    startDate: "2025-10-20T19:00:00+01:00",
    endDate: "2025-10-20T23:00:00+01:00",
    eventName: "Oksana Bilozir Charity Concert",
    location: MOISEI_PLACE,
  },
];

function buildSchema(ev) {
  const url = `https://moisei.uk${ev.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://moisei.uk/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Events",
            item: "https://moisei.uk/#events",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: ev.eventName,
            item: url,
          },
        ],
      },
      {
        "@type": "MusicEvent",
        name: ev.eventName,
        description: ev.descEn,
        startDate: ev.startDate,
        endDate: ev.endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        image: [ev.image],
        url,
        location: ev.location,
        organizer: ORGANIZER,
        performer: {
          "@type": "MusicGroup",
          name: ev.eventName.split("—")[0].split("|")[0].trim(),
        },
        offers: {
          "@type": "Offer",
          url: "https://moisei.uk/reservation.html",
          availability: "https://schema.org/SoldOut",
        },
      },
    ],
  };
}

function patchFile(ev) {
  const filePath = path.join(ROOT, ev.file);
  let html = fs.readFileSync(filePath, "utf8");
  const url = `https://moisei.uk${ev.path}`;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${ev.titleEn}</title>`
  );
  html = html.replace(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${ev.titleEn}" />`
  );
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${ev.descEn}" />`
  );
  html = html.replace(
    /<meta name="title" lang="uk" content="[^"]*" \/>/,
    `<meta name="title" lang="uk" content="${ev.titleUk}" />`
  );
  html = html.replace(
    /<meta name="description" lang="uk" content="[^"]*" \/>/,
    `<meta name="description" lang="uk" content="${ev.descUk}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${ev.titleEn}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${ev.descEn}" />`
  );

  if (!html.includes('name="twitter:card"')) {
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/);
    const img = ogImage ? ogImage[1] : ev.image;
    const inject = `
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ev.titleEn}" />
    <meta name="twitter:description" content="${ev.descEn}" />
    <meta name="twitter:image" content="${img}" />`;
    html = html.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `$&${inject}`
    );
  }

  const schemaBlock = `    <script type="application/ld+json">\n${JSON.stringify(buildSchema(ev), null, 2)}\n    </script>\n`;
  html = html.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*(?=<\/head>)/,
    "\n"
  );
  html = html.replace("</head>", `${schemaBlock}</head>`);

  fs.writeFileSync(filePath, html);
  console.log(`✅ ${ev.file}`);
}

for (const ev of events) {
  patchFile(ev);
}

console.log("\nDone.");
