const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const reservationController = require('../controllers/reservationController');
const { validateReservation } = require('../middleware/validator');

const router = express.Router();

// Strict rate limiting for reservation creation
const createReservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: {
    success: false,
    error: 'Too many reservation requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Validation rules
const reservationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄ\s\-\']+$/u)
    .withMessage('Name must be 2-100 characters and contain only letters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Invalid email address'),
  body('phone')
    .trim()
    .matches(/^[\d\s\+\-\(\)]+$/)
    .custom((value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        throw new Error('Phone must contain 7-15 digits');
      }
      return true;
    })
    .isLength({ max: 50 })
    .withMessage('Invalid phone number'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format'),
  body('time')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('partySize')
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10-plus'])
    .withMessage('Invalid party size'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message too long (max 1000 characters)'),
  body('language')
    .optional()
    .isIn(['en', 'uk'])
    .withMessage('Invalid language'),
];

// Routes
router.post('/create', 
  createReservationLimiter,
  reservationValidation,
  validateReservation,
  reservationController.create
);

router.get('/confirm/:id', reservationController.confirm);
router.get('/decline/:id', reservationController.decline);

module.exports = router;


