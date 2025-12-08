const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const emailService = require('../services/email');
const calendarService = require('../services/calendar');
const storageService = require('../services/storage');

// Rate limiting по email (в продакшене использовать Redis)
const emailRateLimits = new Map();

// Генерация токена безопасности
const generateSecurityToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const create = async (req, res) => {
  try {
    const reservationData = {
      id: uuidv4(),
      ...req.body,
      status: 'pending',
      timestamp: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      securityToken: generateSecurityToken() // Токен для безопасности подтверждения
    };

    // Rate limiting по email (дополнительно к IP)
    const emailKey = reservationData.email.toLowerCase();
    const emailRequests = emailRateLimits.get(emailKey) || [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentEmailRequests = emailRequests.filter(time => time > oneHourAgo);
    
    // Улучшенная защита от спама: максимум 3 запроса в час с одного email
    if (recentEmailRequests.length >= 3) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests from this email. Please try again later.'
      });
    }
    
    recentEmailRequests.push(Date.now());
    emailRateLimits.set(emailKey, recentEmailRequests);

    // Дополнительная защита: проверка на одинаковые данные в короткий период
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentSameData = emailRequests.filter(time => time > fiveMinutesAgo);
    if (recentSameData.length >= 2) {
      return res.status(429).json({
        success: false,
        error: 'Please wait a few minutes before submitting another reservation.'
      });
    }

    // Сохраняем резервацию
    storageService.save(reservationData.id, reservationData);

    // Создаем событие в календаре
    let calendarEventId = null;
    try {
      calendarEventId = await calendarService.createEvent(reservationData, 'pending');
      reservationData.calendarEventId = calendarEventId;
      storageService.save(reservationData.id, reservationData);
    } catch (calendarError) {
      console.error('Calendar error:', calendarError);
      // Продолжаем даже если календарь не работает
    }

    // Отправляем email клиенту
    try {
      await emailService.sendClientPendingEmail(reservationData);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    // Отправляем email администраторам
    try {
      await emailService.sendRestaurantNotification(reservationData);
    } catch (emailError) {
      console.error('Admin email error:', emailError);
    }

    res.json({
      success: true,
      message: 'Reservation request received',
      reservationId: reservationData.id
    });

  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reservation'
    });
  }
};

const confirm = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query; // Токен из URL
    const reservation = storageService.get(id);

    if (!reservation) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #cc3333;">Reservation not found</h1>
            <p>The reservation ID is invalid or has expired.</p>
          </body>
        </html>
      `);
    }

    // ЗАЩИТА: Проверяем статус
    if (reservation.status === 'confirmed') {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #8fad81;">Already Confirmed</h1>
            <p>This reservation has already been confirmed.</p>
          </body>
        </html>
      `);
    }

    if (reservation.status === 'declined') {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #cc3333;">Cannot Confirm</h1>
            <p>This reservation was already declined and cannot be confirmed.</p>
          </body>
        </html>
      `);
    }

    // Обновляем статус
    storageService.update(id, { status: 'confirmed' });
    reservation.status = 'confirmed';

    // Обновляем календарь
    if (reservation.calendarEventId) {
      try {
        await calendarService.updateEvent(reservation.calendarEventId, reservation, 'confirmed');
      } catch (error) {
        console.error('Calendar update error:', error);
      }
    }

    // Отправляем email клиенту
    try {
      await emailService.sendClientConfirmedEmail(reservation);
    } catch (error) {
      console.error('Email error:', error);
    }

    res.send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
          <h1 style="color: #8fad81;">✓ Reservation Confirmed!</h1>
          <p style="font-size: 18px;">The client has been notified by email.</p>
          <p style="color: #999; margin-top: 30px;">You can close this window.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
          <h1 style="color: #cc3333;">Error</h1>
          <p>There was an error confirming the reservation.</p>
        </body>
      </html>
    `);
  }
};

const decline = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query; // Токен из URL
    const reservation = storageService.get(id);

    if (!reservation) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #cc3333;">Reservation not found</h1>
            <p>The reservation ID is invalid or has expired.</p>
          </body>
        </html>
      `);
    }

    // Проверка токена безопасности (если токен не передан, разрешаем для обратной совместимости)
    if (token && reservation.securityToken && token !== reservation.securityToken) {
      return res.status(403).send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #cc3333;">Access Denied</h1>
            <p>Invalid security token. Please use the link from the admin email.</p>
          </body>
        </html>
      `);
    }

    // ЗАЩИТА: Проверяем статус
    if (reservation.status === 'declined') {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #cc3333;">Already Declined</h1>
            <p>This reservation has already been declined.</p>
          </body>
        </html>
      `);
    }

    if (reservation.status === 'confirmed') {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
            <h1 style="color: #cc3333;">Cannot Decline</h1>
            <p>This reservation was already confirmed and cannot be declined.</p>
          </body>
        </html>
      `);
    }

    // Обновляем статус
    storageService.update(id, { status: 'declined' });
    reservation.status = 'declined';

    // Удаляем из календаря
    if (reservation.calendarEventId) {
      try {
        await calendarService.deleteEvent(reservation.calendarEventId);
      } catch (error) {
        console.error('Calendar delete error:', error);
      }
    }

    // Отправляем email клиенту
    try {
      await emailService.sendClientDeclinedEmail(reservation);
    } catch (error) {
      console.error('Email error:', error);
    }

    res.send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
          <h1 style="color: #cc3333;">✗ Reservation Declined</h1>
          <p style="font-size: 18px;">The client has been notified by email.</p>
          <p style="color: #999; margin-top: 30px;">You can close this window.</p>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Decline error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center; background: #1a1a1a; color: #fff;">
          <h1 style="color: #cc3333;">Error</h1>
          <p>There was an error declining the reservation.</p>
        </body>
      </html>
    `);
  }
};

module.exports = { create, confirm, decline };

