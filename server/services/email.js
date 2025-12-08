const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Настройка транспорта
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Загрузка HTML шаблонов
const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../../email-templates', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf8');
};

// Форматирование даты
const formatDate = (dateStr, lang = 'en') => {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-US', options);
};

// Форматирование гостей
const formatGuests = (partySize, lang = 'en') => {
  const guests = {
    '1': lang === 'uk' ? '1 особа' : '1 Person',
    '2': lang === 'uk' ? '2 особи' : '2 People',
    '3': lang === 'uk' ? '3 особи' : '3 People',
    '4': lang === 'uk' ? '4 особи' : '4 People',
    '5': lang === 'uk' ? '5 осіб' : '5 People',
    '6': lang === 'uk' ? '6 осіб' : '6 People',
    '7': lang === 'uk' ? '7 осіб' : '7 People',
    '8-plus': lang === 'uk' ? '8+ гостей' : '8+ Guests',
  };
  return guests[partySize] || partySize;
};

// Переводы
const translations = {
  en: {
    pending: {
      subject: 'Your Reservation Request - Moisei',
      title: 'Reservation Pending Confirmation',
      greeting: 'Dear {{NAME}},',
      dateLabel: 'Date',
      timeLabel: 'Time',
      guestsLabel: 'Number of Guests',
      locationLabel: 'Location',
      message: 'Thank you for your reservation request! We have received your booking and it is currently pending confirmation. We will review your request and get back to you shortly.',
      closing: 'We look forward to welcoming you to Moisei!',
      websiteButton: 'Website',
      instagramButton: 'Instagram',
      directionButton: 'Direction',
    },
    confirmed: {
      subject: 'Reservation Confirmed - Moisei',
      title: 'Reservation Confirmed!',
      greeting: 'Dear {{NAME}},',
      dateLabel: 'Date',
      timeLabel: 'Time',
      guestsLabel: 'Number of Guests',
      locationLabel: 'Location',
      message: 'Great news! Your reservation has been confirmed. We are excited to welcome you to our restaurant.',
      closing: 'We look forward to seeing you soon!',
      websiteButton: 'Website',
      instagramButton: 'Instagram',
      directionButton: 'Direction',
    },
    declined: {
      subject: 'Reservation Update - Moisei',
      title: 'Reservation Update',
      greeting: 'Dear {{NAME}},',
      dateLabel: 'Date',
      timeLabel: 'Time',
      message: 'Unfortunately, we are unable to accommodate your reservation request for the selected date and time.',
      contactMessage: 'We apologize for any inconvenience. Please feel free to contact us by phone to discuss alternative options:',
      phoneLabel: 'Contact Us',
      closing: 'We hope to serve you in the future!',
      websiteButton: 'Website',
      instagramButton: 'Instagram',
      directionButton: 'Direction',
    },
  },
  uk: {
    pending: {
      subject: 'Ваш запит на бронювання - Moisei',
      title: 'Бронювання очікує підтвердження',
      greeting: 'Шановний/а {{NAME}},',
      dateLabel: 'Дата',
      timeLabel: 'Час',
      guestsLabel: 'Кількість гостей',
      locationLabel: 'Розташування',
      message: 'Дякуємо за ваш запит на бронювання! Ми отримали ваше бронювання, і воно очікує підтвердження. Ми розглянемо ваш запит і зв\'яжемося з вами найближчим часом.',
      closing: 'Ми з нетерпінням чекаємо на вас у Moisei!',
      websiteButton: 'Веб-сайт',
      instagramButton: 'Instagram',
      directionButton: 'Маршрут',
    },
    confirmed: {
      subject: 'Бронювання підтверджено - Moisei',
      title: 'Бронювання підтверджено!',
      greeting: 'Шановний/а {{NAME}},',
      dateLabel: 'Дата',
      timeLabel: 'Час',
      guestsLabel: 'Кількість гостей',
      locationLabel: 'Розташування',
      message: 'Чудові новини! Ваше бронювання підтверджено. Ми з радістю чекаємо на вас у нашому ресторані.',
      closing: 'Ми з нетерпінням чекаємо на зустріч з вами!',
      websiteButton: 'Веб-сайт',
      instagramButton: 'Instagram',
      directionButton: 'Маршрут',
    },
    declined: {
      subject: 'Оновлення бронювання - Moisei',
      title: 'Оновлення бронювання',
      greeting: 'Шановний/а {{NAME}},',
      dateLabel: 'Дата',
      timeLabel: 'Час',
      message: 'На жаль, ми не можемо задовольнити ваш запит на бронювання на обрану дату та час.',
      contactMessage: 'Вибачте за незручності. Будь ласка, зв\'яжіться з нами за телефоном, щоб обговорити альтернативні варіанти:',
      phoneLabel: 'Зв\'яжіться з нами',
      closing: 'Сподіваємося обслуговувати вас у майбутньому!',
      websiteButton: 'Веб-сайт',
      instagramButton: 'Instagram',
      directionButton: 'Маршрут',
    },
  },
};

const getTranslations = (lang) => translations[lang] || translations.en;

// Отправка email клиенту (ожидание)
const sendClientPendingEmail = async (data) => {
  const lang = data.language || 'en';
  const t = getTranslations(lang).pending;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  let html = loadTemplate('client-pending');
  html = html
    .replace(/\{\{TITLE\}\}/g, t.title)
    .replace(/\{\{GREETING\}\}/g, t.greeting.replace('{{NAME}}', data.name))
    .replace(/\{\{DATE_LABEL\}\}/g, t.dateLabel)
    .replace(/\{\{DATE\}\}/g, formatDate(data.date, lang))
    .replace(/\{\{TIME_LABEL\}\}/g, t.timeLabel)
    .replace(/\{\{TIME\}\}/g, data.time)
    .replace(/\{\{GUESTS_LABEL\}\}/g, t.guestsLabel)
    .replace(/\{\{GUESTS\}\}/g, formatGuests(data.partySize, lang))
    .replace(/\{\{LOCATION_LABEL\}\}/g, t.locationLabel)
    .replace(/\{\{LOCATION\}\}/g, data.location)
    .replace(/\{\{MESSAGE\}\}/g, t.message)
    .replace(/\{\{CLOSING\}\}/g, t.closing)
    .replace(/\{\{WEBSITE_URL\}\}/g, process.env.WEBSITE_URL || 'https://moisei.uk')
        .replace(/\{\{INSTAGRAM_URL\}\}/g, process.env.INSTAGRAM_URL || 'https://www.instagram.com/moiseirestaurant/')
    .replace(/\{\{DIRECTION_URL\}\}/g, process.env.DIRECTION_URL || 'https://www.google.com/maps/place/Moisei+at+Makai/@51.4850816,-0.3145728,14z/data=!4m6!3m5!1s0x48760d4e55bf2d53:0xaa343169020509af!8m2!3d51.4847492!4d-0.3018951!16s%2Fg%2F11gsc9580z?entry=ttu&g_ep=EgoyMDI1MTExMC4wIKXMDSoASAFQAw%3D%3D')
    .replace(/\{\{WEBSITE_BUTTON\}\}/g, t.websiteButton)
    .replace(/\{\{INSTAGRAM_BUTTON\}\}/g, t.instagramButton)
    .replace(/\{\{DIRECTION_BUTTON\}\}/g, t.directionButton);

  await transporter.sendMail({
    from: `"Moisei" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: t.subject,
    html,
  });
};

// Отправка email администраторам
const sendRestaurantNotification = async (data) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  // Добавляем токен безопасности в URL
  const token = data.securityToken || '';
  const confirmUrl = `${baseUrl}/api/reservations/confirm/${data.id}${token ? `?token=${token}` : ''}`;
  const declineUrl = `${baseUrl}/api/reservations/decline/${data.id}${token ? `?token=${token}` : ''}`;
  
  let html = loadTemplate('restaurant-notification');
  html = html
    .replace(/\{\{NAME\}\}/g, data.name)
    .replace(/\{\{EMAIL\}\}/g, data.email)
    .replace(/\{\{PHONE\}\}/g, data.phone)
    .replace(/\{\{DATE\}\}/g, formatDate(data.date, 'en'))
    .replace(/\{\{TIME\}\}/g, data.time)
    .replace(/\{\{GUESTS\}\}/g, formatGuests(data.partySize, 'en'))
    .replace(/\{\{LOCATION\}\}/g, data.location)
    .replace(/\{\{MESSAGE\}\}/g, data.message || '')
    .replace(/\{\{CONFIRM_URL\}\}/g, confirmUrl)
    .replace(/\{\{DECLINE_URL\}\}/g, declineUrl)
    .replace(/\{\{RESERVATION_ID\}\}/g, data.id);

  const adminEmails = [process.env.RESTAURANT_EMAIL, ...(process.env.ADMIN_EMAILS?.split(',') || [])]
    .map(email => email.trim())
    .filter((email, index, self) => self.indexOf(email) === index);

  for (const email of adminEmails) {
    try {
      await transporter.sendMail({
        from: `"Moisei" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `New Reservation Request - ${data.name} - ${formatDate(data.date, 'en')} ${data.time}`,
        html,
      });
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error);
    }
  }
};

// Отправка email клиенту (подтверждение)
const sendClientConfirmedEmail = async (data) => {
  const lang = data.language || 'en';
  const t = getTranslations(lang).confirmed;
  
  let html = loadTemplate('client-confirmed');
  html = html
    .replace(/\{\{TITLE\}\}/g, t.title)
    .replace(/\{\{GREETING\}\}/g, t.greeting.replace('{{NAME}}', data.name))
    .replace(/\{\{DATE_LABEL\}\}/g, t.dateLabel)
    .replace(/\{\{DATE\}\}/g, formatDate(data.date, lang))
    .replace(/\{\{TIME_LABEL\}\}/g, t.timeLabel)
    .replace(/\{\{TIME\}\}/g, data.time)
    .replace(/\{\{GUESTS_LABEL\}\}/g, t.guestsLabel)
    .replace(/\{\{GUESTS\}\}/g, formatGuests(data.partySize, lang))
    .replace(/\{\{LOCATION_LABEL\}\}/g, t.locationLabel)
    .replace(/\{\{LOCATION\}\}/g, data.location)
    .replace(/\{\{MESSAGE\}\}/g, t.message)
    .replace(/\{\{CLOSING\}\}/g, t.closing)
    .replace(/\{\{WEBSITE_URL\}\}/g, process.env.WEBSITE_URL || 'https://moisei.uk')
        .replace(/\{\{INSTAGRAM_URL\}\}/g, process.env.INSTAGRAM_URL || 'https://www.instagram.com/moiseirestaurant/')
    .replace(/\{\{DIRECTION_URL\}\}/g, process.env.DIRECTION_URL || 'https://www.google.com/maps/place/Moisei+at+Makai/@51.4850816,-0.3145728,14z/data=!4m6!3m5!1s0x48760d4e55bf2d53:0xaa343169020509af!8m2!3d51.4847492!4d-0.3018951!16s%2Fg%2F11gsc9580z?entry=ttu&g_ep=EgoyMDI1MTExMC4wIKXMDSoASAFQAw%3D%3D')
    .replace(/\{\{WEBSITE_BUTTON\}\}/g, t.websiteButton)
    .replace(/\{\{INSTAGRAM_BUTTON\}\}/g, t.instagramButton)
    .replace(/\{\{DIRECTION_BUTTON\}\}/g, t.directionButton);

  await transporter.sendMail({
    from: `"Moisei" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: t.subject,
    html,
  });
};

// Отправка email клиенту (отказ)
const sendClientDeclinedEmail = async (data) => {
  const lang = data.language || 'en';
  const t = getTranslations(lang).declined;
  
  let html = loadTemplate('client-declined');
  html = html
    .replace(/\{\{TITLE\}\}/g, t.title)
    .replace(/\{\{GREETING\}\}/g, t.greeting.replace('{{NAME}}', data.name))
    .replace(/\{\{DATE_LABEL\}\}/g, t.dateLabel)
    .replace(/\{\{DATE\}\}/g, formatDate(data.date, lang))
    .replace(/\{\{TIME_LABEL\}\}/g, t.timeLabel)
    .replace(/\{\{TIME\}\}/g, data.time)
    .replace(/\{\{MESSAGE\}\}/g, t.message)
    .replace(/\{\{CONTACT_MESSAGE\}\}/g, t.contactMessage)
    .replace(/\{\{PHONE_LABEL\}\}/g, t.phoneLabel)
    .replace(/\{\{CLOSING\}\}/g, t.closing)
    .replace(/\{\{WEBSITE_URL\}\}/g, process.env.WEBSITE_URL || 'https://moisei.uk')
        .replace(/\{\{INSTAGRAM_URL\}\}/g, process.env.INSTAGRAM_URL || 'https://www.instagram.com/moiseirestaurant/')
    .replace(/\{\{DIRECTION_URL\}\}/g, process.env.DIRECTION_URL || 'https://www.google.com/maps/place/Moisei+at+Makai/@51.4850816,-0.3145728,14z/data=!4m6!3m5!1s0x48760d4e55bf2d53:0xaa343169020509af!8m2!3d51.4847492!4d-0.3018951!16s%2Fg%2F11gsc9580z?entry=ttu&g_ep=EgoyMDI1MTExMC4wIKXMDSoASAFQAw%3D%3D')
    .replace(/\{\{WEBSITE_BUTTON\}\}/g, t.websiteButton)
    .replace(/\{\{INSTAGRAM_BUTTON\}\}/g, t.instagramButton)
    .replace(/\{\{DIRECTION_BUTTON\}\}/g, t.directionButton);

  await transporter.sendMail({
    from: `"Moisei" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: t.subject,
    html,
  });
};

module.exports = {
  sendClientPendingEmail,
  sendRestaurantNotification,
  sendClientConfirmedEmail,
  sendClientDeclinedEmail,
};


