import mysql from "mysql2/promise";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: pnpm admin:grant -- <Manus OAuth email>");
    process.exitCode = 2;
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is unavailable. Run this command in the SwiftShip project environment.");
    process.exitCode = 1;
    return;
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows] = await connection.execute(
      "SELECT `id`, `role` FROM `users` WHERE LOWER(`email`) = ? LIMIT 2",
      [email],
    );
    const accounts = rows as Array<{ id: number; role: "user" | "admin" }>;
    if (accounts.length === 0) {
      console.error("No signed-in account matches that email. The intended staff user must sign in once before promotion.");
      process.exitCode = 1;
      return;
    }
    if (accounts.length > 1) {
      console.error("More than one account matches that email. No role was changed; resolve the duplicate accounts first.");
      process.exitCode = 1;
      return;
    }
    if (accounts[0].role === "admin") {
      console.log("The matching account already has administrator access.");
      return;
    }

    await connection.execute("UPDATE `users` SET `role` = 'admin' WHERE `id` = ?", [accounts[0].id]);
    console.log("Administrator role granted to the matching Manus OAuth account.");
  } finally {
    await connection.end();
  }
}

void main().catch(() => {
  console.error("Admin promotion failed; inspect the project database state before retrying.");
  process.exitCode = 1;
});
