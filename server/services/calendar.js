const { google } = require('googleapis');
const path = require('path');

// Инициализация Google Calendar API
let calendar = null;

const initCalendar = () => {
  if (calendar) return calendar;

  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar']
    );

    calendar = google.calendar({ version: 'v3', auth });
    return calendar;
  } catch (error) {
    console.error('Calendar initialization error:', error);
    return null;
  }
};

// Форматирование гостей
const formatGuests = (partySize) => {
  const guests = {
    '1': '1 Person',
    '2': '2 People',
    '3': '3 People',
    '4': '4 People',
    '5': '5 People',
    '6': '6 People',
    '7': '7 People',
    '8-plus': '8+ Guests',
  };
  return guests[partySize] || partySize;
};

// Создание события
const createEvent = async (data, status) => {
  try {
    const cal = initCalendar();
    if (!cal) {
      console.error('Calendar not initialized');
      return null;
    }

    const [year, month, day] = data.date.split('-').map(Number);
    const [hours, minutes] = data.time.split(':').map(Number);

    const startTime = new Date(year, month - 1, day, hours, minutes);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 часа

    const statusPrefix = status === 'pending' ? '⏳ PENDING: ' : '✅ ';
    const title = `${statusPrefix}${data.name} - ${formatGuests(data.partySize)} - ${data.location}`;

    const description = [
      `Reservation ID: ${data.id}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `Guests: ${formatGuests(data.partySize)}`,
      `Location: ${data.location}`,
      `Status: ${status.toUpperCase()}`,
      data.message ? `Message: ${data.message}` : '',
    ].filter(Boolean).join('\n');

    const event = {
      summary: title,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Europe/London',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/London',
      },
      colorId: status === 'pending' ? '5' : '10', // Yellow for pending, Green for confirmed
      // Убрали attendees, чтобы не отправлять уведомления клиентам
      sendUpdates: 'none',
    };

    const response = await cal.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });

    return response.data.id;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
};

// Обновление события
const updateEvent = async (eventId, data, status) => {
  try {
    const cal = initCalendar();
    if (!cal) {
      console.error('Calendar not initialized');
      return;
    }

    const statusPrefix = status === 'confirmed' ? '✅ ' : '⏳ PENDING: ';
    const title = `${statusPrefix}${data.name} - ${formatGuests(data.partySize)} - ${data.location}`;

    const description = [
      `Reservation ID: ${data.id}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      `Guests: ${formatGuests(data.partySize)}`,
      `Location: ${data.location}`,
      `Status: ${status.toUpperCase()}`,
      data.message ? `Message: ${data.message}` : '',
    ].filter(Boolean).join('\n');

    const event = {
      summary: title,
      description,
      colorId: status === 'confirmed' ? '10' : '5',
    };

    await cal.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      resource: event,
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
  }
};

// Удаление события
const deleteEvent = async (eventId) => {
  try {
    const cal = initCalendar();
    if (!cal) {
      console.error('Calendar not initialized');
      return;
    }

    await cal.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
};


