// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Necesario para Render
  }
});

pool.connect()
  .then(() => console.log("✅ Conectado a la base de datos PostgreSQL"))
  .catch(err => console.error("❌ Error de conexión:", err.message));

module.exports = pool;
