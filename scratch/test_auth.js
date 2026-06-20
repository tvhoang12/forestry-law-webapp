const { poolPromise } = require('../src/config/db');

// Helper to make POST requests using node's built-in fetch or falling back to http module
async function makePostRequest(url, data) {
    if (typeof fetch === 'function') {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const body = await res.json();
        return { status: res.status, body };
    } else {
        // Fallback using standard node http/https
        return new Promise((resolve, reject) => {
            const http = require('http');
            const urlObj = new URL(url);
            const postData = JSON.stringify(data);
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            const req = http.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => { responseData += chunk; });
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: JSON.parse(responseData) });
                    } catch (e) {
                        resolve({ status: res.statusCode, body: responseData });
                    }
                });
            });
            
            req.on('error', (err) => reject(err));
            req.write(postData);
            req.end();
        });
    }
}

async function runTests() {
    console.log('=== STARTING AUTHENTICATION LOGIC TESTS ===');
    const baseUrl = 'http://localhost:3000/api/user';
    
    // First, let's clean up any previous test user from database directly
    const pool = await poolPromise;
    if (!pool) {
        console.error('Failed to connect to database for pre-test cleanup.');
        process.exit(1);
    }
    await pool.request().query("DELETE FROM Users WHERE username = 'customer_test'");
    console.log('Cleaned up previous test users from DB.');

    let passedTests = 0;
    let failedTests = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`[PASS] ${message}`);
            passedTests++;
        } else {
            console.error(`[FAIL] ${message}`);
            failedTests++;
        }
    }

    try {
        // Test 1: Password too short
        let res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0987654321',
            email: 'test@example.com',
            password: 'Pass!', // too short
            reCheckPassword: 'Pass!'
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('dài tối thiểu 8 ký tự'), 
            'Reject password shorter than 8 characters');

        // Test 2: Password missing uppercase
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0987654321',
            email: 'test@example.com',
            password: 'password123!', // missing uppercase
            reCheckPassword: 'password123!'
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('in hoa'), 
            'Reject password missing uppercase letter');

        // Test 3: Password missing special char
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0987654321',
            email: 'test@example.com',
            password: 'Password123', // missing special char
            reCheckPassword: 'Password123'
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('ký tự đặc biệt'), 
            'Reject password missing special character');

        // Test 4: Password mismatch
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0987654321',
            email: 'test@example.com',
            password: 'Password123!',
            reCheckPassword: 'DifferentPassword123!' // mismatched
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('không khớp'), 
            'Reject mismatched confirm password');

        // Test 5: Phone number too short starting with 0
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '09876543', // 8 digits
            email: 'test@example.com',
            password: 'Password123!',
            reCheckPassword: 'Password123!'
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('Số điện thoại'), 
            'Reject invalid 0-prefixed phone number length');

        // Test 6: Phone number starting with +84 but wrong length (11 chars)
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+8498765432', // 11 chars
            email: 'test@example.com',
            password: 'Password123!',
            reCheckPassword: 'Password123!'
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('Số điện thoại'), 
            'Reject invalid +84-prefixed phone number length');

        // Test 7: Successful registration with forced customer role
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0987654321', // 10 digits
            email: 'test@example.com',
            password: 'Password123!',
            reCheckPassword: 'Password123!',
            role: 'admin' // Attempting to hijack role
        });
        assert(res.status === 201 && res.body.user && res.body.user.role === 'customer', 
            'Register valid user successfully and force role to customer');

        // Test 8: Register duplicate username
        res = await makePostRequest(`${baseUrl}/register`, {
            username: 'customer_test', // duplicate
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0987654321',
            email: 'test2@example.com',
            password: 'Password123!',
            reCheckPassword: 'Password123!'
        });
        assert(res.status === 400 && res.body.error && res.body.error.includes('đã tồn tại'), 
            'Reject duplicate username registration');

        // Test 9: Sign-in nonexistent username
        res = await makePostRequest(`${baseUrl}/login`, {
            username: 'nonexistent_user',
            password: 'Password123!'
        });
        assert(res.status === 400 && res.body.error === 'Người dùng không tồn tại', 
            'Sign-in rejection for nonexistent user');

        // Test 10: Sign-in wrong password
        res = await makePostRequest(`${baseUrl}/login`, {
            username: 'customer_test',
            password: 'WrongPassword123!'
        });
        assert(res.status === 400 && res.body.error === 'Password sai', 
            'Sign-in rejection for incorrect password');

        // Test 11: Successful sign-in
        res = await makePostRequest(`${baseUrl}/login`, {
            username: 'customer_test',
            password: 'Password123!'
        });
        assert(res.status === 200 && res.body.token && res.body.user.role === 'customer', 
            'Successful login returns JWT token and correct user details');

        // Test 12: Successful logout
        res = await makePostRequest(`${baseUrl}/logout`, {});
        assert(res.status === 200 && res.body.message.includes('Đăng xuất thành công'), 
            'Successful logout response');

    } catch (err) {
        console.error('Test execution failed with error:', err);
    } finally {
        // Cleanup test user
        await pool.request().query("DELETE FROM Users WHERE username = 'customer_test'");
        console.log('Cleaned up test user from DB.');
    }

    console.log(`\n=== TEST SUMMARY ===`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    if (failedTests > 0) {
        process.exit(1);
    } else {
        console.log('All tests passed successfully!');
        process.exit(0);
    }
}

runTests();
