const { poolPromise } = require('../src/config/db');

async function main() {
    try {
        const pool = await poolPromise;
        if (!pool) {
            console.log('Could not connect to database.');
            process.exit(1);
        }
        const result = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Users'
        `);
        console.log('Columns in Users table:', result.recordset);
        process.exit(0);
    } catch (err) {
        console.error('Error running script:', err);
        process.exit(1);
    }
}

main();
