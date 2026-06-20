const { poolPromise } = require('../src/config/db');

async function main() {
    try {
        const pool = await poolPromise;
        if (!pool) {
            console.log('Could not connect to database.');
            process.exit(1);
        }
        console.log('Adding columns to Users table...');
        
        // Check first if columns exist before adding them
        const result = await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Users]') AND name = 'firstName')
            BEGIN
                ALTER TABLE [dbo].[Users] ADD [firstName] NVARCHAR(100) NULL;
            END
            
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Users]') AND name = 'lastName')
            BEGIN
                ALTER TABLE [dbo].[Users] ADD [lastName] NVARCHAR(100) NULL;
            END
            
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[dbo].[Users]') AND name = 'phoneNumber')
            BEGIN
                ALTER TABLE [dbo].[Users] ADD [phoneNumber] NVARCHAR(50) NULL;
            END
        `);
        console.log('Columns added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error running script:', err);
        process.exit(1);
    }
}

main();
