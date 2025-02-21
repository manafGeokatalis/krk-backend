
const Mailgen = require('mailgen');

module.exports.updateStatus = (name, text, registrationCode) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: process.env.APP_NAME,
            link: process.env.APP_URL,
            // logo: process.env.APP_LOGO_URL || null
        }
    });
    const BASE_URL = process.env.SITE_ORIGIN || 'https://lodokmabar.manggaraibaratkab.go.id'
    const link = `${BASE_URL}/permohonan`;
    const email = {
        body: {
            name: name,
            intro: text,
            action: {
                instructions: `Silahkan mengecek status permohonan Anda dengan kode registrasi: ${registrationCode}`,
                button: {
                    color: '#4b96cc',
                    text: 'Cek Status Permohonan',
                    link
                }
            },
            outro: [
                'Jika tombol di atas tidak dapat diklik, silahkan copy dan paste alamat di bawah ini:',
                `<a href="${link}">${link}</a>`,
                'Jika Anda merasa tidak pernah mengajukan permohonan ini, abaikan atau hapus email ini.'
            ],
            signature: 'Terima Kasih'
        }
    };

    return mailGenerator.generate(email);
}