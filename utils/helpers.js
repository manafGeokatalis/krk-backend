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

module.exports.sortingPermohonan = (order, orderBy, data) => {
  console.log(data, 'halo')
  if (!['asc', 'desc'].includes(order)) {
    throw new Error("Invalid order. Use 'ASC' or 'DESC'.");
  }

  if (!['name', 'created_at', 'step'].includes(orderBy)) {
    throw new Error("Invalid orderBy. Use 'name', 'created_at', or 'step'.");
  }

  const compareFn = (a, b) => {
    let valA, valB;

    if (orderBy === 'name') {
      valA = a.name || ''; // Ensure we handle null or undefined names
      valB = b.name || '';
    } else if (orderBy === 'created_at') {
      valA = new Date(a.createdAt);
      valB = new Date(b.createdAt);
    } else if (orderBy === 'step') {
      // const lastProgressA = a.permohonan_progresses[a.permohonan_progresses.length - 1];
      // const lastProgressB = b.permohonan_progresses[b.permohonan_progresses.length - 1];


      // // Handle the case where permohonan_progresses is empty or missing
      // const lastStepA = lastProgressA ? lastProgressA.step : 0;
      // const lastStepB = lastProgressB ? lastProgressB.step : 0;
      // console.log(lastStepA)
      // console.log(lastStepB)
      // valA = lastStepA;
      // valB = lastStepB;
      valA = a.last_step || 0;  // Using the pre-calculated last_step value
      valB = b.last_step || 0;
      if (order == 'asc') {
        return a.last_step - b.last_step

      } else {
        return b.last_step - a.last_step

      }
    }

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'desc' ? 1 : -1;
    // return 0;
  };
  return data.sort(compareFn);


}

module.exports.removeCircularReferences = (obj) => {
  const seen = new Set();

  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // If the object has already been seen, skip it to prevent circular reference
      if (value !== null && typeof value === 'object') {
        if (seen.has(value)) {
          return undefined; // Return undefined to remove the circular reference
        }
        seen.add(value);
      }
      return value;
    })
  );
}