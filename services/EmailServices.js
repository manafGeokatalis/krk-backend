const { jwt_secret } = require("../configs/auth");
const { transporter, mailOptions } = require("../configs/mail");
const { veriifyEmail } = require("../mailer/verifyEmail");
const jwt = require('jsonwebtoken');

class EmailServices {
  async sendEmailVerification(user) {
    const token = jwt.sign({ email: user.email }, jwt_secret, { expiresIn: '1d' });
    const email = veriifyEmail(user.name, `${process.env.APP_URL}${process.env.APP_PREFIX}/auth/verification-email?token=${token}`);
    return transporter.sendMail({
      ...mailOptions,
      to: user.email,
      subject: 'Verifikasi Email',
      html: email
    });
  }
}

module.exports = new EmailServices;