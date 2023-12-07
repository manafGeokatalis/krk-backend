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