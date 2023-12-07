require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME || 'root',
    "password": process.env.DB_PASSWORD || 'password',
    "database": process.env.DB_DATABASE || 'pkkpr',
    "host": process.env.DB_HOST || '127.0.0.1',
    "port": process.env.DB_PORT || '3306',
    "dialect": process.env.DB_DIALECT || 'mysql',
    'timezone': process.env.DB_TIMEZONE || '+08:00',
    'logging': true,
  },
  "production": {
    "username": process.env.DB_USERNAME || 'root',
    "password": process.env.DB_PASSWORD || 'password',
    "database": process.env.DB_DATABASE || 'pkkpr',
    "host": process.env.DB_HOST || '127.0.0.1',
    "port": process.env.DB_PORT || '3306',
    "dialect": process.env.DB_DIALECT || 'mysql',
    'timezone': process.env.DB_TIMEZONE || '+08:00',
    'logging': false,
  }
}