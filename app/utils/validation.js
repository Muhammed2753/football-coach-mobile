// app/utils/validation.js

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validateAge = (age) => {
  const numAge = parseInt(age);
  return numAge >= 4 && numAge <= 56;
};

export const validateHeight = (height) => {
  const numHeight = parseInt(height);
  return numHeight >= 50 && numHeight <= 250;
};

export const validateDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateDuration = (duration) => {
  const numDuration = parseInt(duration);
  return numDuration > 0 && numDuration <= 480; // Max 8 hours
};

export const showValidationError = (field, message) => {
  return { field, message, isValid: false };
};

export const validateProfileForm = (data) => {
  const errors = [];

  if (data.name && !validateName(data.name)) {
    errors.push('Name must be at least 2 characters');
  }

  if (data.age && !validateAge(data.age)) {
    errors.push('Age must be between 4 and 56');
  }

  if (data.height && !validateHeight(data.height)) {
    errors.push('Height must be between 50 and 250 cm');
  }

  if (data.dateOfBirth && !validateDate(data.dateOfBirth)) {
    errors.push('Invalid date format (use YYYY-MM-DD)');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateTrainingSession = (session) => {
  const errors = [];

  if (!session.activity || session.activity.trim().length < 3) {
    errors.push('Activity must be at least 3 characters');
  }

  if (!session.duration || !validateDuration(session.duration)) {
    errors.push('Duration must be between 1 and 480 minutes');
  }

  if (session.date && !validateDate(session.date)) {
    errors.push('Invalid date format');
  }

  return { isValid: errors.length === 0, errors };
};
