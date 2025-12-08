const { validationResult } = require('express-validator');

// Custom validation middleware
const validateReservation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array()
    });
  }

  // Additional business logic validation
  const { date, time } = req.body;
  
  // Check if date is in the past
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return res.status(400).json({
      success: false,
      error: 'Cannot book for past dates'
    });
  }

  // Check if time is in the past (if booking for today)
  if (selectedDate.getTime() === today.getTime()) {
    const [hours, minutes] = time.split(':').map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    
    // Can't book within 15 minutes
    if (selectedTime <= new Date(now.getTime() + 15 * 60 * 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot book for times in the past or within 15 minutes'
      });
    }
  }

  // Check if Monday or Tuesday (closed days)
  const dayOfWeek = selectedDate.getDay();
  if (dayOfWeek === 1 || dayOfWeek === 2) { // Monday = 1, Tuesday = 2
    return res.status(400).json({
      success: false,
      error: 'Restaurant is closed on Mondays and Tuesdays'
    });
  }

  next();
};

module.exports = { validateReservation };


