// Validation helpers for EventForm
export const validators = {
  title: (value) => {
    if (!value || value.trim().length === 0) {
      return "Заглавието е задължително";
    }
    if (value.trim().length < 3) {
      return "Заглавието трябва да е поне 3 символа";
    }
    return null;
  },
  date: (value) => {
    if (!value) {
      return "Датата е задължителна";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return "Датата трябва да е днес или в бъдеще";
    }
    return null;
  },
  location: (value) => {
    if (!value || value.trim().length === 0) {
      return "Локацията е задължителна";
    }
    return null;
  },
  description: () => {
    // Optional field - no validation needed
    return null;
  },
  imageUrl: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Optional field
    }
    try {
      new URL(value);
      return null;
    } catch {
      return "Моля, въведете валиден URL адрес";
    }
  },
  city: (value) => {
    if (!value || value.trim().length === 0) {
      return "Градът е задължителен";
    }
    if (value.trim().length < 2) {
      return "Градът трябва да е поне 2 символа";
    }
    return null;
  },
  category: (value) => {
    if (!value || value.trim().length === 0) {
      return "Категорията е задължителна";
    }
    return null;
  },
  organizer: () => {
    // Optional field - no validation needed
    return null;
  },
  organizerUrl: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Optional field
    }
    try {
      new URL(value);
      return null;
    } catch {
      return "Моля, въведете валиден URL адрес";
    }
  },
  password: (value) => {
    if (!value || value.trim().length === 0) {
      return "Паролата е задължителна";
    }
    if (value.length < 6) {
      return "Паролата трябва да е поне 6 символа";
    }
    return null;
  },
  username: (value) => {
    // Username is optional, but if provided must be at least 3 characters
    if (value && value.trim().length > 0 && value.trim().length < 3) {
      return "Потребителското име трябва да е поне 3 символа";
    }
    return null;
  },
  email: (value) => {
    if (!value || value.trim().length === 0) {
      return "Имейлът е задължителен";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Моля, въведете валиден имейл адрес";
    }
    return null;
  },
  avatarUrl: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Optional field
    }
    try {
      new URL(value);
      return null;
    } catch {
      return "Моля, въведете валиден URL адрес";
    }
  },
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword || confirmPassword.trim().length === 0) {
      return "Моля, потвърдете паролата";
    }
    if (password !== confirmPassword) {
      return "Паролите не съвпадат";
    }
    return null;
  },
  // New event model validators
  startDate: (value) => {
    if (!value) {
      return "Началната дата е задължителна";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return "Началната дата трябва да е днес или в бъдеще";
    }
    return null;
  },
  startTime: (value) => {
    if (!value) {
      return "Началният час е задължителен";
    }
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return "Моля, въведете валиден час (HH:MM)";
    }
    return null;
  },
  endDate: (value, startDate) => {
    // Optional field, but if provided must be after startDate
    if (value && startDate && value < startDate) {
      return "Крайната дата трябва да е след началната дата";
    }
    return null;
  },
  endTime: (value, startDate, startTime, endDate) => {
    if (!value) {
      return "Крайният час е задължителен";
    }
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return "Моля, въведете валиден час (HH:MM)";
    }
    // If same day, check that end time is after start time
    if (startDate && endDate && startDate === endDate && startTime) {
      const start = new Date(`${startDate}T${startTime}:00`);
      const end = new Date(`${endDate}T${value}:00`);
      if (end <= start) {
        return "Крайният час трябва да е след началния час";
      }
    }
    return null;
  },
  locationType: (value) => {
    if (!value) {
      return "Типът на локацията е задължителен";
    }
    const validTypes = ["physical", "online", "to-be-announced"];
    if (!validTypes.includes(value)) {
      return "Моля, изберете валиден тип локация";
    }
    return null;
  },
  address: (value, locationType) => {
    if (locationType === "physical" && (!value || value.trim().length === 0)) {
      return "Адресът е задължителен за физически събития";
    }
    return null;
  },
  meetingUrl: (value, locationType) => {
    if (locationType === "online") {
      if (!value || value.trim().length === 0) {
        return "URL адресът за среща е задължителен за онлайн събития";
      }
      try {
        new URL(value);
        return null;
      } catch {
        return "Моля, въведете валиден URL адрес";
      }
    }
    return null;
  },
  capacity: (value) => {
    if (value !== null && value !== undefined && value !== "") {
      const num = Number(value);
      if (isNaN(num) || num < 1) {
        return "Капацитетът трябва да е положително число";
      }
      if (!Number.isInteger(num)) {
        return "Капацитетът трябва да е цяло число";
      }
    }
    return null;
  },
  price: (value, isFree) => {
    if (isFree === false && (value === null || value === undefined || value === "")) {
      return "Цената е задължителна за платени събития";
    }
    if (value !== null && value !== undefined && value !== "") {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "Цената трябва да е положително число";
      }
    }
    return null;
  },
  currency: (value, isFree) => {
    if (isFree === false && (!value || value.trim().length === 0)) {
      return "Валутата е задължителна за платени събития";
    }
    if (value && !["BGN", "EUR", "USD"].includes(value)) {
      return "Моля, изберете валидна валута";
    }
    return null;
  },
  organizerName: () => {
    // Optional field
    return null;
  },
  organizerAvatar: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Optional field
    }
    try {
      new URL(value);
      return null;
    } catch {
      return "Моля, въведете валиден URL адрес";
    }
  },
  durationMinutes: (value) => {
    if (value !== null && value !== undefined && value !== "") {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return "Продължителността трябва да е положително число";
      }
    }
    return null;
  },
  tags: () => {
    // Optional field - comma-separated tags
    return null;
  },
  websiteUrl: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Optional field
    }
    try {
      new URL(value);
      return null;
    } catch {
      return "Моля, въведете валиден URL адрес";
    }
  },
};

