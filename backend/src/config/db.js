require('dotenv').config({ path: __dirname + '/../../../.env' });
const { Sequelize } = require('sequelize');

console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

module.exports = sequelize;
