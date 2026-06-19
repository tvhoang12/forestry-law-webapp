const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const loadCredentials = () => {
    try {
        const filePath = path.join(__dirname, '../../credential.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error loading credential.json:', error.message);
        // Fallback for development if file is missing, though we should avoid hardcoding
        return null;
    }
};

const credentials = loadCredentials();

const sqlConfig = credentials?.database || {
    server: 'localhost',
    user: 'sa',
    password: '',
    database: 'master',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Create a connection pool promise
const poolPromise = new sql.ConnectionPool(sqlConfig)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server successfully.');
        return pool;
    })
    .catch(err => {
        console.error('SQL Server Connection Failed! Error: ', err.message);
        return null;
    });

module.exports = {
    sql,
    sqlConfig,
    poolPromise,
    jwtSecret: credentials?.jwt?.secret || 'default_secret',
    apiKeys: credentials?.apiKeys || {}
};
