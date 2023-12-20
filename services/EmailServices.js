const { jwt_secret } = require("../configs/auth");
const { transporter, mailOptions } = require("../configs/mail");
const { veriifyEmail, resetPassword } = require("../mailer/verifyEmail");
const jwt = require('jsonwebtoken');

class EmailServices {
  async sendEmailVerification(user) {
    const token = jwt.sign({ email: user.email, date: new Date() }, jwt_secret, { expiresIn: '1d' });
    const email = veriifyEmail(user.name, `${process.env.APP_WEB_URL}/verifikasi-email?token=${token}`);
    return transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: 'Verifikasi Email',
      html: email
    });
  }

  async sendEmailResetPassword(user) {
    const token = jwt.sign({ email: user.email, date: new Date() }, jwt_secret, { expiresIn: '1d' });
    const email = resetPassword(user.name, `${process.env.APP_WEB_URL}/reset-password?token=${token}`);
    return transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: 'Reset Password',
      html: email
    });
  }
}

module.exports = new EmailServices;