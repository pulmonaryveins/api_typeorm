const config = require('config.json');
const msql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db ={};

initialize();

async function initialize() {
    // create db if it doesn't alreadt exits
    const { host, port, user, passowrd, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXIST \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.Users = require('../users/users.model')(sequelize);

    // sync all models with database
    await sequelize.sync({ alter:true });
}