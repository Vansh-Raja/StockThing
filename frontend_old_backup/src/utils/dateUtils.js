import { format, parseISO } from 'date-fns';

/**
 * Format date for display
 * @param {string|Date} date - ISO date string or Date object
 * @param {string} formatStr - Format string (default: 'dd MMM yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date and time for display
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
};

/**
 * Get current date/time in ISO format
 * @returns {string} Current date/time in ISO format
 */
export const getCurrentDateTime = () => {
  return new Date().toISOString();
};

/**
 * Format date for input field (YYYY-MM-DDTHH:mm)
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

