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
  description: (value) => {
    if (!value || value.trim().length === 0) {
      return "Описанието е задължително";
    }
    if (value.trim().length < 10) {
      return "Описанието трябва да е поне 10 символа";
    }
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
  price: () => {
    // Optional field - string allowed, no validation needed
    return null;
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
    if (!value || value.trim().length === 0) {
      return "Потребителското име е задължително";
    }
    if (value.trim().length < 3) {
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
};

