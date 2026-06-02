const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = 'C:\\web\\HotelManagement\\database\\hotel.db';
const sqlPath = 'C:\\web\\HotelManagement\\database\\hotel.sql';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
});

const sql = fs.readFileSync(sqlPath, 'utf8');

db.exec(sql, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('SQL script executed successfully!');
    db.close();
});
