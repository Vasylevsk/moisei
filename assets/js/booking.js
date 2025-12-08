const APPS_SCRIPT_ENDPOINT =
  "https:

const generateSlots = (startHour, endHour, stepMinutes = 15) => {
  const slots = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const normalizedHours = ((hours % 24) + 24) % 24;
    slots.push(
      `${normalizedHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
    currentMinutes += stepMinutes;
  }
  return slots;
};

const EXTRA_SATURDAY_SLOTS = ["23:15", "23:30", "23:45", "00:00"];

const TIME_SLOTS = {
  0: generateSlots(12, 23), 
  1: [], 
  2: [], 
  3: generateSlots(15, 21), 
  4: generateSlots(15, 21), 
  5: generateSlots(15, 23), 
  6: [...generateSlots(12, 23), ...EXTRA_SATURDAY_SLOTS], 
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map((part) => Number(part));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getCurrentLanguage = () => {
  return localStorage.getItem("language") || "en";
};

const getTranslation = (key) => {
  const lang = getCurrentLanguage();
  try {
    if (typeof translations !== "undefined" && translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    
    if (typeof translations !== "undefined" && translations.en && translations.en[key]) {
      return translations.en[key];
    }
  } catch (e) {
    // Translation error handled silently
  }
  return key;
};

const reservationFormHandler = () => {
  const form = document.getElementById("reservation-form");
  const statusEl = document.getElementById("reservation-status");
  const dateInput = document.querySelector('input[name="date"]');
  const timeSelect = document.querySelector('select[name="time"]');
  const submitButton = form?.querySelector(".reservation-submit");
  const nextStepBtn = document.getElementById("next-step-btn");
  const prevStepBtn = document.getElementById("prev-step-btn");
  const steps = form?.querySelectorAll(".reservation-step");

  if (!form || !statusEl) return;

  if (dateInput) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 60);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    dateInput.setAttribute("min", formatDate(today));
    dateInput.setAttribute("max", formatDate(maxDate));

    if (dateInput && dateInput.type === "date") {
      const dateIconWrapper = dateInput.closest(".icon-wrapper");
      if (dateIconWrapper) {
        dateIconWrapper.style.cursor = "pointer";

        const openDatePicker = () => {
          
          if (dateInput.type !== "date") return;

          dateInput.focus();

          if (
            dateInput.showPicker &&
            typeof dateInput.showPicker === "function"
          ) {
            setTimeout(() => {
              try {
                dateInput.showPicker();
              } catch (err) {
                
                dateInput.click();
              }
            }, 10);
          } else {
            
            setTimeout(() => {
              dateInput.click();
            }, 10);
          }
        };

        dateIconWrapper.addEventListener("click", (e) => {
          
          if (!dateInput || dateInput.type !== "date") return;

          if (e.target === dateInput) {
            
            setTimeout(openDatePicker, 10);
            return;
          }

          const isDateWrapperClick =
            e.target === dateIconWrapper ||
            e.target.closest(".icon-wrapper") === dateIconWrapper ||
            e.target.tagName === "ION-ICON";

          if (isDateWrapperClick) {
            e.preventDefault();
            e.stopPropagation();
            openDatePicker();
          }
        });

        dateInput.addEventListener("click", function (e) {
          
          if (this.type !== "date") return;

          e.stopPropagation();

          setTimeout(() => {
            if (this === document.activeElement && this.type === "date") {
              if (this.showPicker && typeof this.showPicker === "function") {
                try {
                  this.showPicker();
                } catch (err) {
                  
                }
              }
            } else if (this.type === "date") {
              
              openDatePicker();
            }
          }, 20);
        });

        dateInput.style.cursor = "pointer";
        dateInput.style.width = "100%";
      }
    }
  }

  const setStatus = (message = "", isError = false) => {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = isError
        ? "var(--gold-crayola)"
        : "var(--quick-silver)";
    }
  };

  const switchStep = (stepNumber) => {
    if (!steps) return;
    steps.forEach((step) => {
      const stepNum = parseInt(step.getAttribute("data-step"));
      if (stepNum === stepNumber) step.classList.add("active");
      else step.classList.remove("active");
    });
  };

  const isMonday = (dateStr) => {
    const d = new Date(dateStr);
    return d.getDay() === 1; 
  };

  const isTuesday = (dateStr) => {
    const d = new Date(dateStr);
    return d.getDay() === 2; 
  };

  const isClosedDay = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 1 || day === 2; 
  };

  const isValidPhone = (val) =>
    /^[+]?[\d\s\-()]{7,20}$/.test(String(val || "").trim());

  nextStepBtn?.addEventListener("click", () => {
    const partySize = form.querySelector('select[name="partySize"]')?.value;
    const date = form.querySelector('input[name="date"]')?.value;
    const time = form.querySelector('select[name="time"]')?.value;
    const location = form.querySelector('select[name="location"]')?.value;

    if (!partySize || !date || !time || !location) {
      setStatus("Please fill in all fields before proceeding.", true);
      return;
    }

    if (isClosedDay(date)) {
      setStatus(
        "We're closed on Mondays and Tuesdays. Please choose another date.",
        true
      );
      return;
    }

    switchStep(2);
    setStatus("");
  });

  prevStepBtn?.addEventListener("click", () => {
    switchStep(1);
    setStatus("");
  });

  const disableBooking = (message) => {
    if (timeSelect) {
      timeSelect.value = "";
      timeSelect.disabled = true;
    }
    if (submitButton) submitButton.disabled = true;
    if (nextStepBtn) nextStepBtn.disabled = true;
    setStatus(message, true);
  };

  const enableBooking = () => {
    if (timeSelect) timeSelect.disabled = false;
    if (submitButton) submitButton.disabled = false;
    if (nextStepBtn) nextStepBtn.disabled = false;
    setStatus("");
  };

  const populateTimeOptions = () => {
    if (!dateInput || !timeSelect) return;

    const dateValue = dateInput.value;

    if (!dateValue) {
      const selectTimeText = getTranslation("reservation2.time.placeholder");
      timeSelect.innerHTML = `<option value="">${selectTimeText}</option>`;
      timeSelect.disabled = true;
      submitButton.disabled = true;
      return;
    }

    if (isClosedDay(dateValue)) {
      const closedText = getTranslation("reservation2.monday-note");
      timeSelect.innerHTML = `<option value="">${closedText}</option>`;
      disableBooking(
        closedText
      );
      return;
    }

    const parsedDate = parseDateValue(dateValue);
    if (!parsedDate) {
      const selectTimeText = getTranslation("reservation2.time.placeholder");
      timeSelect.innerHTML = `<option value="">${selectTimeText}</option>`;
      timeSelect.disabled = true;
      if (nextStepBtn) nextStepBtn.disabled = true;
      if (submitButton) submitButton.disabled = true;
      return;
    }
    const day = parsedDate.getDay();
    const slots = TIME_SLOTS[day] || [];

    if (!slots.length) {
      const closedText = getTranslation("reservation2.monday-note");
      timeSelect.innerHTML = `<option value="">${closedText}</option>`;
      disableBooking(
        closedText
      );
      return;
    }

    enableBooking();
    if (timeSelect) {
      timeSelect.disabled = false;
      timeSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = getTranslation("reservation2.time.placeholder");
    placeholder.disabled = true;
    placeholder.hidden = true;
    placeholder.selected = true;
    timeSelect.appendChild(placeholder);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = parsedDate.getTime() === today.getTime();
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    slots.forEach((slot) => {
      
      if (isToday) {
        const [slotHours, slotMinutes] = slot.split(":").map(Number);
        const slotTimeInMinutes = slotHours * 60 + slotMinutes;

        if (slotTimeInMinutes <= currentTimeInMinutes + 15) {
          return; 
        }
      }

      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      timeSelect.appendChild(option);
    });

    if (timeSelect) {
      timeSelect.disabled = false;
      const firstEnabledOption = Array.from(timeSelect.options).find(
        (opt) => !opt.disabled && opt.value
      );
      if (firstEnabledOption) {
        firstEnabledOption.selected = true;
      } else if (slots.length) {
        timeSelect.selectedIndex = 1;
      }
    }
  };

  const validateStep1 = () => {
    if (!nextStepBtn) return;
    const partySize = form.querySelector('select[name="partySize"]')?.value;
    const date = form.querySelector('input[name="date"]')?.value;
    const time = form.querySelector('select[name="time"]')?.value;
    const location = form.querySelector('select[name="location"]')?.value;

    nextStepBtn.disabled =
      !(partySize && date && time && location) || (date && isClosedDay(date));
  };

  const partySizeSelect = form.querySelector('select[name="partySize"]');
  const locationSelect = form.querySelector('select[name="location"]');

  partySizeSelect?.addEventListener("change", validateStep1);
  locationSelect?.addEventListener("change", validateStep1);
  dateInput?.addEventListener("change", () => {
    populateTimeOptions();
    validateStep1();
  });

  dateInput?.addEventListener("input", () => {
    populateTimeOptions();
    validateStep1();
  });
  timeSelect?.addEventListener("change", validateStep1);

  populateTimeOptions();
  validateStep1();

  document.addEventListener("languageChanged", () => {
    populateTimeOptions();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const formData = new FormData(form);
    const payload = {
      partySize: formData.get("partySize"),
      date: formData.get("date"),
      time: formData.get("time"),
      location: formData.get("location"),
      name: (formData.get("name") || "").trim(),
      email: (formData.get("email") || "").trim(),
      phone: (formData.get("phone") || "").trim(),
      message: (formData.get("message") || "").trim(),
      action: "create",
      language: getCurrentLanguage(), 
    };

    if (!payload.date || isClosedDay(payload.date)) {
      setStatus(
        "We're closed on Mondays and Tuesdays. Please choose another date.",
        true
      );
      return;
    }

    if (
      !payload.partySize ||
      !payload.time ||
      !payload.location ||
      !payload.name ||
      !payload.email ||
      !payload.phone
    ) {
      setStatus("Please fill in all required fields.", true);
      return;
    }

    if (payload.name.length < 2 || payload.name.length > 100) {
      setStatus("Name must be between 2 and 100 characters.", true);
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) nameInput.focus();
      return;
    }
    
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁіІїЇєЄ\s\-']+$/u;
    if (!nameRegex.test(payload.name)) {
      setStatus("Name contains invalid characters. Please use only letters, spaces, hyphens, and apostrophes.", true);
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) nameInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email) || payload.email.length > 255) {
      setStatus("Please enter a valid email address.", true);
      const emailInput = form.querySelector('input[name="email"]');
      if (emailInput) emailInput.focus();
      return;
    }

    const phoneDigits = payload.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15 || payload.phone.length > 50) {
      setStatus("Please enter a valid phone number (7-15 digits).", true);
      const phoneInput = form.querySelector('input[name="phone"]');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (payload.message && payload.message.length > 1000) {
      setStatus("Message is too long. Maximum 1000 characters.", true);
      const messageInput = form.querySelector('textarea[name="message"]');
      if (messageInput) messageInput.focus();
      return;
    }

    const selectedDate = parseDateValue(payload.date);
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = selectedDate.getTime() === today.getTime();

      if (isToday && payload.time) {
        const [timeHours, timeMinutes] = payload.time.split(":").map(Number);
        const selectedTimeInMinutes = timeHours * 60 + timeMinutes;
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;

        if (selectedTimeInMinutes <= currentTimeInMinutes + 15) {
          setStatus(
            "You cannot book a time that has already passed. Please select a future time.",
            true
          );
          if (timeSelect) {
            timeSelect.focus();
            timeSelect.value = "";
          }
          return;
        }
      }
    }

    if (!isValidPhone(payload.phone)) {
      setStatus("Please enter a valid phone number (digits, +, (), -).", true);
      const phoneInput = form.querySelector('input[name="phone"]');
      if (phoneInput) phoneInput.focus();
      return;
    }

    setStatus("Submitting your booking request...");

    try {

      const iframe = document.createElement('iframe');
      iframe.name = 'hidden-iframe-' + Date.now();
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const hiddenForm = document.createElement('form');
      hiddenForm.method = 'POST';
      hiddenForm.action = APPS_SCRIPT_ENDPOINT;
      hiddenForm.target = iframe.name;
      hiddenForm.style.display = 'none';

      Object.keys(payload).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : payload[key];
        hiddenForm.appendChild(input);
      });
      
      document.body.appendChild(hiddenForm);

      let formSubmitted = false;
      iframe.onload = function() {
        if (!formSubmitted) {
          formSubmitted = true;
          setTimeout(() => {
            
            setStatus(
              "Thank you! Your booking request has been received. We'll confirm shortly."
            );

            form.reset();
            populateTimeOptions();
            switchStep(1);

            try {
              if (document.body.contains(hiddenForm)) {
                document.body.removeChild(hiddenForm);
              }
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            } catch (e) {
              // Error removing elements handled silently
            }
          }, 1000);
        }
      };

      iframe.onerror = function() {
        if (!formSubmitted) {
          formSubmitted = true;
          setStatus(
            "There was a problem sending your booking. Please check the console or try again later.",
            true
          );
          try {
            if (document.body.contains(hiddenForm)) {
              document.body.removeChild(hiddenForm);
            }
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (e) {
            // Error removing elements handled silently
          }
        }
      };

      setTimeout(() => {
        if (!formSubmitted) {
          formSubmitted = true;
          setStatus(
            "Thank you! Your booking request has been received. We'll confirm shortly."
          );
          form.reset();
          populateTimeOptions();
          switchStep(1);
          try {
            if (document.body.contains(hiddenForm)) {
              document.body.removeChild(hiddenForm);
            }
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (e) {
            // Error removing elements handled silently
          }
        }
      }, 5000);

      hiddenForm.submit();
    } catch (e) {
      // Booking error handled silently
      setStatus(
        "There was a problem sending your booking. Please try again or call us. Error: " + e.message,
        true
      );
    }
  });
};

document.addEventListener("DOMContentLoaded", reservationFormHandler);

