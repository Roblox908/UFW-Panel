import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(process.cwd(), 'database'); 
const dbPath = path.join(dbDir, 'ufw-webui.db');

// Ensure the database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database;

try {
  db = new Database(dbPath, { });
  console.log('Connected to the SQLite database.');

  db.exec(`
    CREATE TABLE IF NOT EXISTS backends (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      apiKey TEXT NOT NULL, -- API Key is now mandatory
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Checked/Created 'backends' table.");

} catch (err: any) {
  console.error('Error connecting to or initializing SQLite database:', err.message);

}

export default db!; 
