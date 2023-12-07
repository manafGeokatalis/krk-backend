const jwt_secret = process.env.APP_SECRET || 'pkkpr_secret_123';

const cookieConfigs = {
  httpOnly: true,
  maxAge: process.env.COOKIE_MAX_AGE || 30 * 24 * 60 * 60,
  path: process.env.COOKIE_PATH || '/',
  secure: process.env.COOKIE_SECURE === 'true' || false,
  sameSite: process.env.COOKIE_SAME_SITE || 'none',
};

module.exports = { jwt_secret, cookieConfigs };