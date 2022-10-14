const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
	user: process.env.DB_USERNAME,
	host: process.env.DB_HOSTNAME,
	database: process.env.DB_NAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
});

module.exports = pool;
