const { Pool } = require("pg");

console.log("Starting DB connection...");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "placementracker",
  password: "lokesh1975",
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database connection failed");
    console.log(err);
  });

module.exports = pool;