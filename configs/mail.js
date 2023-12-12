const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    ciphers: process.env.MAIL_CHIPERS || 'SSLv3'
  }
});

const mailOptions = {
  from: {
    name: process.env.MAIL_FROM_NAME,
    address: process.env.MAIL_FROM_ADDRESS
  },
  to: '',
  subject: '',
  html: ``,
};

module.exports = { transporter, mailOptions }