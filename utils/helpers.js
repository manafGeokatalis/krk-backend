const db = require("../models")

module.exports.errorResponse = (message = 'Bad Request', code = 400) => {
  return {
    status: 'Error',
    code,
    message
  }
}
module.exports.successResponse = (message = 'Success', data = null, code = 200) => {
  return {
    status: 'Success',
    code,
    message,
    data
  }
}
module.exports.isEmail = (email) => {
  // Regular expression for a basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports.generateRandomChar = async (length = 10) => {
  // Define the length and character set for the registration number.
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Generate a random string of the specified length and character set.
  let registrationNumber = '';
  for (let i = 0; i < length; i++) {
    registrationNumber += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Check if the generated number is already in use.
  // (This is a simplified example, you may need a more robust database check)
  const usedRegistrationNumbers = await db.permohonan.count({ where: { registration_number: registrationNumber } });

  if (usedRegistrationNumbers) {
    this.generateRandomChar(length);
  }

  return registrationNumber;
}

module.exports.isExpired = (specificDate, minutes) => {
  // Get the current timestamp in milliseconds
  const now = Date.now();

  // Create a new Date object from the specific date
  const datePlusMinutes = new Date(specificDate);

  // Add the specified number of minutes to the date
  datePlusMinutes.setMinutes(datePlusMinutes.getMinutes() + minutes);

  // Get the timestamp of the date plus minutes
  const datePlusMinutesTimestamp = datePlusMinutes.getTime();

  // Return true if the date plus minutes is older than now, false otherwise
  return datePlusMinutesTimestamp < now;
}

module.exports.isGreaterThan = (firstDate, secondDate) => {
  const first = new Date(firstDate);
  const second = new Date(secondDate);

  return first.getTime() > second.getTime();
}