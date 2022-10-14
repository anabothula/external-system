const Pool = require("pg").Pool;

const pool = new Pool({
	user: process.env.DB_USERNAME || "postgres",
	host: process.env.DB_HOSTNAME || "localhost",
	database: "students",
	password: "srinu559",
	port: 5432,
});

module.exports = pool;
