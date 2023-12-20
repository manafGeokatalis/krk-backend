const Mailgen = require('mailgen');

module.exports.veriifyEmail = (name, link) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: process.env.APP_NAME,
      link: process.env.APP_URL,
      // logo: process.env.APP_LOGO_URL || null
    }
  });

  const email = {
    body: {
      name: name,
      intro: `Selamat datang di ${process.env.APP_NAME}`,
      action: {
        instructions: 'Silahkan verifikasi email Anda terlebih dahulu dengan mengklik tombol di bawah:',
        button: {
          color: '#4b96cc',
          text: 'Konfirmasi Email Anda',
          link
        }
      },
      outro: ['Jika tombol di atas tidak dapat diklik, silahkan copy dan paste alamat di bawah ini', `<a href="${link}">${link}</a>`],
      signature: 'Terima Kasih'
    }
  };

  return mailGenerator.generate(email);
}

module.exports.resetPassword = (name, link) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: process.env.APP_NAME,
      link: process.env.APP_URL,
      // logo: process.env.APP_LOGO_URL || null
    }
  });

  const email = {
    body: {
      name: name,
      intro: `Anda menerima email ini karena ingin mereset password di aplikasi ${process.env.APP_NAME}`,
      action: {
        instructions: 'Silahkan tombol di bawah untuk mereset password Anda:',
        button: {
          color: '#4b96cc',
          text: 'Reset Password',
          link
        }
      },
      outro: ['Jika tombol di atas tidak dapat diklik, silahkan copy dan paste alamat di bawah ini', `<a href="${link}">${link}</a>`, 'Jika Anda merasa tidak pernah meminta reset password, abaikan atau hapus email ini!'],
      signature: 'Terima Kasih'
    }
  };

  return mailGenerator.generate(email);
}