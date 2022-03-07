const { Sequelize } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize('buivantuan', 'root', null, {
  host: 'localhost',
  dialect:  'mysql',
  loging: false
});

let checkconnectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
module.exports = checkconnectDB;