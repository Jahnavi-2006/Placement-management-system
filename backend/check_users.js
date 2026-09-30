const pool = require("./db");

async function main() {
  try {
    const res = await pool.query("SELECT user_id, username, password, role, studentid FROM users");
    console.log("Users in Database:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    await pool.end();
  }
}

main();
