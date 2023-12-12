const Mailgen = require('mailgen');

module.exports.veriifyEmail = (name, link) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: process.env.APP_NAME,
      link: process.env.APP_URL
      // logo: 'https://mailgen.js/img/logo.png'
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

  // Generate an HTML email with the provided contents
  return mailGenerator.generate(email);
}