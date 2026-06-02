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

const s = fs.readFileSync(sqlPath, 'utf16le');
const lines = s.split(/\r?\n/);

db.serialize(() => {
    db.run("BEGIN TRANSACTION;");
    
    let insertCount = 0;
    for (const line of lines) {
        if (line.startsWith('INSERT ')) {
            let sql = line;
            // 1. Add INTO if missing
            sql = sql.replace(/^INSERT \[dbo\]\./, 'INSERT OR IGNORE INTO ');
            // 2. Remove N prefix from N'...'
            sql = sql.replace(/ N'/g, " '");
            // 3. Replace CAST(N'...' AS DateTime) and CAST(N'...' AS Date) with '...'
            sql = sql.replace(/CAST\('([^']+)' AS DateTime\)/gi, "'$1'");
            sql = sql.replace(/CAST\('([^']+)' AS Date\)/gi, "'$1'");
            // 4. Replace CAST(x AS Decimal(...)) with x
            sql = sql.replace(/CAST\(([^ ]+) AS Decimal\([^)]+\)\)/gi, "$1");
            
            db.run(sql, (err) => {
                if (err) {
                    console.error("Error: " + sql);
                    console.error(err.message);
                }
            });
            insertCount++;
        }
    }
    
    db.run("COMMIT;", (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Successfully executed ${insertCount} INSERT statements.`);
        }
        db.close();
    });
});
