const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL successfully!");
    await client.end();
  } catch (err) {
    console.error("❌ Database connection failed:");
    console.error(err);
  }
})();